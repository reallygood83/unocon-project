# Unicon(유니콘) - 초등 통일 교육 플랫폼

초등학생을 위한 대화형 통일 교육 웹 플랫폼입니다. 다양한 상호작용 활동을 통해 통일과 평화의 가치를 배울 수 있습니다.

## 프로젝트 소개

유니콘(Unicon)은 '통일(Unification)'과 '연결(Connection)'의 합성어로, 초등학생들이 통일과 평화의 가치를 재미있고 의미 있게 배울 수 있도록 돕는 교육 플랫폼입니다.

### 주요 기능

1. **읽어보며 통일 알아보기**
   - 통일 관련 읽기 자료와 퀴즈
   - Naver Search API 활용 콘텐츠 제공

2. **영상으로 통일 알아보기**
   - 통일 관련 영상과 퀴즈
   - YouTube Data API 활용 콘텐츠 제공

3. **UN참전국 감사편지 보내기**
   - 한국전쟁 참전국에 대한 정보 제공
   - 감사 편지 작성 및 저장

## 기술 스택

- **프론트엔드**: React, React Router
- **백엔드**: Supabase (PostgreSQL)
- **API**: Naver Search API, YouTube Data API, Gemini 2.0 Flash API
- **배포**: Vercel

## 시작하기

### 필수 조건

- Node.js 18.0.0 이상
- npm 9.0.0 이상

### 설치 및 실행

1. 저장소 클론하기
   ```bash
   git clone https://github.com/your-username/unicon-project.git
   cd unicon-project
   ```

2. 의존성 설치하기
   ```bash
   npm install
   ```

3. 환경 변수 설정하기
   `.env` 파일을 프로젝트 루트에 생성하고 다음 변수들을 설정합니다:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_NAVER_CLIENT_ID=your-naver-client-id
   VITE_NAVER_CLIENT_SECRET=your-naver-client-secret
   VITE_YOUTUBE_API_KEY=your-youtube-api-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. 개발 서버 실행하기
   ```bash
   npm run dev
   ```

5. 빌드하기
   ```bash
   npm run build
   ```

## 프로젝트 구조

```
unicon-project/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ReadingPage.jsx
│   │   ├── VideoPage.jsx
│   │   ├── LetterPage.jsx
│   │   └── ...
│   ├── services/
│   │   ├── supabase.js
│   │   ├── naverApi.js
│   │   ├── youtubeApi.js
│   │   ├── geminiApi.js
│   │   └── ...
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 라이선스

MIT

## 감사의 말

이 프로젝트는 통일부 통일교육원의 자료를 활용하여 제작되었습니다.