import SeoTitleConverter from '@/components/SeoTitleConverter';
import { Type } from 'lucide-react';

export default function SeoTitlePage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-lg bg-pink-500 mb-4">
            <Type className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            SEO 제목 변환
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            일반 제목을 검색 최적화된 매력적인 제목으로 변환하세요
          </p>
        </div>

        <SeoTitleConverter />
      </div>
    </div>
  );
}
