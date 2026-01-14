import ImageSearch from '@/components/ImageSearch';
import { Image } from 'lucide-react';

export default function ImageSearchPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-lg bg-green-500 mb-4">
            <Image className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            무한도전 이미지 검색
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            카테고리를 선택하면 자동으로 '무한도전 + 카테고리'로 검색합니다
          </p>
        </div>

        <ImageSearch />
      </div>
    </div>
  );
}
