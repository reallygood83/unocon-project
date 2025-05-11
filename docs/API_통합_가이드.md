# Unicon(유니콘) 초등 통일 교육 플랫폼 API 통합 가이드

## 목차
1. [개요](#개요)
2. [Supabase 백엔드 설정](#supabase-백엔드-설정)
3. [Naver Search API 통합](#naver-search-api-통합)
4. [YouTube API 통합](#youtube-api-통합)
5. [Gemini 2.0 Flash API 통합](#gemini-20-flash-api-통합)
6. [에러 처리 및 장애 복구 전략](#에러-처리-및-장애-복구-전략)
7. [API 요청 제한 및 최적화](#api-요청-제한-및-최적화)

---

## 개요

Unicon(유니콘) 플랫폼은 다양한 외부 API를 통합하여 초등학생을 위한 통일 교육 콘텐츠를 제공합니다. 이 문서는 다음 세 가지 주요 API 통합에 대한 상세한
구현 가이드를 제공합니다:

1. **Naver Search API**: 읽기 자료 검색 및 제공
2. **YouTube Data API**: 통일 교육 관련 영상 검색 및 재생
3. **Gemini 2.0 Flash API**: AI 기반 퀴즈 생성 및 콘텐츠 분석

백엔드 데이터 저장소로는 **Supabase**를 활용합니다.

---

## Supabase 백엔드 설정

### 1. 프로젝트 설정

1. Supabase 계정 생성 및 로그인
2. 새 프로젝트 생성
   - 프로젝트 이름: `unicon-platform`
   - 데이터베이스 비밀번호 설정
   - 지역 선택: 가능한 한국과 가까운 리전
3. 데이터베이스 스키마 설정
   - [데이터_모델.md](./데이터_모델.md) 문서의 테이블 스키마 참조

### 2. 인증 설정

```javascript
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 교사 로그인 함수
export const teacherLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

// 학생 접근 코드 인증
export const studentAccess = async (accessCode) => {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, grade')
    .eq('access_code', accessCode)
    .single();
    
  return { data, error };
};
```

### 3. 데이터 접근 보안 설정

Supabase RLS(Row Level Security) 정책 예시:

```sql
-- 학생은 자신의 진행 상황만 볼 수 있음
CREATE POLICY "학생은 자신의 진행 상황만 볼 수 있음"
ON public.user_progress
FOR SELECT
USING (auth.uid() = user_id);

-- 교사는 자신의 학급 학생의 진행 상황만 볼 수 있음
CREATE POLICY "교사는 학급 학생 진행 상황만 볼 수 있음"
ON public.user_progress
FOR SELECT
USING (
  auth.uid() IN (
    SELECT teacher_id
    FROM classes c
    JOIN users u ON c.id = u.class_id
    WHERE u.id = user_progress.user_id
  )
);
```

### 4. 기본 데이터 호출 함수

```javascript
// src/services/dataService.js
import { supabase } from './supabase';

// 읽기 자료 목록 조회
export const getReadingMaterials = async (gradeLevel) => {
  let query = supabase
    .from('reading_materials')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (gradeLevel) {
    query = query.eq('grade_level', gradeLevel);
  }
  
  const { data, error } = await query;
  return { data, error };
};

// 특정 읽기 자료 조회
export const getReadingMaterial = async (id) => {
  const { data, error } = await supabase
    .from('reading_materials')
    .select('*, quizzes(*)')
    .eq('id', id)
    .single();
    
  return { data, error };
};

// 진행 상황 업데이트
export const updateProgress = async (progressData) => {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert(progressData)
    .select();
    
  return { data, error };
};
```

---

## Naver Search API 통합

### 1. API 키 설정

1. [Naver Developers](https://developers.naver.com/main/) 가입
2. 애플리케이션 등록 및 API 사용 설정
   - 애플리케이션 이름: `Unicon Platform`
   - 사용 API: `검색`
3. 발급받은 클라이언트 ID와 시크릿 환경 변수에 설정

```
VITE_NAVER_CLIENT_ID=your-client-id
VITE_NAVER_CLIENT_SECRET=your-client-secret
```

### 2. API 호출 함수 구현

```javascript
// src/services/naverApi.js
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET;

// 프록시 서버를 통한 호출 (CORS 회피 및 API 키 보호)
const API_PROXY_URL = '/api/naver-search';

// 통일 교육 관련 콘텐츠 검색
export const searchUnificationContent = async (query, display = 10, start = 1, sort = 'sim') => {
  try {
    const response = await fetch(`${API_PROXY_URL}?query=${encodeURIComponent('통일 교육 ' + query)}&display=${display}&start=${start}&sort=${sort}`);
    
    if (!response.ok) {
      throw new Error('네이버 API 요청 실패');
    }
    
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('검색 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 연령에 적합한 결과만 필터링
export const filterAgeAppropriate = (results, maxDifficulty = 3) => {
  // 간단한 텍스트 복잡성 측정 (실제 구현은 더 정교해야 함)
  const calculateComplexity = (text) => {
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const longWords = words.filter(word => word.length > 5).length;
    const longWordRatio = longWords / words.length;
    
    // 1-5 척도의 복잡성 점수
    return Math.min(5, Math.round((avgWordLength * 0.6 + longWordRatio * 4) * 1.2));
  };
  
  return results.filter(item => {
    const complexity = calculateComplexity(item.description);
    return complexity <= maxDifficulty;
  });
};
```

### 3. 서버리스 함수 (Supabase Edge Functions)

```javascript
// supabase/functions/naver-search/index.js
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  const url = new URL(req.url);
  const query = url.searchParams.get('query');
  const display = url.searchParams.get('display') || 10;
  const start = url.searchParams.get('start') || 1;
  const sort = url.searchParams.get('sort') || 'sim';
  
  if (!query) {
    return new Response(
      JSON.stringify({ error: '검색어가 필요합니다' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  try {
    const naverResponse = await fetch(
      `https://openapi.naver.com/v1/search/webkr?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`, 
      {
        headers: {
          'X-Naver-Client-Id': Deno.env.get('NAVER_CLIENT_ID'),
          'X-Naver-Client-Secret': Deno.env.get('NAVER_CLIENT_SECRET'),
        }
      }
    );
    
    const naverData = await naverResponse.json();
    
    return new Response(
      JSON.stringify(naverData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

---

## YouTube API 통합

### 1. API 키 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 가입
2. 새 프로젝트 생성 및 YouTube Data API v3 활성화
3. API 키 생성 및 환경 변수에 설정

```
VITE_YOUTUBE_API_KEY=your-youtube-api-key
```

### 2. API 호출 함수 구현

```javascript
// src/services/youtubeApi.js
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// 안전한 채널 ID 목록 (검증된 통일 교육 콘텐츠 제공자)
const SAFE_CHANNEL_IDS = [
  'UC9ftsObOaXJDEO76yXX9EIw', // 통일부 통일교육원
  'UCO_DuPOFEDLoTWnWYtpkohQ', // EBS 키즈
  'add-more-verified-channels',
];

// 통일 교육 관련 영상 검색
export const searchUnificationVideos = async (query, maxResults = 10) => {
  try {
    // 통일 교육 관련 키워드와 함께 검색
    const searchQuery = `통일 교육 초등학생 ${query}`;
    
    // 안전한 채널만 포함하는 쿼리 빌드
    const channelFilter = SAFE_CHANNEL_IDS.map(id => `channel=${id}`).join('|');
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}&${channelFilter}&safeSearch=strict&relevanceLanguage=ko`
    );
    
    if (!response.ok) {
      throw new Error('YouTube API 요청 실패');
    }
    
    const data = await response.json();
    
    // 필터링 및 데이터 가공
    const formattedResults = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
    
    return {
      success: true,
      data: formattedResults
    };
  } catch (error) {
    console.error('YouTube 검색 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 특정 영상 상세 정보 조회
export const getVideoDetails = async (videoId) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('YouTube 비디오 정보 요청 실패');
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('영상을 찾을 수 없습니다');
    }
    
    // 필요한 데이터만 추출
    const videoInfo = {
      id: data.items[0].id,
      title: data.items[0].snippet.title,
      description: data.items[0].snippet.description,
      publishedAt: data.items[0].snippet.publishedAt,
      channelTitle: data.items[0].snippet.channelTitle,
      viewCount: data.items[0].statistics.viewCount,
      duration: data.items[0].contentDetails.duration, // ISO 8601 형식
    };
    
    return {
      success: true,
      data: videoInfo
    };
  } catch (error) {
    console.error('영상 정보 조회 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

### 3. 영상 캐싱 및 메타데이터 저장

```javascript
// src/services/videoCache.js
import { supabase } from './supabase';
import { getVideoDetails } from './youtubeApi';

// 영상 메타데이터 캐싱 및 업데이트
export const cacheVideoMetadata = async (videoId, gradeLevel = null) => {
  try {
    // 이미 캐싱된 영상인지 확인
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id, updated_at')
      .eq('youtube_id', videoId)
      .single();
    
    // 24시간 이내에 업데이트된 경우 스킵
    if (existingVideo && new Date(existingVideo.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return { success: true, data: { id: existingVideo.id, cached: true } };
    }
    
    // YouTube API로 최신 데이터 조회
    const { success, data: videoDetails, error } = await getVideoDetails(videoId);
    
    if (!success) {
      throw new Error(error);
    }
    
    // 데이터베이스에 저장 또는 업데이트
    const { data, error: supabaseError } = await supabase
      .from('videos')
      .upsert({
        youtube_id: videoId,
        title: videoDetails.title,
        description: videoDetails.description,
        thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        source: videoDetails.channelTitle,
        grade_level: gradeLevel,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (supabaseError) {
      throw new Error(supabaseError.message);
    }
    
    return {
      success: true,
      data: { id: data[0].id, cached: false }
    };
  } catch (error) {
    console.error('영상 캐싱 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

## Gemini 2.0 Flash API 통합

### 1. API 키 설정

1. [Google AI Studio](https://makersuite.google.com/) 가입
2. Gemini API 키 발급 및 환경 변수에 설정

```
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 2. API 호출 함수 구현

```javascript
// src/services/geminiApi.js
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash:generateContent';

// 콘텐츠 기반 퀴즈 생성
export const generateQuizQuestions = async (content, numberOfQuestions = 3, gradeLevel = 3) => {
  try {
    // 프롬프트 구성 - 학년 수준에 맞는 퀴즈 생성 요청
    const prompt = `
다음 콘텐츠를 읽고 한국 초등학교 ${gradeLevel}학년 수준에 적합한 객관식 퀴즈 ${numberOfQuestions}개를 생성해주세요. 
각 퀴즈는 질문과 4개의 선택지, 그리고 정답 번호(0-3)로 구성해주세요.
내용은 한국 통일 교육과 관련된 것으로, 아이들이 이해하기 쉽고 긍정적인 방식으로 작성해주세요.

콘텐츠:
${content}

JSON 형식으로 다음과 같이 반환해주세요:
{
  "questions": [
    {
      "question": "질문 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 정답번호(0-3)
    },
    ...
  ]
}
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Gemini API 요청 실패');
    }

    const responseData = await response.json();
    
    // 응답에서 JSON 추출
    const textResponse = responseData.candidates[0].content.parts[0].text;
    const jsonStartIndex = textResponse.indexOf('{');
    const jsonEndIndex = textResponse.lastIndexOf('}') + 1;
    const jsonString = textResponse.substring(jsonStartIndex, jsonEndIndex);
    
    // JSON 파싱
    const quizData = JSON.parse(jsonString);
    
    return {
      success: true,
      data: quizData
    };
  } catch (error) {
    console.error('퀴즈 생성 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 편지 내용 분석
export const analyzeLetterContent = async (letterContent, countryName) => {
  try {
    // 프롬프트 구성 - 편지 내용 분석 요청
    const prompt = `
다음은 초등학생이 ${countryName}에 보내는 한국전쟁 참전 감사 편지입니다. 
이 편지의 내용을 분석하고, 다음 항목을 JSON 형식으로 반환해주세요:

1. sentiment: 편지의 전반적인 감정 (positive, neutral, negative)
2. themes: 편지에서 언급된 주요 주제 (문자열 배열, 최대 3개)
3. suggestions: 편지를 개선하기 위한 간단한 제안 (초등학생 수준에 맞게)

편지 내용:
${letterContent}

JSON 형식으로 반환:
{
  "sentiment": "감정",
  "themes": ["주제1", "주제2", "주제3"],
  "suggestions": "개선 제안"
}
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Gemini API 요청 실패');
    }

    const responseData = await response.json();
    
    // 응답에서 JSON 추출
    const textResponse = responseData.candidates[0].content.parts[0].text;
    const jsonStartIndex = textResponse.indexOf('{');
    const jsonEndIndex = textResponse.lastIndexOf('}') + 1;
    const jsonString = textResponse.substring(jsonStartIndex, jsonEndIndex);
    
    // JSON 파싱
    const analysisData = JSON.parse(jsonString);
    
    return {
      success: true,
      data: analysisData
    };
  } catch (error) {
    console.error('편지 분석 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

### 3. 퀴즈 생성 및 저장 관리

```javascript
// src/services/quizManager.js
import { supabase } from './supabase';
import { generateQuizQuestions } from './geminiApi';
import { searchUnificationContent } from './naverApi';

// 읽기 자료 기반 퀴즈 생성 및 저장
export const createAndSaveQuizForMaterial = async (materialId, gradeLevel = 3) => {
  try {
    // 자료 내용 조회
    const { data: material, error: materialError } = await supabase
      .from('reading_materials')
      .select('content, title')
      .eq('id', materialId)
      .single();
      
    if (materialError) {
      throw new Error(materialError.message);
    }
    
    // 이미 퀴즈가 있는지 확인
    const { data: existingQuizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('material_id', materialId);
      
    if (quizError) {
      throw new Error(quizError.message);
    }
    
    // 이미 충분한 퀴즈가 있으면 스킵
    if (existingQuizzes && existingQuizzes.length >= 3) {
      return {
        success: true,
        data: { message: '이미 충분한 퀴즈가 있습니다', quizCount: existingQuizzes.length }
      };
    }
    
    // 내용에 기반한 퀴즈 생성
    const { success, data: quizData, error } = await generateQuizQuestions(
      `${material.title}\n\n${material.content}`, 
      3, // 각 자료당 3개 퀴즈
      gradeLevel
    );
    
    if (!success) {
      throw new Error(error);
    }
    
    // 생성된 퀴즈 저장
    const quizzesToInsert = quizData.questions.map(q => ({
      question: q.question,
      options: q.options,
      correct_answer: q.answer,
      material_id: materialId,
      difficulty: gradeLevel,
    }));
    
    const { data: insertedQuizzes, error: insertError } = await supabase
      .from('quizzes')
      .insert(quizzesToInsert)
      .select();
      
    if (insertError) {
      throw new Error(insertError.message);
    }
    
    return {
      success: true,
      data: { quizzes: insertedQuizzes }
    };
  } catch (error) {
    console.error('퀴즈 생성 및 저장 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

## 에러 처리 및 장애 복구 전략

### 1. API 요청 재시도 기능

```javascript
// src/utils/apiUtils.js
// 지수 백오프 재시도 함수
export const retryWithExponentialBackoff = async (
  fn, 
  maxRetries = 3, 
  baseDelayMs = 1000
) => {
  let retries = 0;
  let lastError;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      retries++;
      
      if (retries >= maxRetries) break;
      
      // 지수 백오프 + 약간의 랜덤성 추가
      const delayMs = baseDelayMs * Math.pow(2, retries) + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError;
};

// API 호출 래퍼 함수
export const safeApiCall = async (apiCall, fallbackData = null) => {
  try {
    const result = await retryWithExponentialBackoff(apiCall);
    return result;
  } catch (error) {
    console.error('API 호출 실패:', error);
    return { success: false, error: error.message, data: fallbackData };
  }
};
```

### 2. 장애 대응 전략

```javascript
// src/services/fallbackService.js
import { supabase } from './supabase';

// API 장애 시 로컬/캐시 데이터 제공
export const getFallbackReadingMaterials = async (gradeLevel) => {
  try {
    // 로컬 데이터베이스에서 기본 제공 자료 조회
    let query = supabase
      .from('reading_materials')
      .select('*')
      .eq('is_fallback', true)
      .order('created_at', { ascending: false });
      
    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      data,
      isFallback: true
    };
  } catch (error) {
    console.error('폴백 데이터 조회 오류:', error);
    
    // 하드코딩된 최소 데이터 반환 (최후의 수단)
    return {
      success: true,
      data: [
        {
          id: 'fallback-1',
          title: '한반도의 평화와 통일',
          content: '통일은 우리 민족의 염원입니다. 남과 북이 하나 되어 평화롭게 지내는 것은 모두의 바람입니다...',
          grade_level: 3,
          is_fallback: true
        },
        // 몇 개의 추가 폴백 자료
      ],
      isFallback: true,
      isHardcoded: true
    };
  }
};
```

---

## API 요청 제한 및 최적화

### 1. 요청 제한 관리

```javascript
// src/utils/rateLimiter.js
// 간단한 요청 제한 관리 클래스
export class ApiRateLimiter {
  constructor(maxRequestsPerMinute) {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.requestTimestamps = [];
  }
  
  // 요청 가능 여부 확인
  canMakeRequest() {
    const now = Date.now();
    // 1분 이상 지난 타임스탬프 제거
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < 60000
    );
    
    return this.requestTimestamps.length < this.maxRequestsPerMinute;
  }
  
  // 요청 기록
  recordRequest() {
    this.requestTimestamps.push(Date.now());
  }
  
  // 다음 요청 가능 시간 계산 (밀리초)
  getNextRequestDelay() {
    if (this.canMakeRequest()) return 0;
    
    const now = Date.now();
    const oldestTimestamp = this.requestTimestamps[0];
    return Math.max(0, 60000 - (now - oldestTimestamp));
  }
}

// API별 제한 관리자
export const rateLimiters = {
  naver: new ApiRateLimiter(10), // 분당 10회
  youtube: new ApiRateLimiter(5), // 분당 5회
  gemini: new ApiRateLimiter(15)  // 분당 15회
};

// 제한 관리 래퍼 함수
export const withRateLimit = async (apiName, apiCallFn) => {
  const limiter = rateLimiters[apiName];
  
  if (!limiter) {
    return apiCallFn();
  }
  
  if (!limiter.canMakeRequest()) {
    const delay = limiter.getNextRequestDelay();
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  limiter.recordRequest();
  return apiCallFn();
};
```

### 2. 데이터 캐싱 전략

```javascript
// src/utils/cacheManager.js
// 로컬 스토리지 캐시 관리
export class LocalStorageCache {
  constructor(prefix, defaultExpiryMinutes = 60) {
    this.prefix = prefix;
    this.defaultExpiryMinutes = defaultExpiryMinutes;
  }
  
  // 키 생성
  getKey(key) {
    return `${this.prefix}_${key}`;
  }
  
  // 데이터 저장
  set(key, data, expiryMinutes = this.defaultExpiryMinutes) {
    const fullKey = this.getKey(key);
    const item = {
      data,
      expiry: Date.now() + expiryMinutes * 60 * 1000
    };
    
    localStorage.setItem(fullKey, JSON.stringify(item));
  }
  
  // 데이터 조회
  get(key) {
    const fullKey = this.getKey(key);
    const item = localStorage.getItem(fullKey);
    
    if (!item) return null;
    
    try {
      const parsed = JSON.parse(item);
      
      // 만료 체크
      if (parsed.expiry < Date.now()) {
        localStorage.removeItem(fullKey);
        return null;
      }
      
      return parsed.data;
    } catch (e) {
      localStorage.removeItem(fullKey);
      return null;
    }
  }
  
  // 데이터 삭제
  remove(key) {
    const fullKey = this.getKey(key);
    localStorage.removeItem(fullKey);
  }
  
  // 모든 캐시 데이터 삭제
  clear() {
    const keys = Object.keys(localStorage).filter(
      key => key.startsWith(this.prefix)
    );
    
    keys.forEach(key => localStorage.removeItem(key));
  }
  
  // 만료된 항목 정리
  cleanup() {
    const keys = Object.keys(localStorage).filter(
      key => key.startsWith(this.prefix)
    );
    
    keys.forEach(key => {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item.expiry < Date.now()) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // 손상된 항목 제거
        localStorage.removeItem(key);
      }
    });
  }
}

// API별 캐시 관리자
export const caches = {
  naverSearch: new LocalStorageCache('naver_search', 120), // 2시간
  youtubeVideos: new LocalStorageCache('youtube_videos', 1440), // 24시간
  quizzes: new LocalStorageCache('quizzes', 10080), // 1주일
};

// 캐시 래핑 함수
export const withCache = async (cacheName, key, fetchFn, expiryMinutes) => {
  const cache = caches[cacheName];
  
  if (!cache) {
    return fetchFn();
  }
  
  // 캐시 조회
  const cachedData = cache.get(key);
  if (cachedData) {
    return {
      ...cachedData,
      fromCache: true
    };
  }
  
  // 데이터 조회
  const result = await fetchFn();
  
  // 성공한 경우에만 캐시
  if (result.success) {
    cache.set(key, result, expiryMinutes);
  }
  
  return result;
};