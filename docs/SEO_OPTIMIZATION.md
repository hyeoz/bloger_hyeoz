# 프로젝트 SEO 최적화 가이드

이 문서는 Bloger Hyeoz 프로젝트의 검색 엔진 최적화(SEO) 방법을 설명합니다.

## 목차

1. [메타데이터 최적화](#메타데이터-최적화)
2. [구조화된 데이터 (Schema.org)](#구조화된-데이터-schemaorg)
3. [sitemap.xml 생성](#sitemapxml-생성)
4. [robots.txt 설정](#robotstxt-설정)
5. [Open Graph 태그](#open-graph-태그)
6. [성능 최적화](#성능-최적화)
7. [콘텐츠 최적화](#콘텐츠-최적화)

---

## 메타데이터 최적화

### 1. 글로벌 메타데이터 설정

`app/layout.tsx` 수정:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://yourdomain.com'),
  title: {
    default: '블로거를 위한 올인원 도구 | Bloger Hyeoz',
    template: '%s | Bloger Hyeoz',
  },
  description: '블로그 작성에 필요한 모든 도구를 제공합니다. AI 주제 추천, 태그 생성, SEO 제목 변환, 이미지 편집, 동영상 GIF 변환까지.',
  keywords: [
    '블로그 도구',
    '블로그 글쓰기',
    'AI 주제 추천',
    '해시태그 생성',
    'SEO 제목',
    '이미지 크롭',
    '동영상 GIF 변환',
    '워터마크',
    '글자수 계산기',
    '무한도전 짤',
  ],
  authors: [{ name: 'Bloger Hyeoz' }],
  creator: 'Bloger Hyeoz',
  publisher: 'Bloger Hyeoz',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://yourdomain.com',
    siteName: 'Bloger Hyeoz',
    title: '블로거를 위한 올인원 도구',
    description: '블로그 작성에 필요한 모든 도구를 무료로 제공합니다.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bloger Hyeoz - 블로거를 위한 올인원 도구',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '블로거를 위한 올인원 도구 | Bloger Hyeoz',
    description: '블로그 작성에 필요한 모든 도구를 무료로 제공합니다.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'google-site-verification-code',
    // naver: 'naver-site-verification-code',
  },
  alternates: {
    canonical: 'https://yourdomain.com',
  },
};
```

### 2. 페이지별 메타데이터

각 페이지의 `page.tsx`에서 메타데이터 설정:

```tsx
// app/blog-tools/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '블로그 도구 모음',
  description: 'AI 주제 추천, 태그 생성, SEO 제목 변환 등 블로그 작성에 필요한 도구들',
  openGraph: {
    title: '블로그 도구 모음 | Bloger Hyeoz',
    description: 'AI 주제 추천, 태그 생성, SEO 제목 변환 등 블로그 작성에 필요한 도구들',
  },
};
```

---

## 구조화된 데이터 (Schema.org)

### JSON-LD 추가

`app/layout.tsx`에 구조화된 데이터 추가:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Bloger Hyeoz',
    description: '블로거를 위한 올인원 도구 모음',
    url: 'https://yourdomain.com',
    applicationCategory: 'Utility',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    featureList: [
      'AI 블로그 주제 추천',
      '자동 태그 생성',
      'SEO 제목 변환',
      '이미지 원형 크롭',
      '동영상 GIF 변환',
      '워터마크 삽입',
      '글자수 계산기',
      '무한도전 이미지 검색',
    ],
  };

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## sitemap.xml 생성

### 동적 sitemap 생성

`app/sitemap.ts` 파일 생성:

```tsx
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yourdomain.com';
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog-tools`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/image-crop`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video-to-gif`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image-search`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tag-generator`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/seo-title`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
```

---

## robots.txt 설정

### robots.txt 파일 생성

`app/robots.ts` 파일 생성:

```tsx
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/private/'],
    },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

또는 `public/robots.txt` 직접 생성:

```txt
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://yourdomain.com/sitemap.xml
```

---

## Open Graph 태그

### OG 이미지 생성

`public/og-image.png` 이미지 생성:

- 크기: 1200x630px
- 형식: PNG 또는 JPG
- 파일 크기: 1MB 이하 권장

### 동적 OG 이미지

`app/api/og/route.tsx`:

```tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Bloger Hyeoz';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 'bold' }}>{title}</div>
        <div style={{ fontSize: 30, marginTop: 20 }}>블로거를 위한 올인원 도구</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

---

## 성능 최적화

### 1. 이미지 최적화

```tsx
import Image from 'next/image';

// Next.js Image 컴포넌트 사용
<Image
  src="/hero-image.png"
  alt="설명"
  width={800}
  height={600}
  priority // LCP 이미지에 사용
  loading="lazy" // 다른 이미지에 사용
/>
```

### 2. 폰트 최적화

`app/layout.tsx`:

```tsx
import { Noto_Sans_KR } from 'next/font/google';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={notoSansKR.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Core Web Vitals 최적화

```tsx
// next.config.ts
const nextConfig = {
  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  // 압축 활성화
  compress: true,
  // 실험적 기능
  experimental: {
    optimizeCss: true,
  },
};
```

### 4. 지연 로딩

```tsx
import dynamic from 'next/dynamic';

// 컴포넌트 지연 로딩
const VideoToGif = dynamic(() => import('@/components/VideoToGif'), {
  loading: () => <div>로딩 중...</div>,
  ssr: false, // 클라이언트에서만 렌더링
});
```

---

## 콘텐츠 최적화

### 1. 시맨틱 HTML

```tsx
// 올바른 헤딩 구조
<main>
  <h1>페이지 제목</h1>
  <section>
    <h2>섹션 제목</h2>
    <article>
      <h3>아티클 제목</h3>
      <p>내용...</p>
    </article>
  </section>
</main>
```

### 2. 접근성 개선

```tsx
// alt 텍스트
<img src="/image.png" alt="이미지에 대한 명확한 설명" />

// aria-label
<button aria-label="메뉴 열기">
  <MenuIcon />
</button>

// 키보드 네비게이션
<button onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
  클릭
</button>
```

### 3. 언어 및 지역 설정

```tsx
<html lang="ko">
  <head>
    <meta name="geo.region" content="KR" />
    <meta name="geo.placename" content="South Korea" />
  </head>
</html>
```

---

## 검색 엔진 등록

### Google Search Console

1. [Google Search Console](https://search.google.com/search-console) 접속
2. 속성 추가 → 도메인 또는 URL 접두어
3. 소유권 확인 (HTML 태그 또는 DNS)
4. sitemap.xml 제출

### Naver Search Advisor

1. [네이버 서치어드바이저](https://searchadvisor.naver.com) 접속
2. 사이트 등록
3. 소유 확인
4. 사이트맵 제출

### Bing Webmaster Tools

1. [Bing Webmaster Tools](https://www.bing.com/webmasters) 접속
2. Google Search Console 데이터 가져오기 가능

---

## SEO 체크리스트

### 기술적 SEO
- [ ] HTTPS 사용
- [ ] 모바일 친화적 (반응형)
- [ ] 빠른 로딩 속도 (LCP < 2.5s)
- [ ] sitemap.xml 생성
- [ ] robots.txt 설정
- [ ] 404 페이지 설정
- [ ] canonical URL 설정

### 온페이지 SEO
- [ ] 고유한 title 태그 (각 페이지별)
- [ ] meta description (150-160자)
- [ ] 적절한 헤딩 구조 (H1-H6)
- [ ] 이미지 alt 태그
- [ ] 내부 링크 구조
- [ ] 키워드 최적화

### 콘텐츠 SEO
- [ ] 고품질 콘텐츠
- [ ] 키워드 리서치
- [ ] 정기적인 업데이트
- [ ] 사용자 의도 충족

### 소셜 미디어
- [ ] Open Graph 태그
- [ ] Twitter Card 태그
- [ ] 공유하기 쉬운 URL

---

## 성능 측정 도구

| 도구 | 용도 |
|------|------|
| [Google PageSpeed Insights](https://pagespeed.web.dev/) | Core Web Vitals 측정 |
| [GTmetrix](https://gtmetrix.com/) | 종합 성능 분석 |
| [Lighthouse](https://web.dev/measure/) | SEO, 접근성, 성능 점검 |
| [Google Search Console](https://search.google.com/search-console) | 검색 노출 현황 |
| [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/) | 사이트 크롤링 분석 |

---

## 추가 권장 사항

1. **정기적인 콘텐츠 업데이트**: 검색 엔진은 활발한 사이트를 선호
2. **백링크 구축**: 다른 사이트에서의 링크 확보
3. **소셜 미디어 활용**: 콘텐츠 공유 및 트래픽 유도
4. **사용자 경험 개선**: 이탈률 감소, 체류 시간 증가
5. **모니터링**: 검색 순위 및 트래픽 정기 확인
