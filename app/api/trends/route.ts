import { NextResponse } from 'next/server';

// 네이버 DataLab API 응답 타입
interface NaverTrendResponse {
  startDate: string;
  endDate: string;
  timeUnit: string;
  results: {
    title: string;
    keywords: string[];
    data: { period: string; ratio: number }[];
  }[];
}

// 트렌드 데이터 타입
export interface TrendKeyword {
  rank: number;
  keyword: string;
  change: 'up' | 'down' | 'new' | 'same';
  changeRank?: number;
  searchVolume?: number;
  category?: string;
}

export interface TrendCategory {
  id: string;
  name: string;
  icon: string;
  keywords: TrendKeyword[];
}

// 시뮬레이션 데이터 (API 키가 없을 때 사용)
function getSimulatedTrendData(): TrendCategory[] {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;

  return [
    {
      id: 'realtime',
      name: `실시간 인기 검색어 (${dateStr})`,
      icon: '🔥',
      keywords: [
        { rank: 1, keyword: '설 연휴 여행지', change: 'up', changeRank: 3 },
        { rank: 2, keyword: '새해 인사말', change: 'new' },
        { rank: 3, keyword: '다이어트 식단', change: 'same' },
        { rank: 4, keyword: 'AI 챗봇', change: 'up', changeRank: 5 },
        { rank: 5, keyword: '주식 전망', change: 'down', changeRank: 2 },
        { rank: 6, keyword: '넷플릭스 추천', change: 'up', changeRank: 1 },
        { rank: 7, keyword: '맛집 추천', change: 'same' },
        { rank: 8, keyword: '부동산 전망', change: 'down', changeRank: 3 },
        { rank: 9, keyword: '자기계발 책', change: 'new' },
        { rank: 10, keyword: '건강 관리', change: 'up', changeRank: 2 },
      ],
    },
    {
      id: 'rising',
      name: '급상승 키워드',
      icon: '📈',
      keywords: [
        { rank: 1, keyword: 'ChatGPT 활용법', change: 'up', changeRank: 15, searchVolume: 45000 },
        { rank: 2, keyword: '홈트레이닝', change: 'up', changeRank: 12, searchVolume: 38000 },
        { rank: 3, keyword: '비건 레시피', change: 'up', changeRank: 10, searchVolume: 32000 },
        { rank: 4, keyword: '재택근무 팁', change: 'up', changeRank: 8, searchVolume: 28000 },
        { rank: 5, keyword: '친환경 제품', change: 'up', changeRank: 7, searchVolume: 25000 },
      ],
    },
    {
      id: 'blog',
      name: '블로그 인기 주제',
      icon: '📝',
      keywords: [
        { rank: 1, keyword: '일상 브이로그', change: 'same', category: '라이프스타일' },
        { rank: 2, keyword: '맛집 리뷰', change: 'up', changeRank: 1, category: '맛집' },
        { rank: 3, keyword: '육아 일기', change: 'same', category: '육아' },
        { rank: 4, keyword: '여행 후기', change: 'down', changeRank: 1, category: '여행' },
        { rank: 5, keyword: '제품 리뷰', change: 'up', changeRank: 2, category: '리뷰' },
        { rank: 6, keyword: '인테리어 팁', change: 'new', category: '인테리어' },
        { rank: 7, keyword: '자기계발', change: 'same', category: '자기계발' },
        { rank: 8, keyword: '재테크 정보', change: 'up', changeRank: 3, category: '재테크' },
        { rank: 9, keyword: '운동 루틴', change: 'down', changeRank: 2, category: '건강' },
        { rank: 10, keyword: '요리 레시피', change: 'same', category: '요리' },
      ],
    },
    {
      id: 'age',
      name: '연령대별 인기 검색어',
      icon: '👥',
      keywords: [
        { rank: 1, keyword: '취업 준비 (20대)', change: 'same', category: '20대' },
        { rank: 2, keyword: '자격증 공부 (20대)', change: 'up', changeRank: 2, category: '20대' },
        { rank: 3, keyword: '육아 용품 (30대)', change: 'same', category: '30대' },
        { rank: 4, keyword: '내집 마련 (30대)', change: 'up', changeRank: 1, category: '30대' },
        { rank: 5, keyword: '건강검진 (40대)', change: 'same', category: '40대' },
        { rank: 6, keyword: '노후 준비 (50대)', change: 'up', changeRank: 3, category: '50대' },
      ],
    },
    {
      id: 'category',
      name: '카테고리별 트렌드',
      icon: '📊',
      keywords: [
        { rank: 1, keyword: '스마트폰 추천', change: 'up', changeRank: 2, category: 'IT/테크' },
        { rank: 2, keyword: '제주도 여행', change: 'same', category: '여행' },
        { rank: 3, keyword: '서울 맛집', change: 'up', changeRank: 1, category: '맛집' },
        { rank: 4, keyword: '피부 관리', change: 'down', changeRank: 1, category: '뷰티' },
        { rank: 5, keyword: '주식 투자', change: 'up', changeRank: 4, category: '재테크' },
        { rank: 6, keyword: '영어 공부', change: 'same', category: '교육' },
        { rank: 7, keyword: '헬스장 추천', change: 'new', category: '건강' },
        { rank: 8, keyword: '카페 추천', change: 'down', changeRank: 2, category: '라이프' },
      ],
    },
  ];
}

// 네이버 DataLab API 호출 함수
async function fetchNaverTrends(
  clientId: string,
  clientSecret: string,
  keywords: string[]
): Promise<NaverTrendResponse | null> {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];

  const requestBody = {
    startDate,
    endDate,
    timeUnit: 'date',
    keywordGroups: keywords.map((keyword, index) => ({
      groupName: keyword,
      keywords: [keyword],
    })),
  };

  try {
    const response = await fetch('https://openapi.naver.com/v1/datalab/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('Naver API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Naver trends:', error);
    return null;
  }
}

// 네이버 쇼핑인사이트 API 호출 함수
async function fetchShoppingTrends(
  clientId: string,
  clientSecret: string,
  category: string
): Promise<unknown | null> {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/datalab/shopping/categories?startDate=${startDate}&endDate=${endDate}&timeUnit=date&category=${category}`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch shopping trends:', error);
    return null;
  }
}

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  // API 키가 있으면 실제 네이버 API 호출 시도
  if (clientId && clientSecret) {
    try {
      // 인기 키워드들로 트렌드 조회
      const popularKeywords = [
        'AI', '다이어트', '여행', '맛집', '주식',
        '부동산', '건강', '운동', '재테크', '자기계발'
      ];

      const naverData = await fetchNaverTrends(clientId, clientSecret, popularKeywords);

      if (naverData && naverData.results) {
        // 네이버 API 데이터를 우리 형식으로 변환
        const sortedResults = naverData.results
          .map((result, index) => {
            const latestData = result.data[result.data.length - 1];
            const previousData = result.data[result.data.length - 2];
            const change = latestData.ratio > previousData?.ratio ? 'up' :
                          latestData.ratio < previousData?.ratio ? 'down' : 'same';

            return {
              keyword: result.title,
              ratio: latestData.ratio,
              change,
              changeRank: Math.abs(Math.round((latestData.ratio - (previousData?.ratio || 0)) * 10)),
            };
          })
          .sort((a, b) => b.ratio - a.ratio);

        const realTimeKeywords: TrendKeyword[] = sortedResults.map((item, index) => ({
          rank: index + 1,
          keyword: item.keyword,
          change: item.change as 'up' | 'down' | 'same',
          changeRank: item.changeRank,
        }));

        // 시뮬레이션 데이터와 혼합하여 반환
        const simulatedData = getSimulatedTrendData();
        simulatedData[0].keywords = realTimeKeywords;

        return NextResponse.json({
          success: true,
          source: 'naver_api',
          data: simulatedData,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error processing Naver API data:', error);
    }
  }

  // API 키가 없거나 API 호출 실패시 시뮬레이션 데이터 반환
  return NextResponse.json({
    success: true,
    source: 'simulation',
    message: '네이버 API 키가 설정되지 않아 시뮬레이션 데이터를 표시합니다. .env 파일에 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 설정하세요.',
    data: getSimulatedTrendData(),
    lastUpdated: new Date().toISOString(),
  });
}

// POST: 특정 키워드의 트렌드 분석
export async function POST(request: Request) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  try {
    const body = await request.json();
    const { keywords } = body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: '키워드를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (clientId && clientSecret) {
      const naverData = await fetchNaverTrends(clientId, clientSecret, keywords.slice(0, 5));

      if (naverData) {
        return NextResponse.json({
          success: true,
          source: 'naver_api',
          data: naverData,
          lastUpdated: new Date().toISOString(),
        });
      }
    }

    // API 키가 없으면 시뮬레이션 응답
    return NextResponse.json({
      success: true,
      source: 'simulation',
      message: '네이버 API 키가 설정되지 않아 시뮬레이션 데이터를 표시합니다.',
      data: {
        keywords: keywords,
        trend: keywords.map((keyword: string, index: number) => ({
          keyword,
          popularity: Math.floor(Math.random() * 100),
          trend: Math.random() > 0.5 ? 'up' : 'down',
        })),
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
