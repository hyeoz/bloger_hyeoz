# Google AdSense 설정 가이드

이 가이드는 블로그 도우미 프로젝트에 Google AdSense를 통합하는 방법을 설명합니다.

## 📋 목차

1. [Google AdSense 계정 신청](#1-google-adsense-계정-신청)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [광고 단위 생성](#3-광고-단위-생성)
4. [ads.txt 파일 추가](#4-adstxt-파일-추가)
5. [배포 및 확인](#5-배포-및-확인)
6. [수익 최적화 팁](#6-수익-최적화-팁)

---

## 1. Google AdSense 계정 신청

### 1.1 계정 생성

1. [Google AdSense](https://www.google.com/adsense/) 접속
2. "시작하기" 버튼 클릭
3. 웹사이트 URL 입력
4. 이메일 주소 및 기본 정보 입력
5. 약관 동의 후 계정 생성

### 1.2 승인 요구사항

AdSense 승인을 받기 위해 필요한 조건:

- ✅ 독창적이고 유용한 콘텐츠
- ✅ 최소 10-15개 이상의 페이지/글
- ✅ 명확한 네비게이션 구조
- ✅ About, Contact, Privacy Policy 페이지
- ✅ 최소 3-6개월 운영 기록 (권장)
- ✅ 충분한 트래픽 (일 방문자 100명 이상 권장)

### 1.3 승인 과정

- **심사 기간**: 보통 1-2주 (최대 4주)
- **승인 알림**: 이메일로 통보
- **거절 시**: 이유 확인 후 개선하여 재신청

---

## 2. 환경 변수 설정

### 2.1 AdSense Publisher ID 확인

1. AdSense 계정에 로그인
2. **계정 → 계정 정보**로 이동
3. **게시자 ID** 복사 (형식: `ca-pub-1234567890123456`)

### 2.2 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하거나 수정:

```bash
# .env.local
NEXT_PUBLIC_ADSENSE_ID=ca-pub-1234567890123456
```

**중요**:
- 실제 AdSense ID로 교체하세요
- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- 배포 시 환경 변수 설정 필요 (Vercel, Netlify 등)

### 2.3 환경 변수 확인

개발 서버 재시작 후 확인:

```bash
npm run dev
```

브라우저에서 페이지 소스 보기 시 AdSense 스크립트가 로드되는지 확인:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"></script>
```

---

## 3. 광고 단위 생성

### 3.1 광고 단위 만들기

1. AdSense 대시보드에서 **광고 → 개요** 선택
2. **광고 단위 기준** 클릭
3. **디스플레이 광고** 선택
4. 광고 단위 이름 입력 (예: "홈페이지 배너", "도구 페이지 사이드바")
5. 광고 크기 선택:
   - **반응형**: 자동으로 크기 조정 (권장)
   - **고정**: 특정 크기 (예: 728x90, 300x250)
6. **만들기** 클릭
7. **광고 코드**에서 `data-ad-slot` 값 복사

### 3.2 광고 Slot ID 교체

현재 프로젝트에서 사용 중인 플레이스홀더 Slot ID를 실제 ID로 교체:

**현재 사용 중인 Slot ID:**
- 홈페이지: `1234567890`
- 이미지 크롭: `1234567891`
- 동영상 → GIF: `1234567892`
- 이미지 검색: `1234567893`
- 태그 생성: `1234567894`
- SEO 제목: `1234567895`

**교체 방법:**

각 페이지 파일에서 `dataAdSlot` 값을 실제 광고 단위 ID로 교체:

```tsx
// 예시: app/page.tsx
<AdBanner
  dataAdSlot="YOUR_ACTUAL_AD_SLOT_ID"  // 여기를 교체
  dataAdFormat="horizontal"
  className="my-8"
/>
```

### 3.3 권장 광고 배치

현재 프로젝트의 광고 배치:

1. **홈페이지**
   - 위치: 도구 그리드 아래
   - 형식: 가로형 배너 (Horizontal)
   - 크기: 반응형

2. **도구 페이지** (이미지 크롭, 동영상 변환 등)
   - 위치: 페이지 하단 (사용 방법 아래)
   - 형식: 사각형 배너 (Rectangle)
   - 크기: 반응형

---

## 4. ads.txt 파일 추가

### 4.1 ads.txt란?

ads.txt는 광고 사기를 방지하고 승인된 광고 판매자를 명시하는 파일입니다.

### 4.2 파일 생성

프로젝트 루트의 `public/ads.txt` 파일 생성:

```txt
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

**형식:**
```
도메인, 게시자ID, 관계, TAG-ID
```

- `pub-XXXXXXXXXXXXXXXX`: 실제 AdSense Publisher ID로 교체
- `DIRECT`: 직접 판매 관계
- `f08c47fec0942fa0`: Google 인증 ID (고정값)

### 4.3 파일 위치

```
bloger_hyeoz/
├── public/
│   └── ads.txt          # 여기에 생성
├── app/
├── components/
└── ...
```

### 4.4 확인

배포 후 브라우저에서 접속:

```
https://yourdomain.com/ads.txt
```

파일 내용이 정상적으로 표시되는지 확인.

### 4.5 AdSense에서 확인

1. AdSense 대시보드 접속
2. **사이트 → ads.txt** 메뉴
3. "문제 없음" 또는 "승인됨" 상태 확인

---

## 5. 배포 및 확인

### 5.1 Vercel 배포

Vercel에 배포 시 환경 변수 설정:

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings → Environment Variables**
3. 새 변수 추가:
   - **Name**: `NEXT_PUBLIC_ADSENSE_ID`
   - **Value**: `ca-pub-1234567890123456`
   - **Environments**: Production, Preview, Development 모두 선택
4. **Save** 클릭
5. 프로젝트 재배포

### 5.2 다른 플랫폼 (Netlify, AWS 등)

각 플랫폼의 환경 변수 설정 메뉴에서 동일하게 설정.

### 5.3 광고 표시 확인

배포 후 확인 사항:

1. **페이지 소스 확인**
   - AdSense 스크립트가 로드되는지 확인
   - `data-ad-client`와 `data-ad-slot`이 올바른지 확인

2. **광고 표시**
   - 처음 배포 후 광고가 즉시 표시되지 않을 수 있음
   - AdSense가 사이트를 크롤링하고 승인하는 데 **몇 시간~몇 일** 소요
   - 초기에는 빈 공간 또는 테스트 광고 표시 가능

3. **개발자 도구 확인**
   - 브라우저 콘솔에서 에러 확인
   - Network 탭에서 AdSense 요청 확인

### 5.4 문제 해결

**광고가 표시되지 않는 경우:**

1. **환경 변수 확인**
   - `NEXT_PUBLIC_ADSENSE_ID`가 올바르게 설정되었는지 확인
   - 배포 후 프로젝트 재빌드 필요

2. **AdSense 계정 상태**
   - 계정이 승인되었는지 확인
   - 정책 위반으로 인한 제한이 없는지 확인

3. **광고 차단기**
   - 브라우저의 광고 차단 확장 프로그램 비활성화

4. **콘텐츠 정책**
   - AdSense 정책 위반 콘텐츠가 없는지 확인
   - 저작권 침해, 성인 콘텐츠 등 금지

---

## 6. 수익 최적화 팁

### 6.1 광고 배치 전략

**효과적인 광고 위치:**

1. **Above the Fold (스크롤 없이 보이는 영역)**
   - 페이지 상단 배너
   - 네비게이션 아래

2. **컨텐츠 사이**
   - 도구 사용 후 결과 아래
   - 긴 글의 중간 지점

3. **사이드바**
   - 데스크톱에서 컨텐츠 옆
   - 모바일에서는 컨텐츠 사이로 이동

**피해야 할 위치:**
- ❌ 너무 많은 광고 (페이지당 3-4개 권장)
- ❌ 클릭 유도성 배치
- ❌ 콘텐츠를 가리는 광고
- ❌ 팝업 또는 인터스티셜 광고 (정책 위반)

### 6.2 광고 형식 최적화

**반응형 광고 사용 (권장)**
```tsx
<AdBanner
  dataAdSlot="YOUR_SLOT_ID"
  dataAdFormat="auto"
  dataFullWidthResponsive={true}
/>
```

**고정 크기 광고**
```tsx
<AdBanner
  dataAdSlot="YOUR_SLOT_ID"
  dataAdFormat="rectangle"
  style={{ width: '300px', height: '250px' }}
/>
```

### 6.3 A/B 테스팅

AdSense 실험 기능 사용:
1. AdSense 대시보드 → **최적화 → 실험**
2. 다양한 광고 크기/위치 테스트
3. 클릭률(CTR)과 수익 비교

### 6.4 트래픽 증가

수익은 트래픽에 비례:

- **SEO 최적화**: 검색 엔진 순위 개선
- **소셜 미디어**: 블로거 커뮤니티에 공유
- **콘텐츠 마케팅**: 블로그, YouTube 튜토리얼
- **백링크**: 다른 사이트에서 링크 획득

### 6.5 고가 키워드 타겟팅

높은 CPC(클릭당 비용) 키워드:
- 금융, 보험, 법률
- B2B 서비스
- 고가 제품 리뷰

현재 프로젝트의 경우:
- "블로그 수익화"
- "블로그 SEO"
- "블로그 마케팅 도구"

### 6.6 정책 준수

AdSense 정책 위반 시 계정 정지 위험:

**필수 준수 사항:**
- ✅ 독창적인 콘텐츠
- ✅ 사용자 경험 우선
- ✅ 클릭 유도 금지
- ✅ 광고 레이블 명확화
- ✅ Privacy Policy 페이지
- ✅ 저작권 준수

---

## 📊 예상 수익

### 수익 계산 방식

```
수익 = 노출 수 × CTR × CPC
```

- **노출 수**: 광고가 표시된 횟수
- **CTR (Click-Through Rate)**: 클릭률 (보통 0.5-2%)
- **CPC (Cost Per Click)**: 클릭당 수익 ($0.10-$2.00)

### 예상 시나리오

**시나리오 1: 초기 단계**
- 일일 방문자: 100명
- 페이지뷰: 300
- CTR: 1%
- CPC: $0.50
- **일 수익**: $1.50
- **월 수익**: $45

**시나리오 2: 성장 단계**
- 일일 방문자: 1,000명
- 페이지뷰: 3,000
- CTR: 1.5%
- CPC: $0.75
- **일 수익**: $33.75
- **월 수익**: $1,012.50

**시나리오 3: 성공 단계**
- 일일 방문자: 10,000명
- 페이지뷰: 30,000
- CTR: 2%
- CPC: $1.00
- **일 수익**: $600
- **월 수익**: $18,000

---

## 🔧 고급 설정

### 자동 광고 활성화

AdSense의 자동 광고는 AI가 최적의 위치에 광고를 자동 배치:

1. AdSense → **광고 → 개요**
2. **자동 광고** 활성화
3. 설정 조정 (광고 로드, 형식 선택)

**주의**: 수동 광고와 중복될 수 있으므로 하나만 선택 권장.

### 광고 차단 복구

사용자의 광고 차단기 감지 및 메시지 표시:

```tsx
// components/AdBlockDetector.tsx
'use client';

import { useEffect, useState } from 'react';

export default function AdBlockDetector() {
  const [adBlockEnabled, setAdBlockEnabled] = useState(false);

  useEffect(() => {
    const testAd = document.createElement('div');
    testAd.className = 'adsbygoogle';
    testAd.style.display = 'none';
    document.body.appendChild(testAd);

    setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        setAdBlockEnabled(true);
      }
      document.body.removeChild(testAd);
    }, 100);
  }, []);

  if (!adBlockEnabled) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
      <p className="text-sm text-yellow-800">
        광고 차단기가 활성화되어 있습니다.
        무료로 제공되는 이 도구를 계속 사용하려면 광고 차단기를 비활성화해주세요.
      </p>
    </div>
  );
}
```

### 지역별 광고 최적화

특정 지역 타겟팅:

1. AdSense → **차단 관리 → 광고 게재**
2. **지역** 설정
3. 고수익 지역 우선 (미국, 캐나다, 영국, 호주 등)

---

## 📚 추가 리소스

### 공식 문서

- [Google AdSense 고객센터](https://support.google.com/adsense)
- [AdSense 정책](https://support.google.com/adsense/answer/48182)
- [ads.txt 가이드](https://support.google.com/adsense/answer/7532444)

### 유용한 도구

- [Google Analytics](https://analytics.google.com): 트래픽 분석
- [Google Search Console](https://search.google.com/search-console): SEO 최적화
- [PageSpeed Insights](https://pagespeed.web.dev/): 페이지 속도 개선

### 커뮤니티

- [Google AdSense 도움말 포럼](https://support.google.com/adsense/community)
- [Reddit r/adsense](https://reddit.com/r/adsense)

---

## ✅ 체크리스트

설정 완료 확인:

- [ ] Google AdSense 계정 생성 및 승인
- [ ] `.env.local`에 `NEXT_PUBLIC_ADSENSE_ID` 설정
- [ ] 각 페이지의 광고 Slot ID 교체
- [ ] `public/ads.txt` 파일 생성
- [ ] 배포 환경의 환경 변수 설정
- [ ] 광고가 정상적으로 표시되는지 확인
- [ ] AdSense 정책 준수 확인
- [ ] Google Analytics 연동 (선택)

---

## 🚨 주의사항

1. **클릭 사기 금지**
   - 본인 또는 지인의 클릭 유도 금지
   - 자동 클릭 프로그램 사용 금지
   - 위반 시 계정 영구 정지

2. **콘텐츠 정책**
   - 저작권 침해 금지
   - 성인/폭력/불법 콘텐츠 금지
   - 해킹/크랙 관련 콘텐츠 금지

3. **광고 배치 정책**
   - 광고와 콘텐츠 명확히 구분
   - 클릭 유도 문구 금지
   - 팝업/팝언더 금지

4. **트래픽 정책**
   - 인공적인 트래픽 증가 금지
   - 봇 트래픽 금지
   - 트래픽 구매 금지

---

## 💡 다음 단계

AdSense 통합 후 추천 작업:

1. **프리미엄 구독 모델 추가**
   - 광고 제거 옵션 제공
   - 추가 기능 제공

2. **제휴 마케팅 추가**
   - 블로그 호스팅 서비스 제휴
   - 이미지 편집 도구 제휴

3. **사용자 분석 강화**
   - Google Analytics 4 연동
   - 사용 패턴 분석

4. **콘텐츠 확장**
   - 블로그 작성 팁 콘텐츠 추가
   - 튜토리얼 영상 제작

---

궁금한 점이 있거나 문제가 발생하면 이슈를 생성해주세요!
