import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1";

let resolvedGeminiModel: string | null = null;

async function resolveGeminiModel(apiKey: string): Promise<string> {
  if (resolvedGeminiModel) return resolvedGeminiModel;

  const preferredCandidates = [
    GEMINI_MODEL,
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
  ];

  async function existsAndSupportsGenerateContent(
    model: string,
  ): Promise<boolean> {
    const res = await fetch(
      `${GEMINI_API_BASE_URL}/models/${model}?key=${apiKey}`,
    );
    if (!res.ok) return false;
    const data = (await res.json()) as {
      supportedGenerationMethods?: string[];
    };
    console.log("api", data);
    // Be conservative: if API doesn't tell us supported methods, assume it's NOT supported.
    return Array.isArray(data.supportedGenerationMethods)
      ? data.supportedGenerationMethods.includes("generateContent")
      : false;
  }

  for (const model of preferredCandidates) {
    // Avoid double "models/" prefix if user provided full name
    const normalized = model.startsWith("models/")
      ? model.slice("models/".length)
      : model;
    if (await existsAndSupportsGenerateContent(normalized)) {
      resolvedGeminiModel = normalized;
      return normalized;
    }
  }

  const listRes = await fetch(`${GEMINI_API_BASE_URL}/models?key=${apiKey}`);
  if (!listRes.ok) {
    const errTxt = await listRes.text();
    throw new Error(`Gemini API error: ${errTxt}`);
  }
  const listData = (await listRes.json()) as {
    models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
  };

  const models = Array.isArray(listData.models) ? listData.models : [];
  const supported = models
    .filter(
      (m) =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes("generateContent"),
    )
    .map((m) => m.name)
    .filter((n): n is string => typeof n === "string");

  // Prefer flash-like model names, then any gemini model.
  const pick =
    supported.find((n) => /gemini-.*flash/i.test(n)) ||
    supported.find((n) => /gemini/i.test(n)) ||
    supported[0];

  if (!pick) {
    throw new Error(
      "Gemini API error: No available models support generateContent for this API key.",
    );
  }

  resolvedGeminiModel = pick.startsWith("models/")
    ? pick.slice("models/".length)
    : pick;
  return resolvedGeminiModel;
}

interface GeminiRequest {
  type: "topic" | "tags" | "seo";
  category?: string;
  keywords?: string;
  title?: string;
  content?: string;
}

async function callGemini(prompt: string, apiKey: string) {
  async function doRequestWithResolvedModel() {
    const model = await resolveGeminiModel(apiKey);
    const geminiApiUrl = `${GEMINI_API_BASE_URL}/models/${model}:generateContent`;
    const response = await fetch(`${geminiApiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        },
      }),
    });
    return response;
  }

  let response = await doRequestWithResolvedModel();

  if (!response.ok) {
    const error = await response.text();
    // If the model is not found / not supported for generateContent, clear cache and retry once.
    if (response.status === 404) {
      resolvedGeminiModel = null;
      response = await doRequestWithResolvedModel();
      if (!response.ok) {
        const error2 = await response.text();
        throw new Error(`Gemini API error: ${error2}`);
      }
    } else {
      throw new Error(`Gemini API error: ${error}`);
    }
  }

  const data = await response.json();
  try {
    const finishReason = data?.candidates?.[0]?.finishReason;
    const usage = data?.usageMetadata;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Gemini debug:", {
      model: resolvedGeminiModel,
      finishReason,
      usage,
      textLength: typeof text === "string" ? text.length : null,
    });
  } catch {
    // ignore debug failures
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function POST(request: NextRequest) {
  try {
    const body: GeminiRequest = await request.json();

    // Use environment variable for API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.",
        },
        { status: 500 },
      );
    }

    let prompt = "";
    let result: unknown;

    switch (body.type) {
      case "topic":
        prompt = `당신은 한국 블로그 전문가입니다. 아래 조건에 맞는 블로그 주제를 6개 추천해주세요.

${body.category ? `카테고리: ${body.category}` : "카테고리: 전체"}
${body.keywords ? `관심 키워드: ${body.keywords}` : ""}

각 주제에 대해 다음 JSON 형식으로 응답해주세요 (JSON만 출력, 다른 텍스트 없이):
[
  {
    "title": "블로그 제목",
    "description": "간단한 설명 (50자 이내)",
    "category": "카테고리명",
    "keywords": ["키워드1", "키워드2", "키워드3"],
    "outline": ["소제목1", "소제목2", "소제목3"]
  }
]

트렌디하고 검색량이 높을 것 같은 주제로 추천해주세요.`;
        break;

      case "tags":
        prompt = `당신은 한국 블로그 SEO 전문가입니다. 아래 블로그 글에 적합한 태그와 해시태그를 생성해주세요.

제목: ${body.title || ""}
내용: ${body.content || ""}

다음 JSON 형식으로 응답해주세요 (JSON만 출력, 다른 텍스트 없이):
{
  "tags": ["태그1", "태그2", "태그3", ...],
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", ...],
  "relatedKeywords": ["관련키워드1", "관련키워드2", ...]
}

조건:
- 태그는 10-15개 생성
- 해시태그는 인스타그램/네이버 블로그에서 인기있는 형태로
- 검색 노출에 도움되는 태그 위주로
- 한국어와 영어 적절히 섞어서`;
        break;

      case "seo":
        prompt = `당신은 한국 블로그 SEO 전문가입니다. 아래 제목을 SEO에 최적화된 다양한 형태로 변환해주세요.

원본 제목: ${body.title || ""}

다음 JSON 형식으로 응답해주세요 (JSON만 출력, 다른 텍스트 없이):
{
  "suggestions": [
    {
      "title": "SEO 최적화 제목",
      "type": "유형(가이드/리스트/후기/비교/질문/트렌드 중 하나)",
      "score": 예상 클릭률 점수(1-100),
      "reason": "추천 이유 간단 설명"
    }
  ],
  "metaDescription": "메타 설명 (150자 이내)",
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"]
}

조건:
- 5개의 제목 변형 생성
- 클릭률 높은 파워워드 포함 (완벽, 총정리, 꿀팁, BEST, TOP 등)
- 숫자 활용 (TOP 10, 5가지 등)
- 30-60자 사이 길이
- 2026년 트렌드 반영`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid request type" },
          { status: 400 },
        );
    }

    const response = await callGemini(prompt, apiKey);

    // Parse JSON from response
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response;
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      result = JSON.parse(jsonStr);
    } catch {
      // If parsing fails, return raw response
      result = { raw: response };
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
