import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900">
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="text-center space-y-8 max-w-4xl">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white">
              블로거를 위한
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                완벽한 도구 모음
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              AI 주제 추천부터 워터마크 삽입까지, 블로그 글 작성에 필요한 모든 것
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI 주제 추천
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                카테고리별로 맞춤형 블로그 주제를 추천받으세요
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                글자수 계산기
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                실시간으로 글자수, 단어수, 읽기 시간을 확인하세요
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                워터마크 삽입
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                이미지에 자동으로 워터마크를 추가하세요
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/blog-tools"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-full
                       hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              도구 사용 시작하기 →
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Next.js 16 + React 19 + TypeScript + Tailwind CSS로 제작
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
