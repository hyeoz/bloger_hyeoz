'use client';

import { useState } from 'react';
import { Type, Copy, Check, Sparkles, RefreshCw, Key, Loader2, AlertCircle, TrendingUp } from 'lucide-react';

// SEO title patterns and templates
const titlePatterns = {
  howTo: [
    '{title} 방법 완벽 가이드',
    '{title} 초보자를 위한 완벽 가이드',
    '{title} 하는 법 - 단계별 설명',
    '{title} 쉽게 따라하기',
  ],
  list: [
    '{title} BEST {num}',
    '{title} 추천 TOP {num}',
    '{title} 꼭 알아야 할 {num}가지',
    '{title} {num}가지 방법',
  ],
  review: [
    '{title} 솔직 후기',
    '{title} 리얼 리뷰',
    '{title} 직접 사용해본 후기',
    '{title} 장단점 총정리',
  ],
  comparison: [
    '{title} 비교 분석',
    '{title} 어떤 게 좋을까?',
    '{title} 차이점 완벽 정리',
    '{title} VS 비교',
  ],
  question: [
    '{title}? 궁금증 해결',
    '{title}일까? 완벽 분석',
    '{title}인가요? 알아보기',
  ],
  current: [
    '2026년 최신 {title}',
    '{title} 최신 트렌드',
    '지금 핫한 {title}',
  ],
};

const seoKeywords = [
  '완벽 가이드',
  '총정리',
  '꿀팁',
  '추천',
  'BEST',
  'TOP',
  '최신',
  '리얼',
  '솔직',
  '후기',
  '방법',
  '비교',
  '분석',
  '정리',
];

interface AISuggestion {
  title: string;
  type: string;
  score: number;
  reason: string;
}

interface AISeoResult {
  suggestions: AISuggestion[];
  metaDescription?: string;
  keywords?: string[];
}

export default function SeoTitleConverter() {
  const [originalTitle, setOriginalTitle] = useState('');
  const [suggestions, setSuggestions] = useState<(string | AISuggestion)[]>([]);
  const [metaDescription, setMetaDescription] = useState<string | null>(null);
  const [seoKeywordsResult, setSeoKeywordsResult] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  // AI Mode states
  const [useAI, setUseAI] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWithAI = async () => {
    if (!apiKey) {
      setError('Gemini API 키를 입력해주세요.');
      return;
    }

    if (!originalTitle.trim()) {
      setError('원본 제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          type: 'seo',
          title: originalTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI 요청 실패');
      }

      const result = data.data as AISeoResult;
      if (result.suggestions && Array.isArray(result.suggestions)) {
        setSuggestions(result.suggestions);
        setMetaDescription(result.metaDescription || null);
        setSeoKeywordsResult(result.keywords || []);
      } else if (data.data?.raw) {
        setError('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = () => {
    if (useAI) {
      generateWithAI();
      return;
    }

    if (!originalTitle.trim()) return;

    const newSuggestions: string[] = [];
    const title = originalTitle.trim();

    if (selectedType === 'all' || selectedType === 'howTo') {
      titlePatterns.howTo.forEach((pattern) => {
        newSuggestions.push(pattern.replace('{title}', title));
      });
    }

    if (selectedType === 'all' || selectedType === 'list') {
      [5, 7, 10].forEach((num) => {
        titlePatterns.list.forEach((pattern) => {
          newSuggestions.push(
            pattern.replace('{title}', title).replace('{num}', num.toString())
          );
        });
      });
    }

    if (selectedType === 'all' || selectedType === 'review') {
      titlePatterns.review.forEach((pattern) => {
        newSuggestions.push(pattern.replace('{title}', title));
      });
    }

    if (selectedType === 'all' || selectedType === 'comparison') {
      titlePatterns.comparison.forEach((pattern) => {
        newSuggestions.push(pattern.replace('{title}', title));
      });
    }

    if (selectedType === 'all' || selectedType === 'question') {
      titlePatterns.question.forEach((pattern) => {
        newSuggestions.push(pattern.replace('{title}', title));
      });
    }

    if (selectedType === 'all' || selectedType === 'current') {
      titlePatterns.current.forEach((pattern) => {
        newSuggestions.push(pattern.replace('{title}', title));
      });
    }

    // Add some custom variations
    if (selectedType === 'all') {
      newSuggestions.push(`${title} | 완벽 정리`);
      newSuggestions.push(`${title} 꿀팁 대방출`);
      newSuggestions.push(`놓치면 후회할 ${title}`);
      newSuggestions.push(`${title} 이것만 보세요`);
    }

    setSuggestions(newSuggestions);
    setMetaDescription(null);
    setSeoKeywordsResult([]);
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const titleTypes = [
    { value: 'all', label: '전체' },
    { value: 'howTo', label: '가이드형' },
    { value: 'list', label: '리스트형' },
    { value: 'review', label: '후기형' },
    { value: 'comparison', label: '비교형' },
    { value: 'question', label: '질문형' },
    { value: 'current', label: '트렌드형' },
  ];

  const isAISuggestion = (item: string | AISuggestion): item is AISuggestion => {
    return typeof item === 'object' && 'title' in item;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
        {/* AI Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Type className="w-5 h-5" />
            SEO 제목 변환
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">AI 모드</span>
            <button
              onClick={() => setUseAI(!useAI)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                useAI ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  useAI ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* AI API Key Input */}
        {useAI && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Gemini API 키
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2 pr-20 border border-purple-300 dark:border-purple-600 rounded-md
                         bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                {showApiKey ? '숨기기' : '보기'}
              </button>
            </div>
            <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
              Google AI Studio에서 API 키를 발급받으세요: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">aistudio.google.com/apikey</a>
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            원본 제목
          </label>
          <input
            type="text"
            value={originalTitle}
            onChange={(e) => setOriginalTitle(e.target.value)}
            placeholder="예: 제주도 여행"
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {!useAI && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              제목 유형
            </label>
            <div className="flex flex-wrap gap-2">
              {titleTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type.value
                      ? 'bg-pink-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={generateSuggestions}
          disabled={!originalTitle.trim() || isLoading}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            useAI
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-pink-600 hover:bg-pink-700'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI가 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {useAI ? 'AI로 SEO 제목 생성하기' : 'SEO 제목 생성하기'}
            </>
          )}
        </button>
      </div>

      {/* AI-generated Meta Description & Keywords */}
      {useAI && (metaDescription || seoKeywordsResult.length > 0) && (
        <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-800 space-y-4">
          {metaDescription && (
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI 추천 메타 설명
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm bg-white dark:bg-zinc-800 p-3 rounded-lg">
                {metaDescription}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {metaDescription.length}자 (권장: 150자 이내)
              </p>
            </div>
          )}

          {seoKeywordsResult.length > 0 && (
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                핵심 SEO 키워드
              </h3>
              <div className="flex flex-wrap gap-2">
                {seoKeywordsResult.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white dark:bg-zinc-800 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Type className="w-5 h-5" />
                추천 제목 ({suggestions.length}개)
                {useAI && <span className="text-xs text-purple-500 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">AI</span>}
              </h3>
              <button
                onClick={generateSuggestions}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                다시 생성
              </button>
            </div>

            <div className="space-y-3">
              {suggestions.map((suggestion, index) => {
                const isAI = isAISuggestion(suggestion);
                const titleText = isAI ? suggestion.title : suggestion;

                return (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors group"
                  >
                    <div className="flex-1">
                      <p className="text-zinc-900 dark:text-zinc-50 font-medium">
                        {titleText}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">
                          {titleText.length}자
                        </span>
                        {isAI && (
                          <>
                            <span className="text-xs px-2 py-0.5 bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 rounded">
                              {suggestion.type}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {suggestion.score}점
                            </span>
                          </>
                        )}
                      </div>
                      {isAI && suggestion.reason && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                          {suggestion.reason}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopy(titleText, index)}
                      className="ml-4 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {copied === index ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* SEO Keywords Reference */}
      {!useAI && (
        <div className="bg-pink-50 dark:bg-pink-950/30 p-6 rounded-lg border border-pink-200 dark:border-pink-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            SEO 최적화 키워드
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {seoKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white dark:bg-zinc-900 text-pink-700 dark:text-pink-300 rounded-full text-sm border border-pink-200 dark:border-pink-800"
              >
                {keyword}
              </span>
            ))}
          </div>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 숫자를 포함하면 클릭률이 높아집니다 (예: TOP 10, 5가지 방법)</li>
            <li>• '완벽', '총정리', '꿀팁' 같은 강조 단어를 사용하세요</li>
            <li>• 제목은 30-60자 사이가 적당합니다</li>
            <li>• 현재 연도(2026)를 포함하면 최신성을 강조할 수 있습니다</li>
            <li>• 질문형 제목은 독자의 호기심을 자극합니다</li>
          </ul>
        </div>
      )}

      {/* AI Mode Info */}
      {useAI && suggestions.length === 0 && !isLoading && (
        <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            AI 모드 기능
          </h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• AI가 트렌드와 검색 패턴을 분석하여 SEO 최적화 제목 생성</li>
            <li>• 각 제목에 대한 예상 클릭률 점수 제공</li>
            <li>• 추천 메타 설명 자동 생성</li>
            <li>• 핵심 SEO 키워드 추출</li>
            <li>• 제목 유형(가이드/리스트/후기 등)별 분류</li>
          </ul>
        </div>
      )}

      {/* Examples */}
      {!useAI && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            변환 예시
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-1">변환 전</p>
              <p className="text-zinc-900 dark:text-zinc-50">제주도 여행</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2 mb-1">변환 후</p>
              <p className="text-pink-600 dark:text-pink-400 font-medium">
                제주도 여행 완벽 가이드 | 2026년 최신 BEST 10
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-1">변환 전</p>
              <p className="text-zinc-900 dark:text-zinc-50">다이어트 방법</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2 mb-1">변환 후</p>
              <p className="text-pink-600 dark:text-pink-400 font-medium">
                다이어트 방법 꿀팁 대방출 | 효과적인 7가지 방법
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
