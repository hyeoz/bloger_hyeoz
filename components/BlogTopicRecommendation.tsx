'use client';

import { useState } from 'react';
import { Sparkles, Lightbulb, Copy, Check, Loader2, AlertCircle } from 'lucide-react';

interface Topic {
  title: string;
  description: string;
  category: string;
  keywords: string[];
  outline?: string[];
}

export default function BlogTopicRecommendation() {
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [recommendations, setRecommendations] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'technology', label: '기술/IT' },
    { value: 'lifestyle', label: '라이프스타일' },
    { value: 'food', label: '음식/요리' },
    { value: 'travel', label: '여행' },
    { value: 'business', label: '비즈니스/창업' },
    { value: 'personal_development', label: '자기계발' },
  ];

  const generateRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'topic',
          category: category ? categories.find(c => c.value === category)?.label : '',
          keywords: keywords,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI 요청 실패');
      }

      if (Array.isArray(data.data)) {
        setRecommendations(data.data);
      } else if (data.data?.raw) {
        setError('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCategory('');
    setKeywords('');
    setRecommendations([]);
    setSelectedTopic(null);
    setError(null);
  };

  const copyToClipboard = (topic: Topic, index: number) => {
    let text = `제목: ${topic.title}\n\n${topic.description}\n\n카테고리: ${topic.category}\n키워드: ${topic.keywords.join(', ')}`;
    if (topic.outline && topic.outline.length > 0) {
      text += `\n\n목차 제안:\n${topic.outline.map((item, i) => `${i + 1}. ${item}`).join('\n')}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
        <Lightbulb className="w-7 h-7 text-yellow-500" />
        AI 블로그 주제 추천
        <Sparkles className="w-5 h-5 text-purple-500" />
      </h2>

      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            카테고리 선택 (선택사항)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">전체 카테고리</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            키워드 입력 (쉼표로 구분, 선택사항)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="예: AI, 건강, 여행"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={generateRecommendations}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg
                     transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2
                     disabled:bg-purple-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI가 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AI로 주제 추천 받기
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg
                     transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            초기화
          </button>
        </div>

        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              추천 주제 ({recommendations.length}개)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((topic, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer
                           bg-white dark:bg-gray-900 ${
                             selectedTopic === topic
                               ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800'
                               : 'border-gray-200 dark:border-gray-700'
                           }`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-white pr-2">
                      {topic.title}
                    </h4>
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded flex-shrink-0">
                      {topic.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {topic.description}
                  </p>

                  {topic.outline && topic.outline.length > 0 && (
                    <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                      <span className="font-medium text-gray-700 dark:text-gray-300">목차 미리보기:</span>
                      <ul className="mt-1 text-gray-600 dark:text-gray-400">
                        {topic.outline.slice(0, 3).map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                        {topic.outline.length > 3 && <li>...</li>}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {topic.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(topic, index);
                    }}
                    className="mt-3 w-full px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded
                             transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        복사하기
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTopic && (
          <div className="p-6 bg-purple-50 dark:bg-purple-900/30 rounded-lg border-2 border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              선택된 주제
            </h3>
            <h4 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {selectedTopic.title}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {selectedTopic.description}
            </p>

            {selectedTopic.outline && selectedTopic.outline.length > 0 && (
              <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <span className="font-semibold text-gray-700 dark:text-gray-300">추천 목차:</span>
                <ol className="mt-2 space-y-1">
                  {selectedTopic.outline.map((item, i) => (
                    <li key={i} className="text-gray-600 dark:text-gray-400">
                      {i + 1}. {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">카테고리:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedTopic.category}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">추천 키워드:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTopic.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {recommendations.length === 0 && !isLoading && (
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              카테고리나 키워드를 선택하고 "AI로 주제 추천 받기" 버튼을 클릭하세요.
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Gemini AI가 트렌디한 블로그 주제를 실시간으로 생성합니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
