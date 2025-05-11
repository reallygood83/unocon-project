# Unicon(유니콘) 개발 가이드

이 문서는 Unicon(초등 통일 교육 플랫폼) 개발 및 유지보수를 위한 참고 사항을 제공합니다.

## 핵심 기능

### 콘텐츠 검색 및 생성

1. **문헌자료 검색 및 퀴즈 생성**
   - Naver Search API를 통해 통일 교육 관련 자료 검색
   - Gemini API를 활용하여 검색된 자료로 자동 퀴즈 생성
   - 교사 페이지의 `/teacher/reading/search` 경로에서 접근 가능

2. **유튜브 영상 검색 및 퀴즈 생성**
   - YouTube Data API를 통해 통일 교육 관련 영상 검색
   - Gemini API를 활용하여 영상 내용 기반 자동 퀴즈 생성
   - 교사 페이지의 `/teacher/videos/search` 경로에서 접근 가능

3. **UN참전국 정보 관리**
   - UN참전국에 대한 정보 조회, 추가, 수정
   - 교사 페이지의 `/teacher/countries` 경로에서 관리

## API 연동

1. **Naver Search API**
   - 환경 변수: `VITE_NAVER_CLIENT_ID`, `VITE_NAVER_CLIENT_SECRET`
   - 기본 엔드포인트: `https://openapi.naver.com/v1/search/webkr`
   - 관련 파일: `/src/services/naverApi.js`

2. **YouTube Data API**
   - 환경 변수: `VITE_YOUTUBE_API_KEY`
   - 기본 엔드포인트: `https://www.googleapis.com/youtube/v3/search`
   - 관련 파일: `/src/services/youtubeApi.js`

3. **Gemini API (Google AI)**
   - 환경 변수: `VITE_GEMINI_API_KEY`
   - 기본 엔드포인트: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash:generateContent`
   - 관련 파일: `/src/services/geminiApi.js`

4. **Supabase**
   - 환경 변수: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - 관련 파일: `/src/services/supabase.js`

## 배포 정보

- 배포 플랫폼: Vercel
- 환경 변수: Vercel 대시보드의 "Settings" > "Environment Variables"에서 설정

## 교사 관리 페이지

- 경로: `/teacher`
- 비밀번호: `19500625` (한국전쟁 발발일)
- 로그인 없이 비밀번호만으로 접근 가능

## 개발 환경 설정

1. 저장소 클론:
   ```bash
   git clone https://github.com/reallygood83/unocon-project.git
   cd unocon-project
   ```

2. 의존성 설치:
   ```bash
   npm install
   ```

3. 환경 변수 설정 (.env 파일):
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_NAVER_CLIENT_ID=your-naver-client-id
   VITE_NAVER_CLIENT_SECRET=your-naver-client-secret
   VITE_YOUTUBE_API_KEY=your-youtube-api-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. 개발 서버 실행:
   ```bash
   npm run dev
   ```

5. 빌드:
   ```bash
   npm run build
   ```