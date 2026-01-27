import TagGenerator from '@/components/TagGenerator';
import AdBanner from '@/components/AdBanner';
import { Hash } from 'lucide-react';

export default function TagGeneratorPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-lg bg-orange-500 mb-4">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            태그 자동 생성
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            블로그 내용을 분석하여 적절한 태그와 해시태그를 자동으로 추천합니다
          </p>
        </div>

        <TagGenerator />

        {/* Ad Banner */}
        <div className="mt-8">
          <AdBanner
            dataAdSlot="1234567894"
            dataAdFormat="rectangle"
            className="my-8"
          />
        </div>
      </div>
    </div>
  );
}
