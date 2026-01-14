# 블로그 도우미 (Blog Helper Tool)

블로그 작성을 위한 올인원 도구 모음입니다. 이미지 편집부터 SEO 최적화까지, 블로그 운영에 필요한 모든 기능을 제공합니다.

## ✨ 주요 기능

### 1. 이미지 원형 크롭
- 블로그 프로필 이미지나 썸네일을 원형으로 자르기
- 드래그 앤 드롭으로 쉬운 조작
- 실시간 미리보기
- PNG 형식으로 다운로드

### 2. 동영상 → GIF 변환
- 브라우저에서 직접 동영상을 GIF로 변환
- FFmpeg.wasm 사용 (서버 불필요)
- FPS 및 크기 조절 가능
- 실시간 진행률 표시

### 3. 무한도전 이미지 검색
- 카테고리 입력 시 자동으로 "무한도전 + 카테고리" 검색
- 빠른 카테고리 선택 버튼
- 구글 이미지 검색 자동 실행

### 4. 태그/해시태그 자동 생성
- 블로그 글 내용 분석
- 자동으로 관련 태그 추천
- 해시태그 형식으로 자동 변환
- 한 번의 클릭으로 복사

### 5. SEO 제목 변환
- 일반 제목을 검색 최적화된 제목으로 변환
- 다양한 제목 유형 제공 (가이드형, 리스트형, 후기형 등)
- 여러 제목 옵션 자동 생성
- SEO 키워드 제안

## 🚀 시작하기

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/bloger_hyeoz.git

# 디렉토리 이동
cd bloger_hyeoz

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 🛠️ 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Image Processing**: react-easy-crop
- **Video Processing**: FFmpeg.wasm
- **Icons**: Lucide React

## 📁 프로젝트 구조

```
bloger_hyeoz/
├── app/                      # Next.js App Router
│   ├── image-crop/          # 이미지 크롭 페이지
│   ├── video-to-gif/        # 동영상 변환 페이지
│   ├── image-search/        # 이미지 검색 페이지
│   ├── tag-generator/       # 태그 생성 페이지
│   ├── seo-title/           # SEO 제목 페이지
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 홈 페이지
├── components/              # React 컴포넌트
│   ├── Navigation.tsx       # 네비게이션
│   ├── ImageCropper.tsx     # 이미지 크롭 컴포넌트
│   ├── VideoToGif.tsx       # 동영상 변환 컴포넌트
│   ├── ImageSearch.tsx      # 이미지 검색 컴포넌트
│   ├── TagGenerator.tsx     # 태그 생성 컴포넌트
│   └── SeoTitleConverter.tsx # SEO 제목 컴포넌트
└── FEATURES_AND_MONETIZATION.md  # 추가 기능 및 수익화 계획
```

## 🎯 향후 계획

자세한 추가 기능 제안과 수익화 계획은 [FEATURES_AND_MONETIZATION.md](./FEATURES_AND_MONETIZATION.md)를 참고하세요.

### 단기 (1-3개월)
- 이미지 일괄 리사이징
- 워터마크 자동 삽입
- 이미지 압축 도구

### 중기 (3-6개월)
- 사용자 계정 시스템
- 프리미엄 구독 모델
- AI 기반 글 요약

### 장기 (6-12개월)
- 협업 기능
- 모바일 앱
- 화이트라벨 솔루션

## 📝 라이선스

MIT License

## 🤝 기여

기여를 환영합니다! 이슈나 풀 리퀘스트를 자유롭게 제출해주세요.

## 📧 문의

프로젝트에 대한 질문이나 제안이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ for Korean Bloggers**
