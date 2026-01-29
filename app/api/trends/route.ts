import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 트렌드 데이터 타입
export interface TrendKeyword {
  rank: number;
  keyword: string;
  change: 'up' | 'down' | 'new' | 'same';
  changeRank?: number;
  searchVolume?: number;
  monthlyPcQcCnt?: number;
  monthlyMobileQcCnt?: number;
  category?: string;
  compIdx?: string;
}

export interface TrendCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  keywords: TrendKeyword[];
}

// 네이버 검색광고 API 서명 생성
function generateSignature(timestamp: string, method: string, uri: string, secretKey: string): string {
  const message = `${timestamp}.${method}.${uri}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('base64');
}

// 네이버 검색광고 API - 연관 키워드 조회
async function fetchRelatedKeywords(
  customerId: string,
  apiKey: string,
  secretKey: string,
  seedKeyword: string
): Promise<TrendKeyword[]> {
  const timestamp = String(Date.now());
  const method = 'GET';
  const uri = '/keywordstool';
  const signature = generateSignature(timestamp, method, uri, secretKey);

  try {
    const params = new URLSearchParams({
      hintKeywords: seedKeyword,
      showDetail: '1',
    });

    const response = await fetch(
      `https://api.searchad.naver.com${uri}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          'X-Customer': customerId,
          'X-Signature': signature,
          'X-Timestamp': timestamp,
        },
      }
    );

    if (!response.ok) {
      console.error('Search AD API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (data.keywordList) {
      return data.keywordList
        .slice(0, 10)
        .map((item: {
          relKeyword: string;
          monthlyPcQcCnt: number;
          monthlyMobileQcCnt: number;
          compIdx: string;
        }, index: number) => ({
          rank: index + 1,
          keyword: item.relKeyword,
          change: 'same' as const,
          searchVolume: (item.monthlyPcQcCnt || 0) + (item.monthlyMobileQcCnt || 0),
          monthlyPcQcCnt: item.monthlyPcQcCnt,
          monthlyMobileQcCnt: item.monthlyMobileQcCnt,
          compIdx: item.compIdx,
        }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch related keywords:', error);
    return [];
  }
}

// 네이버 DataLab 쇼핑인사이트 - 분야별 인기 검색어
async function fetchShoppingKeywords(
  clientId: string,
  clientSecret: string,
  categoryCode: string
): Promise<TrendKeyword[]> {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];

  try {
    const response = await fetch(
      'https://openapi.naver.com/v1/datalab/shopping/category/keywords',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          timeUnit: 'date',
          category: categoryCode,
          device: '',
          gender: '',
          ages: [],
        }),
      }
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
          change: 'same' as const,
        }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch shopping keywords:', error);
    return [];
  }
}

// 네이버 DataLab 쇼핑인사이트 - 카테고리 트렌드
async function fetchCategoryTrend(
  clientId: string,
  clientSecret: string,
  categories: { name: string; param: { cid: string; cname: string }[] }[]
): Promise<TrendKeyword[]> {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];

  try {
    const response = await fetch(
      'https://openapi.naver.com/v1/datalab/shopping/categories',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          timeUnit: 'date',
          category: categories.map(cat => ({
            name: cat.name,
            param: cat.param,
          })),
          device: '',
          gender: '',
          ages: [],
        }),
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.results) {
      return data.results.map((result: { title: string; data: { ratio: number }[] }, index: number) => {
        const latestRatio = result.data[result.data.length - 1]?.ratio || 0;
        const prevRatio = result.data[result.data.length - 2]?.ratio || 0;
        const change = latestRatio > prevRatio ? 'up' : latestRatio < prevRatio ? 'down' : 'same';

        return {
          rank: index + 1,
          keyword: result.title,
          change: change as 'up' | 'down' | 'same',
          changeRank: Math.abs(Math.round((latestRatio - prevRatio) * 10)),
          category: result.title,
        };
      });
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch category trend:', error);
    return [];
  }
}

// 시뮬레이션 데이터 (API 키가 없을 때 사용)
function getSimulatedTrendData(): TrendCategory[] {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;

  return [
    {
      id: 'popular',
      name: `인기 검색어 TOP 10`,
      icon: '🔥',
      description: '현재 가장 많이 검색되는 키워드입니다.',
      keywords: [
        { rank: 1, keyword: '발렌타인데이 선물', change: 'up', changeRank: 5, searchVolume: 74000 },
        { rank: 2, keyword: '설 연휴 여행지', change: 'up', changeRank: 3, searchVolume: 62000 },
        { rank: 3, keyword: '다이어트 식단', change: 'same', searchVolume: 58000 },
        { rank: 4, keyword: 'AI 챗봇 추천', change: 'up', changeRank: 8, searchVolume: 52000 },
        { rank: 5, keyword: '주식 전망 2025', change: 'down', changeRank: 2, searchVolume: 48000 },
        { rank: 6, keyword: '넷플릭스 신작', change: 'new', searchVolume: 45000 },
        { rank: 7, keyword: '맛집 추천', change: 'same', searchVolume: 42000 },
        { rank: 8, keyword: '부동산 전망', change: 'down', changeRank: 3, searchVolume: 38000 },
        { rank: 9, keyword: '자기계발 책 추천', change: 'new', searchVolume: 35000 },
        { rank: 10, keyword: '건강 관리 팁', change: 'up', changeRank: 2, searchVolume: 32000 },
      ],
    },
    {
      id: 'rising',
      name: '급상승 키워드',
      icon: '📈',
      description: '최근 검색량이 급증한 키워드입니다.',
      keywords: [
        { rank: 1, keyword: 'ChatGPT 5.0', change: 'up', changeRank: 120, searchVolume: 89000 },
        { rank: 2, keyword: '손흥민 경기', change: 'up', changeRank: 85, searchVolume: 76000 },
        { rank: 3, keyword: '애플 비전프로', change: 'up', changeRank: 72, searchVolume: 54000 },
        { rank: 4, keyword: '설날 세뱃돈', change: 'up', changeRank: 65, searchVolume: 48000 },
        { rank: 5, keyword: '비트코인 시세', change: 'up', changeRank: 58, searchVolume: 42000 },
        { rank: 6, keyword: '독감 예방법', change: 'up', changeRank: 45, searchVolume: 38000 },
        { rank: 7, keyword: '전기차 보조금', change: 'up', changeRank: 38, searchVolume: 35000 },
        { rank: 8, keyword: '공무원 시험일정', change: 'up', changeRank: 32, searchVolume: 32000 },
      ],
    },
    {
      id: 'blog',
      name: '블로그 인기 주제',
      icon: '📝',
      description: '블로거들이 많이 다루는 인기 주제입니다.',
      keywords: [
        { rank: 1, keyword: '일상 브이로그', change: 'same', category: '라이프스타일', searchVolume: 125000 },
        { rank: 2, keyword: '맛집 리뷰', change: 'up', changeRank: 1, category: '맛집', searchVolume: 98000 },
        { rank: 3, keyword: '육아 일기', change: 'same', category: '육아', searchVolume: 87000 },
        { rank: 4, keyword: '제주도 여행', change: 'up', changeRank: 2, category: '여행', searchVolume: 82000 },
        { rank: 5, keyword: '제품 솔직 리뷰', change: 'up', changeRank: 1, category: '리뷰', searchVolume: 75000 },
        { rank: 6, keyword: '홈카페 레시피', change: 'new', category: '요리', searchVolume: 68000 },
        { rank: 7, keyword: '인테리어 꿀팁', change: 'same', category: '인테리어', searchVolume: 62000 },
        { rank: 8, keyword: '재테크 노하우', change: 'up', changeRank: 3, category: '재테크', searchVolume: 58000 },
        { rank: 9, keyword: '운동 루틴', change: 'down', changeRank: 1, category: '건강', searchVolume: 52000 },
        { rank: 10, keyword: 'IT 기기 리뷰', change: 'up', changeRank: 2, category: 'IT', searchVolume: 48000 },
      ],
    },
    {
      id: 'shopping',
      name: '쇼핑 인기 검색어',
      icon: '🛒',
      description: '네이버 쇼핑에서 인기 있는 검색어입니다.',
      keywords: [
        { rank: 1, keyword: '패딩', change: 'same', category: '패션', searchVolume: 320000 },
        { rank: 2, keyword: '니트', change: 'up', changeRank: 2, category: '패션', searchVolume: 285000 },
        { rank: 3, keyword: '에어팟', change: 'same', category: '디지털', searchVolume: 245000 },
        { rank: 4, keyword: '가습기', change: 'up', changeRank: 5, category: '가전', searchVolume: 198000 },
        { rank: 5, keyword: '향수', change: 'up', changeRank: 3, category: '뷰티', searchVolume: 175000 },
        { rank: 6, keyword: '운동화', change: 'down', changeRank: 1, category: '패션', searchVolume: 168000 },
        { rank: 7, keyword: '영양제', change: 'up', changeRank: 4, category: '건강', searchVolume: 155000 },
        { rank: 8, keyword: '무선청소기', change: 'same', category: '가전', searchVolume: 142000 },
      ],
    },
    {
      id: 'seasonal',
      name: `시즌 트렌드 (${dateStr})`,
      icon: '🗓️',
      description: '현재 시즌에 맞는 트렌드 키워드입니다.',
      keywords: [
        { rank: 1, keyword: '설날 음식', change: 'up', changeRank: 15, category: '시즌', searchVolume: 95000 },
        { rank: 2, keyword: '세뱃돈 봉투', change: 'up', changeRank: 12, category: '시즌', searchVolume: 78000 },
        { rank: 3, keyword: '발렌타인데이 초콜릿', change: 'new', category: '시즌', searchVolume: 65000 },
        { rank: 4, keyword: '봄 신상', change: 'up', changeRank: 8, category: '패션', searchVolume: 58000 },
        { rank: 5, keyword: '졸업 선물', change: 'up', changeRank: 6, category: '시즌', searchVolume: 52000 },
        { rank: 6, keyword: '입학 준비물', change: 'new', category: '시즌', searchVolume: 45000 },
      ],
    },
  ];
}

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const searchAdCustomerId = process.env.NAVER_SEARCHAD_CUSTOMER_ID;
  const searchAdApiKey = process.env.NAVER_SEARCHAD_API_KEY;
  const searchAdSecretKey = process.env.NAVER_SEARCHAD_SECRET_KEY;

  let trendData = getSimulatedTrendData();
  let source = 'simulation';
  let message = '네이버 API 키가 설정되지 않아 시뮬레이션 데이터를 표시합니다. 실제 데이터를 보려면 .env 파일에 API 키를 설정하세요.';

  // 네이버 검색광고 API가 설정된 경우 실제 데이터 가져오기
  if (searchAdCustomerId && searchAdApiKey && searchAdSecretKey) {
    try {
      // 여러 시드 키워드로 인기 키워드 조회
      const seedKeywords = ['블로그', '여행', '맛집', '다이어트', '재테크'];
      const allKeywords: TrendKeyword[] = [];

      for (const seed of seedKeywords) {
        const keywords = await fetchRelatedKeywords(
          searchAdCustomerId,
          searchAdApiKey,
          searchAdSecretKey,
          seed
        );
        allKeywords.push(...keywords);
      }

      if (allKeywords.length > 0) {
        // 검색량 기준 정렬 후 중복 제거
        const uniqueKeywords = Array.from(
          new Map(allKeywords.map(k => [k.keyword, k])).values()
        )
          .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
          .slice(0, 10)
          .map((k, index) => ({ ...k, rank: index + 1 }));

        trendData[0].keywords = uniqueKeywords;
        source = 'naver_searchad';
        message = '';
      }
    } catch (error) {
      console.error('Error fetching Search AD data:', error);
    }
  }

  // 네이버 DataLab API가 설정된 경우 쇼핑 트렌드 가져오기
  if (clientId && clientSecret) {
    try {
      // 쇼핑 카테고리별 트렌드 조회
      const categories = [
        { name: '패션의류', param: [{ cid: '50000000', cname: '패션의류' }] },
        { name: '디지털/가전', param: [{ cid: '50000001', cname: '디지털/가전' }] },
        { name: '식품', param: [{ cid: '50000003', cname: '식품' }] },
        { name: '출산/유아동', param: [{ cid: '50000005', cname: '출산/유아동' }] },
        { name: '스포츠/레저', param: [{ cid: '50000007', cname: '스포츠/레저' }] },
        { name: '화장품/미용', param: [{ cid: '50000002', cname: '화장품/미용' }] },
      ];

      const categoryTrends = await fetchCategoryTrend(clientId, clientSecret, categories);

      if (categoryTrends.length > 0) {
        trendData[3].keywords = categoryTrends;
        if (source === 'simulation') {
          source = 'naver_datalab';
        } else {
          source = 'naver_mixed';
        }
        message = '';
      }
    } catch (error) {
      console.error('Error fetching DataLab data:', error);
    }
  }

  return NextResponse.json({
    success: true,
    source,
    message: message || undefined,
    data: trendData,
    lastUpdated: new Date().toISOString(),
  });
}
