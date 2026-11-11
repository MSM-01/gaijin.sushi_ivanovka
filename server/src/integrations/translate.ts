import { z } from 'zod';

/**
 * Автоперевод меню с русского на английский и кыргызский через Gemini API
 * (бесплатный ключ: https://aistudio.google.com/apikey).
 * Используется REST API напрямую, без SDK, чтобы сервер работал на любой версии Node 18+.
 */

const TranslationSchema = z.object({
  nameEn: z.string().trim().min(1),
  nameKy: z.string().trim().min(1),
  descriptionEn: z.string(),
  descriptionKy: z.string(),
});

export type Translation = z.infer<typeof TranslationSchema>;

/** Перевод невозможен из-за настроек сервера (нет ключа, неверный ключ). */
export class TranslationUnavailableError extends Error {}

/** Сервис перевода временно перегружен (лимит бесплатного тарифа). */
export class TranslationRateLimitError extends Error {}

const SYSTEM_PROMPT = `You translate the menu of GAIJIN SUSHI, a sushi bar in Kyrgyzstan, from Russian into English and Kyrgyz.
Guests read these names and descriptions on their phones while ordering, so keep them short, natural and appetising, in the same tone as the Russian text.

Rules:
- Kyrgyz must be written in Kyrgyz Cyrillic (with ң, ө, ү), as a native speaker in Bishkek would write a menu.
- Proper names of rolls, sets and pizzas (Филадельфия, Калифорния, Аяши, Том-ям, Маргарита) are kept as names: transliterate them in English (Philadelphia, California) and keep them in Cyrillic in Kyrgyz. Brand names (Coca-Cola, Fanta, Piko) stay as they are.
- Translate the descriptive parts: ingredients, cooking style, size, volume ("1 л" -> "1 L" in English, "1 л" in Kyrgyz).
- Keep "XL", numbers and prices unchanged.
- If the Russian description is empty, return empty strings for both descriptions.

Examples from the current menu:
- "Запечённый сет" -> English "Baked Set", Kyrgyz "Бышырылган сет"
- "Темпура с лососем" -> English "Salmon Tempura", Kyrgyz "Лосось менен темпура"
- "Сырные палочки" -> English "Cheese Sticks", Kyrgyz "Сыр таякчалары"
- "Классический ролл с лососем, сливочным сыром и огурцом." -> English "Classic roll with salmon, cream cheese and cucumber.", Kyrgyz "Лосось, каймак сыры жана бадыраң кошулган классикалык ролл."`;

/** JSON Schema ответа (формат из актуальной документации Gemini: типы строчными буквами). */
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    nameEn: { type: 'string', description: 'Dish or category name in English' },
    nameKy: { type: 'string', description: 'Dish or category name in Kyrgyz (Cyrillic)' },
    descriptionEn: { type: 'string', description: 'Description in English, empty if the Russian one is empty' },
    descriptionKy: { type: 'string', description: 'Description in Kyrgyz (Cyrillic), empty if the Russian one is empty' },
  },
  required: ['nameEn', 'nameKy', 'descriptionEn', 'descriptionKy'],
};

const JSON_INSTRUCTION = `Reply with a single JSON object only, no markdown, with exactly these string fields: "nameEn", "nameKy", "descriptionEn", "descriptionKy".`;

/**
 * Модели по порядку. Если модель недоступна или исчерпан её бесплатный лимит, пробуем следующую.
 * GEMINI_MODEL в .env позволяет поставить свою модель первой.
 */
function modelChain(): string[] {
  const models = [process.env.GEMINI_MODEL?.trim(), 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];
  return [...new Set(models.filter((model): model is string => Boolean(model)))];
}

/**
 * Варианты настроек ответа, от основного к запасному. Google меняет формат API, поэтому при ошибке 400
 * пробуем следующий вариант: сначала REST-формат из документации, затем формат SDK, затем просто JSON.
 */
const GENERATION_CONFIGS: Record<string, unknown>[] = [
  { responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: RESPONSE_SCHEMA } }, thinkingConfig: { thinkingLevel: 'low' } },
  { responseMimeType: 'application/json', responseJsonSchema: RESPONSE_SCHEMA },
  { responseMimeType: 'application/json' },
];

const REQUEST_TIMEOUT_MS = 60_000;

/** Ошибка, после которой стоит попробовать следующую модель. */
class ModelUnavailableError extends Error {}
/** Ошибка формата запроса (400), после которой стоит попробовать другие настройки. */
class BadRequestError extends Error {}

function googleErrorMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string; status?: string } };
    if (parsed.error?.message) return `${parsed.error.status ?? ''} ${parsed.error.message}`.trim().slice(0, 300);
  } catch {
    /* не JSON */
  }
  return body.slice(0, 300);
}

function parseJsonText(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  return JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned);
}

async function callGemini(
  model: string,
  apiKey: string,
  generationConfig: Record<string, unknown>,
  nameRu: string,
  descriptionRu: string,
): Promise<Translation> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\n${JSON_INSTRUCTION}` }] },
        contents: [
          {
            role: 'user',
            parts: [{ text: `Название (RU): ${nameRu}\nОписание (RU): ${descriptionRu || '(пусто)'}` }],
          },
        ],
        generationConfig,
      }),
    });
  } catch (error) {
    throw new ModelUnavailableError(`${model}: нет ответа от Gemini (${error instanceof Error ? error.message : error}).`);
  }

  if (!response.ok) {
    const detail = googleErrorMessage(await response.text());
    if (response.status === 401 || response.status === 403 || /API_KEY|API key/i.test(detail)) {
      throw new TranslationUnavailableError(`Gemini не принял ключ GEMINI_API_KEY: ${detail}`);
    }
    if (response.status === 429) throw new TranslationRateLimitError(`Исчерпан бесплатный лимит Gemini. Попробуйте через минуту. (${detail})`);
    if (response.status === 400) throw new BadRequestError(`${model}: ${detail}`);
    throw new ModelUnavailableError(`${model}: ошибка ${response.status}: ${detail}`);
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
    promptFeedback?: { blockReason?: string };
  };
  const candidate = payload.candidates?.[0];
  const text = candidate?.content?.parts?.filter((part) => !part.thought).map((part) => part.text ?? '').join('') ?? '';
  if (!text) {
    throw new ModelUnavailableError(
      `${model}: пустой ответ (finishReason: ${candidate?.finishReason ?? payload.promptFeedback?.blockReason ?? 'нет'}).`,
    );
  }
  let json: unknown;
  try {
    json = parseJsonText(text);
  } catch {
    throw new BadRequestError(`${model}: ответ не в формате JSON.`);
  }
  const parsed = TranslationSchema.safeParse(json);
  if (!parsed.success) throw new BadRequestError(`${model}: в ответе не хватает полей перевода.`);
  return parsed.data;
}

export async function translateMenuText(nameRu: string, descriptionRu: string): Promise<Translation> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new TranslationUnavailableError('Автоперевод не настроен: на сервере не задан GEMINI_API_KEY.');
  }

  const errors: string[] = [];
  let rateLimited: TranslationRateLimitError | null = null;
  for (const model of modelChain()) {
    for (const generationConfig of GENERATION_CONFIGS) {
      try {
        const result = await callGemini(model, apiKey, generationConfig, nameRu, descriptionRu);
        if (!descriptionRu.trim()) {
          result.descriptionEn = '';
          result.descriptionKy = '';
        }
        return result;
      } catch (error) {
        if (error instanceof TranslationUnavailableError) throw error;
        const message = error instanceof Error ? error.message : String(error);
        console.warn('gemini.translate', message);
        errors.push(message);
        if (error instanceof TranslationRateLimitError) rateLimited = error;
        // Неверный формат запроса — пробуем другие настройки этой же модели, иначе — следующую модель.
        if (!(error instanceof BadRequestError)) break;
      }
    }
  }
  if (rateLimited) throw rateLimited;
  throw new Error(`Не удалось перевести автоматически. ${errors.at(-1) ?? ''}`.trim());
}
