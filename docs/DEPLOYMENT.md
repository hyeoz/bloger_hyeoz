# 프로젝트 배포 가이드

이 문서는 Bloger Hyeoz 프로젝트를 배포하는 가장 쉬운 방법들을 설명합니다.

## 목차

1. [Vercel로 배포 (가장 쉬움)](#vercel로-배포-가장-쉬움)
2. [Netlify로 배포](#netlify로-배포)
3. [Cloudflare Pages로 배포](#cloudflare-pages로-배포)
4. [GitHub Pages로 배포](#github-pages로-배포)
5. [환경 변수 설정](#환경-변수-설정)

---

## Vercel로 배포 (가장 쉬움)

> **추천**: Next.js 프로젝트에 가장 적합한 배포 플랫폼

### 방법 1: GitHub 연동 (권장)

1. **Vercel 가입**
   - [vercel.com](https://vercel.com) 접속
   - GitHub 계정으로 가입

2. **프로젝트 가져오기**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 선택
   - `hyeoz/bloger_hyeoz` 선택

3. **설정 확인**
   ```
   Framework Preset: Next.js (자동 감지됨)
   Root Directory: ./
   Build Command: next build (자동)
   Output Directory: .next (자동)
   ```

4. **Deploy 클릭**
   - 자동으로 빌드 및 배포 진행
   - 완료 후 `*.vercel.app` 도메인 제공

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
cd /home/user/bloger_hyeoz
vercel

# 프로덕션 배포
vercel --prod
```

### 커스텀 도메인 연결

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 도메인 추가 (예: `myblog.com`)
3. DNS 설정:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

---

## Netlify로 배포

### GitHub 연동

1. [netlify.com](https://netlify.com) 가입
2. "Add new site" → "Import an existing project"
3. GitHub 연결 및 저장소 선택
4. 빌드 설정:
   ```
   Build command: npm run build
   Publish directory: .next
   ```

### Netlify CLI

```bash
# CLI 설치
npm i -g netlify-cli

# 배포
netlify deploy --prod
```

### Next.js on Netlify 설정

`netlify.toml` 파일 생성:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## Cloudflare Pages로 배포

### GitHub 연동

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 로그인
2. Pages → "Create a project"
3. GitHub 연결 및 저장소 선택
4. 빌드 설정:
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   ```

### 환경 변수

Cloudflare Pages에서 환경 변수 추가:
- Settings → Environment variables

---

## GitHub Pages로 배포

> **참고**: GitHub Pages는 정적 사이트만 지원하므로, Next.js 정적 내보내기 필요

### 1. next.config.ts 수정

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages의 경우 basePath 설정
  // basePath: '/bloger_hyeoz',
};

export default nextConfig;
```

### 2. GitHub Actions 워크플로우

`.github/workflows/deploy.yml` 생성:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. GitHub 설정

1. Repository → Settings → Pages
2. Source: "GitHub Actions" 선택

---

## 환경 변수 설정

### 필요한 환경 변수 (선택사항)

```env
# AdSense (광고 수익화)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX

# Google Analytics (방문자 분석)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Gemini API (AI 기능)
# 참고: 클라이언트에서 직접 사용하므로 사용자가 입력
```

### 각 플랫폼별 환경 변수 설정

#### Vercel
- Settings → Environment Variables → Add

#### Netlify
- Site settings → Build & deploy → Environment

#### Cloudflare Pages
- Settings → Environment variables

---

## 배포 후 체크리스트

### 1. 기본 확인
- [ ] 사이트 접속 가능
- [ ] 모든 페이지 정상 작동
- [ ] 다크 모드 전환 확인
- [ ] 모바일 반응형 확인

### 2. 기능 확인
- [ ] 이미지 크롭 기능
- [ ] 동영상 → GIF 변환
- [ ] 워터마크 삽입
- [ ] 글자수 계산기
- [ ] AI 기능 (API 키 입력 후)

### 3. SEO 확인
- [ ] robots.txt 접근 가능
- [ ] sitemap.xml 생성 (필요시)
- [ ] Open Graph 태그 확인

### 4. 성능 확인
- [Lighthouse](https://web.dev/measure/) 테스트
- [PageSpeed Insights](https://pagespeed.web.dev/) 확인

---

## 자동 배포 설정

### Vercel/Netlify/Cloudflare
- GitHub 연동 시 자동으로 설정됨
- `main` 브랜치에 push하면 자동 배포

### Branch Preview
- PR을 열면 자동으로 프리뷰 배포 생성
- 변경사항 미리 확인 가능

---

## 문제 해결

### 빌드 실패 시

1. **로컬에서 빌드 테스트**
   ```bash
   npm run build
   ```

2. **Node.js 버전 확인**
   - Node.js 18 이상 필요
   - `.nvmrc` 파일로 버전 고정 가능

3. **의존성 문제**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 404 에러

- `next.config.ts`에서 `trailingSlash: true` 설정 확인
- GitHub Pages의 경우 `basePath` 설정 확인

### 환경 변수 미적용

- `NEXT_PUBLIC_` 접두사 확인 (클라이언트에서 사용하는 경우)
- 배포 플랫폼에서 환경 변수 설정 확인
- 재배포 필요

---

## 추천 배포 플랫폼

| 플랫폼 | 난이도 | 무료 티어 | Next.js 지원 |
|--------|--------|-----------|--------------|
| **Vercel** | ⭐ 쉬움 | 무제한 | 최고 |
| Netlify | ⭐ 쉬움 | 100GB/월 | 좋음 |
| Cloudflare | ⭐⭐ 보통 | 무제한 | 좋음 |
| GitHub Pages | ⭐⭐⭐ 복잡 | 무제한 | 제한적 |

**결론**: **Vercel 추천** - Next.js 개발사에서 만든 플랫폼으로 가장 쉽고 최적화되어 있음
