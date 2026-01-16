'use client';

import { useEffect } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  style = { display: 'block' },
  className = '',
}: AdBannerProps) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    // AdSense ID가 없거나 예시 ID면 광고를 로드하지 않음
    if (!adsenseId || adsenseId === 'ca-pub-XXXXXXXXXXXXXXXX') {
      return;
    }

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [adsenseId]);

  // AdSense ID가 없으면 플레이스홀더 표시
  if (!adsenseId || adsenseId === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return (
      <div
        className={`bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg flex items-center justify-center ${className}`}
        style={{ minHeight: '250px', ...style }}
      >
        <div className="text-center p-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            광고 영역
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            .env.local에 NEXT_PUBLIC_ADSENSE_ID 설정 필요
          </p>
        </div>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={adsenseId}
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive}
    />
  );
}
