# Unicon(유니콘) 개발 가이드

이 문서는 Unicon(초등 통일 교육 플랫폼) 개발 및 유지보수를 위한 참고 사항을 제공합니다.

## 업데이트 내역

### 2024-05-11 - API 호출 개선 (진행 중)

1. **Vercel Serverless Functions 추가**
   - CORS 문제 해결을 위한 서버리스 함수 구현
   - 총 3개 함수 구현: `naver-search.js`, `youtube-search.js`, `youtube-details.js`
   - 프론트엔드에서 백엔드 API로 요청을 중계하여 CORS 문제 해결

2. **API 호출 방식 개선**
   - Naver Search API 호출 시 서버리스 함수 사용으로 변경
   - YouTube API 호출 시 서버리스 함수 사용으로 변경
   - API 키 보안 강화 (클라이언트에서 환경 변수 직접 사용하지 않음)

3. **경로 추가**
   - `/teacher/videos/new` 및 `/teacher/videos/edit/:id` 경로 추가
   - `TeacherVideoFormPage` 컴포넌트 구현

### 2024-05-11 - 현재 발견된 문제점과 향후 과제

1. **배포 환경 설정 문제**
   - Vercel 환경변수가 올바르게 설정되지 않아 서버리스 함수 내에서 API 키 접근 실패
   - API 경로 설정 문제 (상대 경로가 배포 환경에서 제대로 동작하지 않음)
   - 500 서버 오류 발생 (환경변수 미설정 또는 서버리스 함수 구성 문제)

2. **이미지 경로 문제**
   - `hqdefault.jpg` 404 오류 - 썸네일 URL 경로 수정 필요
   - HTTP/HTTPS 프로토콜 혼합 사용 문제

3. **해결 방안**
   - Vercel 대시보드에서 환경변수 올바르게 설정
   - 폴백 데이터의 이미지 URL을 HTTPS로 통일하고 유효한 URL 확보
   - API 경로 설정을 배포 환경에 맞게 조정

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
   - 환경 변수: `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` (Vercel 서버리스 함수에서 사용)
   - 서버리스 함수: `/api/naver-search.js`
   - 프론트엔드 경로: `/api/naver-search?query=검색어`
   - 관련 파일: `/src/services/naverApi.js`

2. **YouTube Data API**
   - 환경 변수: `YOUTUBE_API_KEY` (Vercel 서버리스 함수에서 사용)
   - 서버리스 함수:
     - `/api/youtube-search.js` (영상 검색)
     - `/api/youtube-details.js` (영상 상세 정보)
   - 프론트엔드 경로:
     - `/api/youtube-search?query=검색어&maxResults=8`
     - `/api/youtube-details?videoId=비디오ID`
   - 관련 파일: `/src/services/youtubeApi.js`

3. **Gemini API (Google AI)**
   - 환경 변수: `VITE_GEMINI_API_KEY` (아직 프론트엔드에서 직접 사용)
   - 기본 엔드포인트: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash:generateContent`
   - 관련 파일: `/src/services/geminiApi.js`
   - 향후 계획: Gemini API 호출도 서버리스 함수로 이전 필요

4. **Supabase**
   - 환경 변수: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - 관련 파일: `/src/services/supabase.js`

## 배포 정보

- 배포 플랫폼: Vercel
- 환경 변수: Vercel 대시보드의 "Settings" > "Environment Variables"에서 설정
- 서버리스 함수: `/api` 디렉토리에 위치 (Vercel이 자동으로 인식)

### Vercel 환경 변수 설정 필요
- `NAVER_CLIENT_ID`: 네이버 개발자 센터에서 발급받은 클라이언트 ID
- `NAVER_CLIENT_SECRET`: 네이버 개발자 센터에서 발급받은 클라이언트 시크릿
- `YOUTUBE_API_KEY`: Google Developer Console에서 발급받은 YouTube Data API 키
- `GEMINI_API_KEY`: Google AI Studio에서 발급받은 Gemini API 키

### 배포 시 알려진 문제점
1. **API 호출 관련**
   - 서버리스 함수가 환경변수를 찾지 못하면 500 에러 발생
   - 폴백 데이터는 정상 작동하나 실제 API 호출은 현재 실패

2. **이미지 경로 문제**
   - 일부 썸네일 이미지 404 오류
   - 이미지 경로를 수정하거나 대체 이미지 제공 필요

3. **기능 제한**
   - 현재 모든 API 호출은 폴백 데이터로 대체되어 작동
   - 실제 데이터 대신 더미 데이터가 표시됨

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