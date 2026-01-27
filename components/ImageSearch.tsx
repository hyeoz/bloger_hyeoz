'use client';

import { useState } from 'react';
import { Search, ExternalLink, Copy, Check, Key, Loader2, Download, X, AlertCircle, Settings } from 'lucide-react';

const categories = [
  '여행',
  '맛집',
  '운동',
  '게임',
  '쇼핑',
  '공부',
  '독서',
  '요리',
  '영화',
  '음악',
  '카페',
  '데이트',
  '반려동물',
  '취미',
  '운전',
];

// Popular meme templates (fallback when API is not configured)
const popularMemes = [
  { keyword: '하하', description: '하하 표정 모음' },
  { keyword: '정형돈', description: '정형돈 짤' },
  { keyword: '박명수', description: '박명수 명언' },
  { keyword: '유재석', description: '유재석 리액션' },
  { keyword: '노홍철', description: '노홍철 춤' },
  { keyword: '정준하', description: '정준하 먹방' },
  { keyword: '길', description: '길 표정' },
];

interface ImageResult {
  title: string;
  link: string;
  thumbnail: string;
  source: string;
  width?: number;
  height?: number;
  displayLink?: string;
}

export default function ImageSearch() {
  const [category, setCategory] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);

  // API mode states
  const [useAPI, setUseAPI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [cx, setCx] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Search results
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedQuery, setSearchedQuery] = useState('');

  // Selected image modal
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

  const searchQuery = category || customInput;
  const fullQuery = searchQuery ? `무한도전 ${searchQuery}` : '';
  const searchUrl = fullQuery
    ? `https://www.google.com/search?q=${encodeURIComponent(fullQuery)}&tbm=isch`
    : '';

  const handleAPISearch = async () => {
    if (!apiKey || !cx) {
      setError('API 키와 검색 엔진 ID를 설정해주세요.');
      setShowSettings(true);
      return;
    }

    if (!searchQuery) {
      setError('검색어를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        apiKey: apiKey,
        cx: cx,
      });

      const response = await fetch(`/api/image-search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '검색 실패');
      }

      setImages(data.images || []);
      setSearchedQuery(data.query || fullQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (useAPI) {
      handleAPISearch();
    } else {
      if (searchUrl) {
        window.open(searchUrl, '_blank');
      }
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

  const handleImageDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.slice(0, 30)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // If CORS blocks the download, open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Mode Toggle & Settings */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Search className="w-5 h-5" />
            무한도전 이미지 검색
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">페이지 내 검색</span>
              <button
                onClick={() => setUseAPI(!useAPI)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  useAPI ? 'bg-green-600' : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    useAPI ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {useAPI && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Settings className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            )}
          </div>
        </div>

        {/* API Settings */}
        {useAPI && showSettings && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
            <h4 className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Google Custom Search API 설정
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-green-600 dark:text-green-400 mb-1">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 pr-16 text-sm border border-green-300 dark:border-green-600 rounded
                             bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600 dark:text-green-400"
                  >
                    {showApiKey ? '숨기기' : '보기'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-green-600 dark:text-green-400 mb-1">Search Engine ID (CX)</label>
                <input
                  type="text"
                  value={cx}
                  onChange={(e) => setCx(e.target.value)}
                  placeholder="a1b2c3d4e5f6g7h8i"
                  className="w-full px-3 py-2 text-sm border border-green-300 dark:border-green-600 rounded
                           bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
              <p>1. <a href="https://developers.google.com/custom-search/v1/introduction" target="_blank" rel="noopener noreferrer" className="underline">Google Custom Search API</a> 에서 API 키 발급</p>
              <p>2. <a href="https://programmablesearchengine.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Programmable Search Engine</a> 에서 검색 엔진 생성 후 CX 확인</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

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
          disabled={!fullQuery || isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              검색 중...
            </>
          ) : useAPI ? (
            <>
              <Search className="w-6 h-6" />
              이미지 검색하기
            </>
          ) : (
            <>
              <ExternalLink className="w-6 h-6" />
              구글 이미지 검색 열기
            </>
          )}
        </button>
      </div>

      {/* Search Results */}
      {images.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            검색 결과: "{searchedQuery}" ({images.length}개)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 aspect-square"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.thumbnail || image.link}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageDownload(image.link, image.title);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-zinc-100 transition-colors"
                      title="다운로드"
                    >
                      <Download className="w-5 h-5 text-zinc-900" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(image.source || image.link, '_blank');
                      }}
                      className="p-2 bg-white rounded-full hover:bg-zinc-100 transition-colors"
                      title="원본 보기"
                    >
                      <ExternalLink className="w-5 h-5 text-zinc-900" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={selectedImage.link}
              alt={selectedImage.title}
              className="max-w-full max-h-[70vh] object-contain"
            />
            <div className="p-4 space-y-2">
              <p className="text-sm text-zinc-900 dark:text-zinc-50 font-medium line-clamp-2">
                {selectedImage.title}
              </p>
              {selectedImage.displayLink && (
                <p className="text-xs text-zinc-500">{selectedImage.displayLink}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleImageDownload(selectedImage.link, selectedImage.title)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  다운로드
                </button>
                <button
                  onClick={() => window.open(selectedImage.source || selectedImage.link, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  원본 페이지
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
          사용 팁
        </h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          {useAPI ? (
            <>
              <li>• <span className="text-green-600 dark:text-green-400 font-medium">페이지 내 검색</span>: 검색 결과가 바로 이 페이지에 표시됩니다</li>
              <li>• 이미지를 클릭하면 크게 볼 수 있고, 바로 다운로드할 수 있습니다</li>
              <li>• Google Custom Search API 설정이 필요합니다 (무료 100회/일)</li>
            </>
          ) : (
            <>
              <li>• 카테고리를 선택하거나 직접 입력하면 자동으로 "무한도전"이 앞에 붙습니다</li>
              <li>• 검색 버튼을 클릭하면 구글 이미지 검색이 새 탭에서 열립니다</li>
              <li>• <span className="text-green-600 dark:text-green-400 font-medium">"페이지 내 검색"</span>을 켜면 이 페이지에서 바로 결과를 볼 수 있습니다</li>
            </>
          )}
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
