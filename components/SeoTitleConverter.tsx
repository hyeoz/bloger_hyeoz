"use client";

import { useState } from "react";
import {
  Type,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

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
  const [originalTitle, setOriginalTitle] = useState("");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [metaDescription, setMetaDescription] = useState<string | null>(null);
  const [seoKeywordsResult, setSeoKeywordsResult] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async () => {
    if (!originalTitle.trim()) {
      setError("원본 제목을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "seo",
          title: originalTitle,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI 요청 실패");
      }

      const result = data.data;

      if (result?.suggestions && Array.isArray(result.suggestions)) {
        setSuggestions(result.suggestions);
        setMetaDescription(result.metaDescription || null);
        setSeoKeywordsResult(result.keywords || []);
      } else {
        setError("AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <Type className="w-5 h-5" />
          AI SEO 제목 변환
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
            원본 제목
          </label>
          <input
            type="text"
            value={originalTitle}
            onChange={(e) => setOriginalTitle(e.target.value)}
            placeholder="예: 제주도 여행"
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={generateSuggestions}
          disabled={!originalTitle.trim() || isLoading}
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
              AI로 SEO 제목 생성하기
            </>
          )}
        </button>
      </div>

      {/* AI-generated Meta Description & Keywords */}
      {(metaDescription || seoKeywordsResult.length > 0) && (
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
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors group"
                >
                  <div className="flex-1">
                    <p className="text-zinc-900 dark:text-zinc-50 font-medium">
                      {suggestion.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {suggestion.title.length}자
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 rounded">
                        {suggestion.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {suggestion.score}점
                      </span>
                    </div>
                    {suggestion.reason && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                        {suggestion.reason}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(suggestion.title, index)}
                    className="ml-4 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {copied === index ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Instructions */}
      <div className="bg-purple-50 dark:bg-purple-950/30 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          AI SEO 기능
        </h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>
            • Gemini AI가 트렌드와 검색 패턴을 분석하여 SEO 최적화 제목 생성
          </li>
          <li>• 각 제목에 대한 예상 클릭률 점수 제공</li>
          <li>• 추천 메타 설명 자동 생성</li>
          <li>• 핵심 SEO 키워드 추출</li>
          <li>• 제목 유형(가이드/리스트/후기 등)별 분류</li>
        </ul>
      </div>

      {/* Examples */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          변환 예시
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-1">
              변환 전
            </p>
            <p className="text-zinc-900 dark:text-zinc-50">제주도 여행</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2 mb-1">
              변환 후
            </p>
            <p className="text-purple-600 dark:text-purple-400 font-medium">
              제주도 여행 완벽 가이드 | 2026년 최신 BEST 10
            </p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-1">
              변환 전
            </p>
            <p className="text-zinc-900 dark:text-zinc-50">다이어트 방법</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2 mb-1">
              변환 후
            </p>
            <p className="text-purple-600 dark:text-purple-400 font-medium">
              다이어트 방법 꿀팁 대방출 | 효과적인 7가지 방법
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
