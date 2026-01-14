import Link from "next/link";
import { Scissors, FileVideo, Image, Hash, Type, Sparkles } from "lucide-react";

const tools = [
  {
    name: "이미지 원형 크롭",
    description: "블로그 프로필 이미지나 썸네일을 원형으로 자르고 다운로드하세요",
    href: "/image-crop",
    icon: Scissors,
    color: "bg-blue-500",
  },
  {
    name: "동영상 → GIF 변환",
    description: "동영상 파일을 움직이는 GIF로 변환하여 블로그에 활용하세요",
    href: "/video-to-gif",
    icon: FileVideo,
    color: "bg-purple-500",
  },
  {
    name: "무한도전 이미지 검색",
    description: "카테고리를 입력하면 '무한도전 + 카테고리'로 자동 이미지 검색",
    href: "/image-search",
    icon: Image,
    color: "bg-green-500",
  },
  {
    name: "태그 자동 생성",
    description: "블로그 글 내용을 분석하여 적절한 태그와 해시태그를 추천해드립니다",
    href: "/tag-generator",
    icon: Hash,
    color: "bg-orange-500",
  },
  {
    name: "SEO 제목 변환",
    description: "일반 제목을 검색 최적화된 매력적인 제목으로 변환해드립니다",
    href: "/seo-title",
    icon: Type,
    color: "bg-pink-500",
  },
];

export default function Home() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            블로그 작성 도우미
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            이미지 편집부터 SEO 최적화까지, 블로그 작성에 필요한 모든 도구를 한 곳에서
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg"
              >
                <div className={`inline-flex p-3 rounded-lg ${tool.color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-8 border border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              더 나은 블로그 작성 경험
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
              복잡한 이미지 편집 프로그램이나 여러 웹사이트를 오갈 필요 없이,
              이 도구 하나로 블로그 작성에 필요한 모든 작업을 빠르고 쉽게 처리하세요.
              모든 기능은 브라우저에서 바로 동작하며, 파일은 안전하게 로컬에서만 처리됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
