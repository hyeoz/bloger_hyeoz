"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  Search,
  Copy,
  Check,
  Clock,
  BarChart3,
} from "lucide-react";

interface TrendKeyword {
  rank: number;
  keyword: string;
  change: "up" | "down" | "new" | "same";
  changeRank?: number;
  searchVolume?: number;
  monthlyPcQcCnt?: number;
  monthlyMobileQcCnt?: number;
  category?: string;
  compIdx?: string;
}

interface TrendCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  keywords: TrendKeyword[];
}

interface TrendResponse {
  success: boolean;
  source: string;
  message?: string;
  data: TrendCategory[];
  lastUpdated: string;
}

export default function TrendingKeywords() {
  const [trendData, setTrendData] = useState<TrendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("popular");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/trends");
      const data: TrendResponse = await response.json();

      if (data.success) {
        setTrendData(data.data);
        setMessage(data.message || "");
        setLastUpdated(data.lastUpdated);
        if (
          data.data.length > 0 &&
          !data.data.some((cat) => cat.id === activeCategory)
        ) {
          setActiveCategory(data.data[0].id);
        }
      } else {
        setError("트렌드 데이터를 불러오는데 실패했습니다.");
      }
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // 자동 새로고침 (10분 간격)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(
      () => {
        fetchTrends();
      },
      10 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [autoRefresh, fetchTrends]);

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const copyAllKeywords = () => {
    if (!activeData) return;
    const keywords = activeData.keywords.map((k) => k.keyword).join(", ");
    navigator.clipboard.writeText(keywords);
    setCopiedKeyword("all");
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case "new":
        return <Sparkles className="w-4 h-4 text-yellow-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeBadge = (keyword: TrendKeyword) => {
    if (keyword.change === "new") {
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded">
          NEW
        </span>
      );
    }
    if (keyword.changeRank && keyword.changeRank > 0) {
      const color = keyword.change === "up" ? "text-red-500" : "text-blue-500";
      return (
        <span className={`ml-2 text-xs font-semibold ${color}`}>
          {keyword.change === "up" ? "▲" : "▼"} {keyword.changeRank}
        </span>
      );
    }
    return null;
  };

  const formatSearchVolume = (volume?: number) => {
    if (!volume) return null;
    if (volume >= 10000) {
      return `${(volume / 10000).toFixed(1)}만`;
    }
    return volume.toLocaleString();
  };

  const activeData = trendData.find((cat) => cat.id === activeCategory);

  const filteredKeywords =
    activeData?.keywords.filter((kw) =>
      searchKeyword
        ? kw.keyword.toLowerCase().includes(searchKeyword.toLowerCase())
        : true,
    ) || [];

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            트렌드 데이터를 불러오는 중...
          </span>
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

  if (trendData.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center py-12">
          <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
            표시할 트렌드 데이터가 없습니다.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {message ||
              "네이버 API 키/권한 설정 또는 네이버 API 응답 상태를 확인하세요."}
          </p>
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
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-500" />
            네이버 검색 트렌드
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            실시간 인기 검색어와 트렌드를 확인하세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            자동 갱신
          </label>
          <button
            onClick={fetchTrends}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700
                     text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                     transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>
      </div>

      {/* API 소스 안내 */}
      {message && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {message}
          </p>
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {trendData.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리 설명 */}
      {activeData && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {activeData.description}
          </p>
        </div>
      )}

      {/* 검색 및 복사 */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="키워드 필터링..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={copyAllKeywords}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700
                   text-white font-medium rounded-lg transition-colors"
        >
          {copiedKeyword === "all" ? (
            <>
              <Check className="w-4 h-4" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              전체 복사
            </>
          )}
        </button>
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
                onClick={() => copyKeyword(keyword.keyword)}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900
                         rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                         cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                    ${
                      keyword.rank <= 3
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
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
                    <span
                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900
                                   text-blue-700 dark:text-blue-300 rounded"
                    >
                      {keyword.category}
                    </span>
                  )}
                  {keyword.searchVolume && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {formatSearchVolume(keyword.searchVolume)}
                    </span>
                  )}
                  <span className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                    {copiedKeyword === keyword.keyword ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 마지막 업데이트 시간 */}
      {lastUpdated && (
        <div className="mt-6 flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          마지막 업데이트: {new Date(lastUpdated).toLocaleString("ko-KR")}
        </div>
      )}

      {/* 사용 팁 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          블로그 작성 팁
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>
              <strong>인기 검색어</strong>를 활용해 블로그 제목과 본문에
              자연스럽게 포함하세요.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>
              <strong>급상승 키워드</strong>는 경쟁이 적고 유입이 많을 수
              있어요.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>
              <strong>시즌 트렌드</strong>를 미리 파악해서 시의성 있는 콘텐츠를
              준비하세요.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>키워드를 클릭하면 복사되어 바로 활용할 수 있습니다.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
