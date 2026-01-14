import ImageCropper from '@/components/ImageCropper';
import { Scissors } from 'lucide-react';

export default function ImageCropPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-lg bg-blue-500 mb-4">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            이미지 원형 크롭
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            이미지를 업로드하고 원하는 부분을 선택하여 원형으로 크롭하세요
          </p>
        </div>

        <ImageCropper />

        <div className="mt-8 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            사용 방법
          </h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 이미지 파일을 선택하여 업로드합니다</li>
            <li>• 마우스로 드래그하여 원하는 부분을 선택합니다</li>
            <li>• 슬라이더를 사용하여 확대/축소할 수 있습니다</li>
            <li>• 다운로드 버튼을 클릭하여 원형으로 크롭된 이미지를 저장합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
