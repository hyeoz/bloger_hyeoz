'use client';

import { useState } from 'react';
import { Search, ExternalLink, Copy, Check } from 'lucide-react';

const categories = [
  '여행', '맛집', '운동', '게임', '쇼핑',
  '공부', '독서', '요리', '영화', '음악',
  '카페', '데이트', '반려동물', '취미', '운전',
];

const popularMemes = [
  { keyword: '하하', description: '하하 표정 모음' },
  { keyword: '정형돈', description: '정형돈 짤' },
  { keyword: '박명수', description: '박명수 명언' },
  { keyword: '유재석', description: '유재석 리액션' },
  { keyword: '노홍철', description: '노홍철 춤' },
  { keyword: '정준하', description: '정준하 먹방' },
  { keyword: '길', description: '길 표정' },
];

export default function ImageSearch() {
  const [category, setCategory] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);

  const searchQuery = category || customInput;
  const fullQuery = searchQuery ? `무한도전 ${searchQuery}` : '';
  const searchUrl = fullQuery
    ? `https://www.google.com/search?q=${encodeURIComponent(fullQuery)}&tbm=isch`
    : '';

  const handleSearch = () => {
    if (searchUrl) {
      window.open(searchUrl, '_blank');
    }
  };

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
    setCustomInput('');
  };

  const handleCopy = async () => {
    if (fullQuery) {
      await navigator.clipboard.writeText(fullQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
          <Search className="w-5 h-5" />
          무한도전 이미지 검색
        </h3>

        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            빠른 카테고리 선택
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            또는 직접 입력
          </label>
          <input
            type="text"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setCategory('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="예: 등산, 낚시, 캠핑..."
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Search Preview */}
        {fullQuery && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-lg font-medium text-zinc-900 dark:text-zinc-50 flex-1">
                {fullQuery}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title="검색어 복사"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!fullQuery}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
        >
          <ExternalLink className="w-6 h-6" />
          구글 이미지 검색 열기
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          사용 팁
        </h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>• 카테고리를 선택하거나 직접 입력하면 자동으로 "무한도전"이 앞에 붙습니다</li>
          <li>• 검색 버튼을 클릭하면 구글 이미지 검색이 새 탭에서 열립니다</li>
          <li>• 무한도전 관련 재미있는 짤을 블로그에 활용해보세요</li>
          <li>• 저작권이 있는 이미지는 출처를 명시하거나 사용 권한을 확인하세요</li>
        </ul>
      </div>

      {/* Popular Searches */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          인기 검색어
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {popularMemes.map((meme) => (
            <button
              key={meme.keyword}
              onClick={() => {
                setCustomInput(meme.keyword);
                setCategory('');
              }}
              className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
            >
              <div className="font-medium text-zinc-900 dark:text-zinc-50">{meme.keyword}</div>
              <div className="text-xs text-zinc-500 mt-1">{meme.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
