'use client';

import { useState } from 'react';
import { Hash, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';

// Korean common words to filter out
const stopWords = new Set([
  '을', '를', '이', '가', '은', '는', '의', '에', '에서', '으로', '와', '과',
  '도', '만', '까지', '부터', '보다', '같이', '처럼', '한테', '께',
  '그리고', '그러나', '하지만', '또한', '즉', '예를', '들어', '따라서',
  '그래서', '왜냐하면', '만약', '아니면', '또는', '및', '등',
  '있다', '없다', '이다', '아니다', '하다', '되다', '같다', '다르다',
  '것', '수', '때', '곳', '등', '지', '말', '나', '너', '우리', '저',
  '그', '이', '저', '그것', '이것', '저것', '여기', '거기', '저기',
]);

// Category-based tag suggestions
const categoryTags = {
  여행: ['여행', '여행스타그램', '국내여행', '해외여행', '여행지추천', '여행기록'],
  맛집: ['맛집', '맛집탐방', '맛스타그램', '먹스타그램', '음식', '푸드'],
  카페: ['카페', '카페투어', '카페스타그램', '커피', '디저트', '베이커리'],
  일상: ['일상', '데일리', '오늘', '일상스타그램', '소소한일상'],
  운동: ['운동', '헬스', '다이어트', '건강', '운동스타그램', '홈트'],
  독서: ['독서', '책', '책스타그램', '독서기록', '북스타그램', '리뷰'],
  요리: ['요리', '홈쿡', '집밥', '레시피', '요리스타그램', '쿠킹'],
};

export default function TagGenerator() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState<{ tags: boolean; hashtags: boolean }>({
    tags: false,
    hashtags: false,
  });

  const extractKeywords = (text: string): string[] => {
    // Remove special characters and split into words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1 && !stopWords.has(word));

    // Count word frequency
    const frequency: { [key: string]: number } = {};
    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and get top keywords
    const sortedWords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return sortedWords;
  };

  const detectCategory = (text: string): string[] => {
    const detectedTags: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [category, tags] of Object.entries(categoryTags)) {
      if (lowerText.includes(category)) {
        detectedTags.push(...tags);
      }
    }

    return detectedTags;
  };

  const generateTags = () => {
    const combinedText = `${title} ${content}`;

    // Extract keywords from content
    const keywords = extractKeywords(combinedText);

    // Detect category-based tags
    const categoryBasedTags = detectCategory(combinedText);

    // Combine and deduplicate
    const allTags = [...new Set([...keywords, ...categoryBasedTags])];

    // Generate tags (without #)
    const generatedTags = allTags.slice(0, 15);

    // Generate hashtags (with #)
    const generatedHashtags = generatedTags.map(tag => `#${tag}`);

    setTags(generatedTags);
    setHashtags(generatedHashtags);
  };

  const handleCopy = async (type: 'tags' | 'hashtags') => {
    const textToCopy = type === 'tags' ? tags.join(', ') : hashtags.join(' ');
    await navigator.clipboard.writeText(textToCopy);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => {
      setCopied({ ...copied, [type]: false });
    }, 2000);
  };

  const addCustomTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setHashtags([...hashtags, `#${tag}`]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            블로그 제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 제주도 3박 4일 여행 후기"
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        <button
          onClick={generateTags}
          disabled={!content && !title}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          태그 생성하기
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
                  className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm"
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

          {/* Regenerate Button */}
          <button
            onClick={generateTags}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            다시 생성하기
          </button>
        </>
      )}

      {/* Instructions */}
      <div className="bg-orange-50 dark:bg-orange-950/30 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          💡 사용 방법
        </h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>• 블로그 제목과 내용을 입력하면 자동으로 태그를 생성합니다</li>
          <li>• 생성된 태그는 빈도수와 카테고리 기반으로 추천됩니다</li>
          <li>• 복사 버튼을 클릭하여 태그나 해시태그를 한 번에 복사할 수 있습니다</li>
          <li>• 태그는 쉼표로 구분되고, 해시태그는 공백으로 구분됩니다</li>
          <li>• 더 정확한 태그를 원하시면 내용을 더 자세히 작성해주세요</li>
        </ul>
      </div>
    </div>
  );
}
