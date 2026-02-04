import { NextResponse } from "next/server";
import crypto from "crypto";

// 트렌드 데이터 타입
export interface TrendKeyword {
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

function upsertTrendCategory(
  trendData: TrendCategory[],
  category: TrendCategory,
): TrendCategory[] {
  const index = trendData.findIndex((c) => c.id === category.id);
  if (index >= 0) {
    trendData[index] = category;
    return trendData;
  }
  trendData.push(category);
  return trendData;
}

async function fetchSearchTrend(
  clientId: string,
  clientSecret: string,
  keywordGroups: { groupName: string; keywords: string[] }[],
  opts?: {
    startDate?: string;
    endDate?: string;
    timeUnit?: "date" | "week" | "month";
    device?: "" | "pc" | "mo";
  },
): Promise<DataLabTrendResult[]> {
  const today = new Date();
  const endDate = opts?.endDate ?? new Date(today).toISOString().split("T")[0];

  const startDate =
    opts?.startDate ??
    new Date(new Date(today).setDate(today.getDate() - 14))
      .toISOString()
      .split("T")[0];

  const timeUnit = opts?.timeUnit ?? "date";
  const device = opts?.device ?? "";

  try {
    const response = await fetch(
      "https://openapi.naver.com/v1/datalab/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          timeUnit,
          keywordGroups,
          device,
          gender: "",
          ages: [],
        }),
      },
    );

    if (!response.ok) {
      console.error("DataLab search trend error:", response.status);
      return [];
    }

    const data = await response.json();
    const results = (data?.results ?? []) as DataLabTrendResult[];
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Failed to fetch search trend:", error);
    return [];
  }
}

async function fetchBlogDocumentCount(
  clientId: string,
  clientSecret: string,
  query: string,
): Promise<number | null> {
  try {
    const params = new URLSearchParams({
      query,
      display: "1",
      start: "1",
      sort: "sim",
    });
    const response = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const total = typeof data?.total === "number" ? data.total : null;
    return total;
  } catch (error) {
    console.error("Failed to fetch blog document count:", error);
    return null;
  }
}

function toTrendKeywordsFromSearchTrend(
  results: DataLabTrendResult[],
  mode: "latest" | "rising" | "falling",
  limit = 10,
): TrendKeyword[] {
  const enriched = results
    .map((r) => {
      const last = r.data?.[r.data.length - 1]?.ratio ?? 0;
      const prev = r.data?.[r.data.length - 2]?.ratio ?? 0;
      const diff = last - prev;
      const change: TrendKeyword["change"] =
        diff > 0 ? "up" : diff < 0 ? "down" : "same";
      return {
        title: r.title,
        last,
        diff,
        change,
        changeRank: Math.abs(Math.round(diff * 10)),
      };
    })
    .filter((x) => x.title);

  const sorted =
    mode === "latest"
      ? enriched.sort((a, b) => b.last - a.last)
      : mode === "rising"
        ? enriched.sort((a, b) => b.diff - a.diff)
        : enriched.sort((a, b) => a.diff - b.diff);

  return sorted.slice(0, limit).map((x, index) => ({
    rank: index + 1,
    keyword: x.title,
    change: x.change,
    changeRank: x.changeRank || undefined,
  }));
}

export interface TrendCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  keywords: TrendKeyword[];
}

type DataLabTrendResult = {
  title: string;
  keywords: string[];
  data: { period: string; ratio: number }[];
};

// 네이버 검색광고 API 서명 생성
function generateSignature(
  timestamp: string,
  method: string,
  uri: string,
  secretKey: string,
): string {
  const message = `${timestamp}.${method}.${uri}`;
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  return hmac.digest("base64");
}

// 네이버 검색광고 API - 연관 키워드 조회
async function fetchRelatedKeywords(
  customerId: string,
  apiKey: string,
  secretKey: string,
  seedKeyword: string,
): Promise<TrendKeyword[]> {
  const timestamp = String(Date.now());
  const method = "GET";
  const uri = "/keywordstool";
  const signature = generateSignature(timestamp, method, uri, secretKey);

  try {
    const params = new URLSearchParams({
      hintKeywords: seedKeyword,
      showDetail: "1",
    });

    const response = await fetch(
      `https://api.searchad.naver.com${uri}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "X-API-KEY": apiKey,
          "X-Customer": customerId,
          "X-Signature": signature,
          "X-Timestamp": timestamp,
        },
      },
    );

    if (!response.ok) {
      console.error("Search AD API error:", response.status);
      return [];
    }

    const data = await response.json();

    if (data.keywordList) {
      return data.keywordList.slice(0, 10).map(
        (
          item: {
            relKeyword: string;
            monthlyPcQcCnt: number;
            monthlyMobileQcCnt: number;
            compIdx: string;
          },
          index: number,
        ) => ({
          rank: index + 1,
          keyword: item.relKeyword,
          change: "same" as const,
          searchVolume:
            (item.monthlyPcQcCnt || 0) + (item.monthlyMobileQcCnt || 0),
          monthlyPcQcCnt: item.monthlyPcQcCnt,
          monthlyMobileQcCnt: item.monthlyMobileQcCnt,
          compIdx: item.compIdx,
        }),
      );
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch related keywords:", error);
    return [];
  }
}

// 네이버 DataLab 쇼핑인사이트 - 분야별 인기 검색어
async function fetchShoppingKeywords(
  clientId: string,
  clientSecret: string,
  categoryCode: string,
): Promise<TrendKeyword[]> {
  const today = new Date();
  const endDate = today.toISOString().split("T")[0];
  const startDate = new Date(today.setDate(today.getDate() - 7))
    .toISOString()
    .split("T")[0];

  try {
    const response = await fetch(
      "https://openapi.naver.com/v1/datalab/shopping/category/keywords",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          timeUnit: "date",
          category: categoryCode,
          device: "",
          gender: "",
          ages: [],
        }),
      },
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.results && data.results[0]?.data) {
      return data.results[0].data
        .slice(0, 10)
        .map((item: { rank: number; keyword: string }, index: number) => ({
          rank: item.rank || index + 1,
          keyword: item.keyword,
          change: "same" as const,
        }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch shopping keywords:", error);
    return [];
  }
}

// 네이버 DataLab 쇼핑인사이트 - 카테고리 트렌드
async function fetchCategoryTrend(
  clientId: string,
  clientSecret: string,
  categories: { name: string; param: { cid: string; cname: string }[] }[],
): Promise<TrendKeyword[]> {
  const today = new Date();
  const endDate = today.toISOString().split("T")[0];
  const startDate = new Date(today.setMonth(today.getMonth() - 1))
    .toISOString()
    .split("T")[0];

  try {
    const response = await fetch(
      "https://openapi.naver.com/v1/datalab/shopping/categories",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          timeUnit: "date",
          category: categories.map((cat) => ({
            name: cat.name,
            param: cat.param,
          })),
          device: "",
          gender: "",
          ages: [],
        }),
      },
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.results) {
      return data.results.map(
        (
          result: { title: string; data: { ratio: number }[] },
          index: number,
        ) => {
          const latestRatio = result.data[result.data.length - 1]?.ratio || 0;
          const prevRatio = result.data[result.data.length - 2]?.ratio || 0;
          const change =
            latestRatio > prevRatio
              ? "up"
              : latestRatio < prevRatio
                ? "down"
                : "same";

          return {
            rank: index + 1,
            keyword: result.title,
            change: change as "up" | "down" | "same",
            changeRank: Math.abs(Math.round((latestRatio - prevRatio) * 10)),
            category: result.title,
          };
        },
      );
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch category trend:", error);
    return [];
  }
}

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const searchAdCustomerId = process.env.NAVER_SEARCHAD_CUSTOMER_ID;
  const searchAdApiKey = process.env.NAVER_SEARCHAD_API_KEY;
  const searchAdSecretKey = process.env.NAVER_SEARCHAD_SECRET_KEY;
  const enableBlogCompetition =
    (process.env.NAVER_TRENDS_ENABLE_BLOG_COMPETITION ?? "1") !== "0";

  const trendData: TrendCategory[] = [];
  let source = "none";
  let message: string | undefined = undefined;

  if (clientId && clientSecret) {
    try {
      const baseKeywords = [
        "블로그",
        "블로그 글쓰기",
        "블로그 제목",
        "SEO",
        "네이버 검색",
        "키워드",
        "맛집",
        "여행",
        "다이어트",
        "재테크",
      ];

      const results: DataLabTrendResult[] = [];
      const batchSize = 5;
      for (let i = 0; i < baseKeywords.length; i += batchSize) {
        const batch = baseKeywords.slice(i, i + batchSize);
        const keywordGroups = batch.map((k) => ({
          groupName: k,
          keywords: [k],
        }));

        const batchResults = await fetchSearchTrend(
          clientId,
          clientSecret,
          keywordGroups,
          {
            timeUnit: "date",
          },
        );
        results.push(...batchResults);
      }

      if (results.length > 0) {
        const popular = toTrendKeywordsFromSearchTrend(results, "latest", 10);
        const rising = toTrendKeywordsFromSearchTrend(results, "rising", 10)
          .filter((k) => k.change === "up")
          .slice(0, 10);

        const falling = toTrendKeywordsFromSearchTrend(results, "falling", 10)
          .filter((k) => k.change === "down")
          .slice(0, 10);

        if (popular.length > 0) {
          upsertTrendCategory(trendData, {
            id: "popular",
            name: "블로그 유입 관심 키워드",
            icon: "🧭",
            description:
              "네이버 DataLab 검색어 트렌드 기반으로 블로그 유입에 활용하기 좋은 관심 키워드의 최근 강도를 보여줍니다.",
            keywords: popular,
          });
        }

        if (rising.length > 0) {
          upsertTrendCategory(trendData, {
            id: "rising",
            name: "상승세 키워드",
            icon: "📈",
            description:
              "최근 데이터 대비 상승 폭이 큰 키워드입니다(상대지표 기반).",
            keywords: rising,
          });
        }

        if (falling.length > 0) {
          upsertTrendCategory(trendData, {
            id: "falling",
            name: "하락세 키워드",
            icon: "📉",
            description:
              "최근 데이터 대비 하락 폭이 큰 키워드입니다(상대지표 기반).",
            keywords: falling,
          });
        }

        source = source === "none" ? "naver_datalab_search" : "naver_mixed";
      }
    } catch (error) {
      console.error("Error fetching DataLab Search trend:", error);
    }
  }

  // 네이버 검색광고 API가 설정된 경우 실제 데이터 가져오기
  if (searchAdCustomerId && searchAdApiKey && searchAdSecretKey) {
    try {
      // 여러 시드 키워드로 인기 키워드 조회
      const seedKeywords = ["블로그", "여행", "맛집", "다이어트", "재테크"];
      const allKeywords: TrendKeyword[] = [];

      for (const seed of seedKeywords) {
        const keywords = await fetchRelatedKeywords(
          searchAdCustomerId,
          searchAdApiKey,
          searchAdSecretKey,
          seed,
        );
        allKeywords.push(...keywords);
      }

      if (allKeywords.length > 0) {
        // 검색량 기준 정렬 후 중복 제거
        const uniqueKeywords = Array.from(
          new Map(allKeywords.map((k) => [k.keyword, k])).values(),
        )
          .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
          .slice(0, 10)
          .map((k, index) => ({ ...k, rank: index + 1 }));

        upsertTrendCategory(trendData, {
          id: "popular",
          name: "인기 검색어 TOP 10",
          icon: "🔥",
          description: "현재 가장 많이 검색되는 키워드입니다.",
          keywords: uniqueKeywords,
        });
        source = "naver_searchad";
        message = undefined;
      }
    } catch (error) {
      console.error("Error fetching Search AD data:", error);
    }
  }

  // 네이버 DataLab API가 설정된 경우 쇼핑 트렌드 가져오기
  if (clientId && clientSecret) {
    try {
      const shoppingKeywords = await fetchShoppingKeywords(
        clientId,
        clientSecret,
        "50000000",
      );

      if (shoppingKeywords.length > 0) {
        upsertTrendCategory(trendData, {
          id: "shopping",
          name: "쇼핑 인기 검색어",
          icon: "🛒",
          description: "네이버 쇼핑에서 인기 있는 검색어입니다.",
          keywords: shoppingKeywords.map((k, index) => ({
            ...k,
            rank: index + 1,
            category: "패션의류",
          })),
        });
        source = source === "none" ? "naver_datalab" : "naver_mixed";
        message = undefined;
      }

      // 쇼핑 카테고리별 트렌드 조회
      const categories = [
        { name: "패션의류", param: [{ cid: "50000000", cname: "패션의류" }] },
        {
          name: "디지털/가전",
          param: [{ cid: "50000001", cname: "디지털/가전" }],
        },
        { name: "식품", param: [{ cid: "50000003", cname: "식품" }] },
        {
          name: "출산/유아동",
          param: [{ cid: "50000005", cname: "출산/유아동" }],
        },
        {
          name: "스포츠/레저",
          param: [{ cid: "50000007", cname: "스포츠/레저" }],
        },
        {
          name: "화장품/미용",
          param: [{ cid: "50000002", cname: "화장품/미용" }],
        },
      ];

      const categoryTrends = await fetchCategoryTrend(
        clientId,
        clientSecret,
        categories,
      );

      if (categoryTrends.length > 0) {
        upsertTrendCategory(trendData, {
          id: "shopping_categories",
          name: "쇼핑 카테고리 트렌드",
          icon: "🧺",
          description: "최근 1개월 기준 쇼핑 카테고리 관심도 변화입니다.",
          keywords: categoryTrends,
        });
        source = source === "none" ? "naver_datalab" : "naver_mixed";
        message = undefined;
      }
    } catch (error) {
      console.error("Error fetching DataLab data:", error);
    }
  }

  if (clientId && clientSecret && enableBlogCompetition) {
    try {
      const popularCategory = trendData.find((c) => c.id === "popular");
      const keywordsForCompetition =
        popularCategory?.keywords?.slice(0, 5) ?? [];

      if (keywordsForCompetition.length > 0) {
        const counts = await Promise.all(
          keywordsForCompetition.map(async (k) => {
            const total = await fetchBlogDocumentCount(
              clientId,
              clientSecret,
              k.keyword,
            );
            return { keyword: k.keyword, total };
          }),
        );

        const competitionKeywords: TrendKeyword[] = counts
          .filter((c) => typeof c.total === "number")
          .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
          .slice(0, 10)
          .map((c, index) => ({
            rank: index + 1,
            keyword: c.keyword,
            change: "same" as const,
            searchVolume: c.total ?? undefined,
            category: "블로그 문서수",
          }));

        if (competitionKeywords.length > 0) {
          upsertTrendCategory(trendData, {
            id: "competition",
            name: "블로그 경쟁도(문서수)",
            icon: "🧱",
            description:
              "네이버 블로그 검색 결과의 총 문서수(total)로 추정한 경쟁도입니다(값이 클수록 경쟁이 높을 수 있어요).",
            keywords: competitionKeywords,
          });

          source = source === "none" ? "naver_search_blog" : "naver_mixed";
          message = undefined;
        }
      }
    } catch (error) {
      console.error("Error fetching blog competition data:", error);
    }
  }

  if (trendData.length === 0) {
    message =
      "실제 트렌드 데이터를 가져오지 못했습니다. API 키/권한 설정과 네이버 API 응답 상태를 확인하세요.";
  }

  return NextResponse.json({
    success: true,
    source,
    message: message || undefined,
    data: trendData,
    lastUpdated: new Date().toISOString(),
  });
}
