import Script from 'next/script';

export default function AdSenseScript() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  // AdSense ID가 없거나 예시 ID면 스크립트를 로드하지 않음
  if (!adsenseId || adsenseId === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
