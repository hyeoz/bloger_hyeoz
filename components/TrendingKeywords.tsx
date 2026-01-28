'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw, Search, Copy, Check } from 'lucide-react';

interface TrendKeyword {
  rank: number;
  keyword: string;
  change: 'up' | 'down' | 'new' | 'same';
  changeRank?: number;
  searchVolume?: number;
  category?: string;
}

interface TrendCategory {
  id: string;
  name: string;
  icon: string;
  keywords: TrendKeyword[];
}

interface TrendResponse {
  success: boolean;
  source: string;
  message?: string;
  data: TrendCategory[];
  lastUpdated: string;
}

interface AnalyzeResultItem {
  keyword: string;
  popularity: number;
  trend: 'up' | 'down';
}

interface AnalyzeResult {
  success: boolean;
  source: string;
  message?: string;
  data: {
    keywords: string[];
    trend: AnalyzeResultItem[];
  };
  lastUpdated: string;
}

export default function TrendingKeywords() {
  const [trendData, setTrendData] = useState<TrendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('realtime');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  // 키워드 검색 분석 상태
  const [analyzeKeywords, setAnalyzeKeywords] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trends');
      const data: TrendResponse = await response.json();

      if (data.success) {
        setTrendData(data.data);
        setSource(data.source);
        setMessage(data.message || '');
        setLastUpdated(data.lastUpdated);
        if (data.data.length > 0) {
          setActiveCategory(data.data[0].id);
        }
      } else {
        setError('트렌드 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const analyzeKeywordTrend = async () => {
    if (!analyzeKeywords.trim()) return;

    setAnalyzing(true);
    try {
      const keywords = analyzeKeywords.split(',').map(k => k.trim()).filter(k => k);
      const response = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
      });
      const data = await response.json();
      setAnalyzeResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case 'new':
        return <Sparkles className="w-4 h-4 text-yellow-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeBadge = (keyword: TrendKeyword) => {
    if (keyword.change === 'new') {
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded">
          NEW
        </span>
      );
    }
    if (keyword.changeRank && keyword.changeRank > 0) {
      const color = keyword.change === 'up' ? 'text-red-500' : 'text-blue-500';
      return (
        <span className={`ml-2 text-xs font-semibold ${color}`}>
          {keyword.change === 'up' ? '▲' : '▼'} {keyword.changeRank}
        </span>
      );
    }
    return null;
  };

  const activeData = trendData.find(cat => cat.id === activeCategory);

  const filteredKeywords = activeData?.keywords.filter(kw =>
    searchKeyword ? kw.keyword.toLowerCase().includes(searchKeyword.toLowerCase()) : true
  ) || [];

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">트렌드 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchTrends}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          네이버 트렌드 키워드
        </h2>
        <button
          onClick={fetchTrends}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700
                   text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                   transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>
      </div>

      {message && source === 'simulation' && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {message}
          </p>
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {trendData.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                ${activeCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 필터 */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="키워드 검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 키워드 목록 */}
      {activeData && (
        <div className="space-y-2">
          {filteredKeywords.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredKeywords.map((keyword) => (
              <div
                key={`${keyword.rank}-${keyword.keyword}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900
                         rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                    ${keyword.rank <= 3
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                    {keyword.rank}
                  </span>
                  <div className="flex items-center">
                    {getChangeIcon(keyword.change)}
                    <span className="ml-2 font-medium text-gray-800 dark:text-white">
                      {keyword.keyword}
                    </span>
                    {getChangeBadge(keyword)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {keyword.category && (
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900
                                   text-blue-700 dark:text-blue-300 rounded">
                      {keyword.category}
                    </span>
                  )}
                  {keyword.searchVolume && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      검색량: {keyword.searchVolume.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => copyKeyword(keyword.keyword)}
                    className="p-2 opacity-0 group-hover:opacity-100 transition-opacity
                             hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="키워드 복사"
                  >
                    {copiedKeyword === keyword.keyword ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 키워드 분석 섹션 */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          키워드 트렌드 분석
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={analyzeKeywords}
            onChange={(e) => setAnalyzeKeywords(e.target.value)}
            placeholder="분석할 키워드 입력 (쉼표로 구분, 최대 5개)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={analyzeKeywordTrend}
            disabled={analyzing || !analyzeKeywords.trim()}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400
                     text-white font-semibold rounded-lg transition-colors"
          >
            {analyzing ? '분석 중...' : '분석하기'}
          </button>
        </div>

        {analyzeResult && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium text-gray-800 dark:text-white mb-3">분석 결과</h4>
            {analyzeResult.data?.trend ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analyzeResult.data.trend.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800 dark:text-white">{item.keyword}</span>
                      {item.trend === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-red-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      인기도: {item.popularity}%
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.trend === 'up' ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${item.popularity}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-sm text-gray-600 dark:text-gray-400 overflow-auto">
                {JSON.stringify(analyzeResult, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* 마지막 업데이트 시간 */}
      {lastUpdated && (
        <div className="mt-6 text-right text-sm text-gray-500 dark:text-gray-400">
          마지막 업데이트: {new Date(lastUpdated).toLocaleString('ko-KR')}
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">사용 팁</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>인기 키워드를 클릭하면 복사할 수 있습니다.</li>
          <li>블로그 주제 선정 시 급상승 키워드를 참고하세요.</li>
          <li>연령대별, 카테고리별 트렌드로 타겟 독자를 파악하세요.</li>
          <li>네이버 API 키를 설정하면 실시간 데이터를 확인할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
