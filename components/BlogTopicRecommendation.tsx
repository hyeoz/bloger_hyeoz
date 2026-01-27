'use client';

import { useState } from 'react';
import { Sparkles, Lightbulb, Copy, Check, Loader2, Key, AlertCircle } from 'lucide-react';

interface Topic {
  title: string;
  description: string;
  category: string;
  keywords: string[];
  outline?: string[];
}

const topicDatabase: { [key: string]: Topic[] } = {
  'technology': [
    { title: 'AI와 머신러닝의 미래', description: 'AI 기술이 우리 삶에 미치는 영향과 앞으로의 발전 방향', category: '기술', keywords: ['AI', '머신러닝', '기술'] },
    { title: '클라우드 컴퓨팅 완벽 가이드', description: 'AWS, Azure, GCP 등 주요 클라우드 서비스 비교 및 활용법', category: '기술', keywords: ['클라우드', 'AWS', '인프라'] },
    { title: '블록체인 기술의 실제 활용 사례', description: '암호화폐를 넘어선 블록체인의 다양한 활용 분야', category: '기술', keywords: ['블록체인', '암호화폐', '기술'] },
    { title: '사이버 보안 필수 가이드', description: '개인 정보 보호와 보안을 위한 실용적인 팁', category: '기술', keywords: ['보안', '해킹', '프라이버시'] },
  ],
  'lifestyle': [
    { title: '미니멀 라이프스타일 시작하기', description: '덜어냄으로 얻는 풍요로움, 미니멀리즘 실천법', category: '라이프스타일', keywords: ['미니멀', '정리', '라이프스타일'] },
    { title: '재택근무 효율적으로 하는 방법', description: '홈오피스 환경 구축과 업무 생산성 향상 노하우', category: '라이프스타일', keywords: ['재택근무', '생산성', '업무'] },
    { title: '일상 속 건강한 습관 만들기', description: '작은 변화로 시작하는 건강한 생활', category: '라이프스타일', keywords: ['건강', '습관', '운동'] },
    { title: '시간 관리의 기술', description: '바쁜 현대인을 위한 효과적인 시간 활용법', category: '라이프스타일', keywords: ['시간관리', '생산성', '자기계발'] },
  ],
  'food': [
    { title: '초보자를 위한 홈카페 시작 가이드', description: '집에서 카페 음료 만들기, 필요한 도구와 레시피', category: '음식', keywords: ['카페', '커피', '음료'] },
    { title: '건강한 한 끼 식사 준비 아이디어', description: '영양 균형을 고려한 간단한 식단 구성법', category: '음식', keywords: ['요리', '건강식', '레시피'] },
    { title: '비건 요리 레시피 모음', description: '맛있고 건강한 식물성 식단 아이디어', category: '음식', keywords: ['비건', '채식', '요리'] },
    { title: '세계 각국의 길거리 음식 탐방', description: '여행하며 맛본 세계의 다양한 길거리 음식', category: '음식', keywords: ['여행', '길거리음식', '맛집'] },
  ],
  'travel': [
    { title: '국내 숨은 명소 여행기', description: '관광객이 잘 모르는 아름다운 국내 여행지', category: '여행', keywords: ['국내여행', '명소', '관광'] },
    { title: '저예산 해외여행 완벽 가이드', description: '적은 비용으로 알차게 여행하는 노하우', category: '여행', keywords: ['해외여행', '저예산', '배낭여행'] },
    { title: '디지털 노마드 생활 시작하기', description: '전 세계를 여행하며 일하는 삶의 방식', category: '여행', keywords: ['디지털노마드', '원격근무', '여행'] },
    { title: '가족 여행 추천 여행지', description: '아이들과 함께 즐길 수 있는 여행지 추천', category: '여행', keywords: ['가족여행', '아이', '여행지'] },
  ],
  'business': [
    { title: '1인 창업 성공 전략', description: '소자본으로 시작하는 창업 아이템과 운영 노하우', category: '비즈니스', keywords: ['창업', '스타트업', '사업'] },
    { title: '효과적인 마케팅 전략', description: 'SNS 마케팅부터 콘텐츠 마케팅까지', category: '비즈니스', keywords: ['마케팅', 'SNS', '광고'] },
    { title: '프리랜서로 성공하기', description: '프리랜서 시작부터 고객 관리까지', category: '비즈니스', keywords: ['프리랜서', '부업', '재테크'] },
    { title: '리더십과 팀 관리', description: '효과적인 팀 운영과 리더십 스킬 향상법', category: '비즈니스', keywords: ['리더십', '팀워크', '경영'] },
  ],
  'personal_development': [
    { title: '효과적인 독서법과 독서 습관', description: '책을 통한 성장, 독서 루틴 만들기', category: '자기계발', keywords: ['독서', '책', '학습'] },
    { title: '성공하는 사람들의 아침 루틴', description: '생산적인 하루를 위한 모닝 루틴 구축법', category: '자기계발', keywords: ['아침', '루틴', '습관'] },
    { title: '목표 설정과 실행 전략', description: '목표를 달성하기 위한 실용적인 방법론', category: '자기계발', keywords: ['목표', '계획', '실행'] },
    { title: '감정 관리와 멘탈 케어', description: '스트레스 관리와 정신 건강 유지 방법', category: '자기계발', keywords: ['감정', '멘탈', '힐링'] },
  ],
};

export default function BlogTopicRecommendation() {
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [recommendations, setRecommendations] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // AI Mode states
  const [useAI, setUseAI] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
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

  const generateWithAI = async () => {
    if (!apiKey) {
      setError('Gemini API 키를 입력해주세요.');
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

  const generateRecommendations = () => {
    if (useAI) {
      generateWithAI();
      return;
    }

    // Local mode
    let topics: Topic[] = [];

    if (category) {
      topics = [...topicDatabase[category]];
    } else {
      Object.values(topicDatabase).forEach(categoryTopics => {
        topics = [...topics, ...categoryTopics];
      });
    }

    if (keywords.trim()) {
      const keywordList = keywords.toLowerCase().split(',').map(k => k.trim());
      topics = topics.filter(topic =>
        keywordList.some(keyword =>
          topic.title.toLowerCase().includes(keyword) ||
          topic.description.toLowerCase().includes(keyword) ||
          topic.keywords.some(k => k.toLowerCase().includes(keyword))
        )
      );
    }

    const shuffled = topics.sort(() => Math.random() - 0.5);
    setRecommendations(shuffled.slice(0, 6));
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Lightbulb className="w-7 h-7 text-yellow-500" />
          AI 블로그 주제 추천
        </h2>

        {/* AI Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">AI 모드</span>
          <button
            onClick={() => setUseAI(!useAI)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              useAI ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
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

      <div className="space-y-6">
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
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            카테고리 선택 (선택사항)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={generateRecommendations}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg
                     transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2
                     ${useAI
                       ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-400'
                       : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400'
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
                {useAI ? 'AI로 주제 추천 받기' : '주제 추천 받기'}
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
              {useAI && <Sparkles className="w-5 h-5 text-purple-500" />}
              추천 주제 ({recommendations.length}개)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((topic, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer
                           bg-white dark:bg-gray-900 ${
                             selectedTopic === topic
                               ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                               : 'border-gray-200 dark:border-gray-700'
                           }`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-white pr-2">
                      {topic.title}
                    </h4>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded flex-shrink-0">
                      {topic.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {topic.description}
                  </p>

                  {/* Outline preview for AI mode */}
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
          <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              선택된 주제
            </h3>
            <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {selectedTopic.title}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {selectedTopic.description}
            </p>

            {/* Outline for selected topic */}
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
                      className="px-3 py-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium"
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
              카테고리나 키워드를 선택하고 "주제 추천 받기" 버튼을 클릭하세요.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {useAI
                ? '✨ AI 모드: Gemini AI가 트렌디한 주제를 실시간으로 생성합니다.'
                : '💡 아무것도 선택하지 않으면 모든 카테고리에서 랜덤으로 추천합니다.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
