'use client';

import { useState } from 'react';
import { Hash, Copy, Check, Sparkles, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface AITagResult {
  tags: string[];
  hashtags: string[];
  relatedKeywords?: string[];
}

export default function TagGenerator() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const [copied, setCopied] = useState<{ tags: boolean; hashtags: boolean }>({
    tags: false,
    hashtags: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTags = async () => {
    if (!content && !title) {
      setError('제목 또는 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'tags',
          title: title,
          content: content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI 요청 실패');
      }

      const result = data.data as AITagResult;
      if (result.tags && result.hashtags) {
        setTags(result.tags);
        setHashtags(result.hashtags);
        setRelatedKeywords(result.relatedKeywords || []);
      } else if (data.data?.raw) {
        setError('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (type: 'tags' | 'hashtags') => {
    const textToCopy = type === 'tags' ? tags.join(', ') : hashtags.join(' ');
    await navigator.clipboard.writeText(textToCopy);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => {
      setCopied({ ...copied, [type]: false });
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <Hash className="w-5 h-5" />
          AI 태그 생성기
          <Sparkles className="w-4 h-4 text-purple-500" />
        </h3>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            블로그 제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 제주도 3박 4일 여행 후기"
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            블로그 내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="블로그 글의 내용을 입력하세요. 키워드가 많을수록 더 정확한 태그를 생성할 수 있습니다."
            rows={8}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        <button
          onClick={generateTags}
          disabled={(!content && !title) || isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI가 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              AI로 태그 생성하기
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {tags.length > 0 && (
        <>
          {/* Tags */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                태그 (# 없이)
              </h3>
              <button
                onClick={() => handleCopy('tags')}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {copied.tags ? (
                  <>
                    <Check className="w-4 h-4" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    복사
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
              {tags.join(', ')}
            </p>
          </div>

          {/* Hashtags */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                해시태그 (# 포함)
              </h3>
              <button
                onClick={() => handleCopy('hashtags')}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {copied.hashtags ? (
                  <>
                    <Check className="w-4 h-4" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    복사
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
              {hashtags.join(' ')}
            </p>
          </div>

          {/* Related Keywords */}
          {relatedKeywords.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-500" />
                AI 추천 관련 키워드
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Regenerate Button */}
          <button
            onClick={generateTags}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-5 h-5" />
            다시 생성하기
          </button>
        </>
      )}

      {/* Instructions */}
      <div className="bg-purple-50 dark:bg-purple-950/30 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          사용 방법
        </h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>• 블로그 제목과 내용을 입력하면 Gemini AI가 SEO 최적화 태그를 생성합니다</li>
          <li>• AI가 추가로 관련 키워드도 추천해줍니다</li>
          <li>• 복사 버튼을 클릭하여 태그나 해시태그를 한 번에 복사할 수 있습니다</li>
          <li>• 태그는 쉼표로 구분되고, 해시태그는 공백으로 구분됩니다</li>
        </ul>
      </div>
    </div>
  );
}
