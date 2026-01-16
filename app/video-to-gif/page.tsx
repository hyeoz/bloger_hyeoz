import VideoToGif from '@/components/VideoToGif';
import AdBanner from '@/components/AdBanner';
import { FileVideo } from 'lucide-react';

export default function VideoToGifPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-lg bg-purple-500 mb-4">
            <FileVideo className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            동영상 → GIF 변환
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            동영상 파일을 움직이는 GIF 이미지로 변환하세요
          </p>
        </div>

        <VideoToGif />

        <div className="mt-8 bg-purple-50 dark:bg-purple-950/30 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            사용 방법
          </h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 동영상 파일을 업로드합니다</li>
            <li>• FPS와 너비를 조정하여 GIF 품질과 파일 크기를 설정합니다</li>
            <li>• 'GIF로 변환' 버튼을 클릭합니다 (처음 사용 시 FFmpeg 라이브러리를 다운로드합니다)</li>
            <li>• 변환이 완료되면 미리보기를 확인하고 다운로드합니다</li>
          </ul>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 <strong>팁:</strong> 변환 시간은 동영상 길이와 설정한 품질에 따라 다릅니다.
              짧은 클립(5-10초)을 사용하면 가장 좋은 결과를 얻을 수 있습니다.
            </p>
          </div>
        </div>

        {/* Ad Banner */}
        <div className="mt-8">
          <AdBanner
            dataAdSlot="1234567892"
            dataAdFormat="rectangle"
            className="my-8"
          />
        </div>
      </div>
    </div>
  );
}
