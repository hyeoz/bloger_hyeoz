# 기존 Google AdSense 계정 연결 가이드

이 문서는 **이미 보유하고 있는 Google AdSense 계정**을 이 블로그 도구 프로젝트에 연결하는 방법을 설명합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [AdSense 계정에서 정보 확인](#adsense-계정에서-정보-확인)
3. [프로젝트에 AdSense 연결](#프로젝트에-adsense-연결)
4. [ads.txt 설정](#adstxt-설정)
5. [광고 단위 추가](#광고-단위-추가)
6. [주의사항](#주의사항)

---

## 사전 준비

### 확인해야 할 사항

1. **AdSense 계정 상태 확인**
   - [Google AdSense](https://www.google.com/adsense) 로그인
   - 계정이 "활성" 상태인지 확인
   - 휴면 계정인 경우 재활성화 필요

2. **사이트 추가 가능 여부**
   - 기존 계정에 새 사이트를 추가할 수 있음
   - 각 사이트별로 승인 절차 필요

---

## AdSense 계정에서 정보 확인

### 1. 게시자 ID (Publisher ID) 확인

1. AdSense 로그인 → 계정 → 계정 정보
2. **게시자 ID** 확인 (형식: `pub-XXXXXXXXXXXXXXXX`)

```
예시: pub-1234567890123456
```

### 2. 새 사이트 추가

1. AdSense 대시보드 → **사이트** → **사이트 추가**
2. 배포할 도메인 입력 (예: `myblog.vercel.app`)
3. AdSense 코드 복사

---

## 프로젝트에 AdSense 연결

### 1. 환경 변수 설정 (권장)

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### 2. AdSense 스크립트 컴포넌트 수정

`components/AdSenseScript.tsx` 파일을 확인/수정:

```tsx
'use client';

import Script from 'next/script';

export default function AdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!clientId) {
    console.warn('AdSense client ID not configured');
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
```

### 3. layout.tsx에서 사용

`app/layout.tsx`:

```tsx
import AdSenseScript from '@/components/AdSenseScript';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <AdSenseScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## ads.txt 설정

### 1. ads.txt 파일 수정

`public/ads.txt` 파일을 **본인의 게시자 ID**로 수정:

```txt
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

`pub-XXXXXXXXXXXXXXXX` 부분을 본인의 게시자 ID로 변경하세요.

### 2. 확인 방법

배포 후 `https://yourdomain.com/ads.txt`로 접속하여 내용 확인

---

## 광고 단위 추가

### 자동 광고 사용 (권장)

AdSense에서 자동 광고를 활성화하면 별도 설정 없이 자동으로 광고가 표시됩니다.

1. AdSense → 광고 → 사이트 기준
2. 해당 사이트 선택 → 자동 광고 켜기

### 수동 광고 단위 추가

특정 위치에 광고를 배치하려면:

1. AdSense → 광고 → 광고 단위 기준 → 새 광고 단위 만들기
2. 광고 유형 선택 (디스플레이, 인피드, 콘텐츠 내 등)
3. 생성된 코드 복사

`components/AdBanner.tsx` 예시:

```tsx
'use client';

import { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
}

export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true
}: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  if (!clientId) return null;

  return (
    <div className="ad-container my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
```

사용 예시:

```tsx
<AdBanner slot="1234567890" format="auto" />
```

---

## 사이트 승인 절차

### 1. 사이트 검토 요청

새 사이트 추가 후 Google에서 검토를 진행합니다.

- 검토 기간: 보통 1-14일 소요
- 충분한 콘텐츠가 있어야 승인 가능
- AdSense 정책 준수 필요

### 2. 승인 전 체크리스트

- [ ] 개인정보처리방침 페이지 있음
- [ ] 최소 10개 이상의 유용한 콘텐츠
- [ ] 명확한 네비게이션 구조
- [ ] 성인 콘텐츠, 저작권 위반 콘텐츠 없음
- [ ] 사이트가 정상 작동함

---

## 주의사항

### 정책 준수

1. **자체 클릭 금지**: 본인이 광고를 클릭하면 계정 정지
2. **클릭 유도 금지**: 사용자에게 광고 클릭을 유도하면 안 됨
3. **콘텐츠 정책**: 성인, 도박, 약물 관련 콘텐츠 제한
4. **트래픽 품질**: 유효하지 않은 트래픽 발생 시 계정 정지

### 기술적 주의사항

1. **한 페이지 광고 수 제한**: 과도한 광고는 사용자 경험 저하
2. **모바일 최적화**: 반응형 광고 사용 권장
3. **페이지 속도**: 광고가 페이지 로딩을 크게 지연시키지 않도록

### 수익 관련

- 최소 지급 금액: $100 (또는 해당 통화 기준)
- 지급 주기: 매월 21일경 (전월 수익)
- 세금 정보 제출 필요

---

## 문제 해결

### 광고가 표시되지 않는 경우

1. **콘솔 에러 확인**: 브라우저 개발자 도구에서 에러 확인
2. **ads.txt 확인**: 올바른 게시자 ID인지 확인
3. **사이트 승인 확인**: AdSense에서 사이트 승인 상태 확인
4. **애드블로커 확인**: 광고 차단 확장 프로그램 비활성화

### 수익이 없는 경우

1. 트래픽이 충분한지 확인
2. 광고 배치 위치 최적화
3. 콘텐츠 품질 향상

---

## 관련 링크

- [Google AdSense 도움말](https://support.google.com/adsense)
- [AdSense 프로그램 정책](https://support.google.com/adsense/answer/48182)
- [ads.txt 가이드](https://support.google.com/adsense/answer/7532444)
