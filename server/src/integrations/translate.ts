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

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    nameEn: { type: 'STRING', description: 'Dish or category name in English' },
    nameKy: { type: 'STRING', description: 'Dish or category name in Kyrgyz (Cyrillic)' },
    descriptionEn: { type: 'STRING', description: 'Description in English, empty if the Russian one is empty' },
    descriptionKy: { type: 'STRING', description: 'Description in Kyrgyz (Cyrillic), empty if the Russian one is empty' },
  },
  required: ['nameEn', 'nameKy', 'descriptionEn', 'descriptionKy'],
  propertyOrdering: ['nameEn', 'nameKy', 'descriptionEn', 'descriptionKy'],
};

/**
 * Модели по порядку. Если первая недоступна (нет в API или исчерпан бесплатный лимит),
 * пробуем следующую. GEMINI_MODEL в .env позволяет поставить свою модель первой.
 */
function modelChain(): string[] {
  const models = [process.env.GEMINI_MODEL?.trim(), 'gemini-3.8-flash', 'gemini-2.5-flash'];
  return [...new Set(models.filter((model): model is string => Boolean(model)))];
}

const REQUEST_TIMEOUT_MS = 30_000;

class ModelUnavailableError extends Error {}

async function callGemini(model: string, apiKey: string, nameRu: string, descriptionRu: string): Promise<Translation> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: 'user',
            parts: [{ text: `Название (RU): ${nameRu}\nОписание (RU): ${descriptionRu || '(пусто)'}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });
  } catch (error) {
    throw new Error(`Gemini (${model}) не ответил.`, { cause: error });
  }

  if (response.status === 400 || response.status === 401 || response.status === 403) {
    const body = await response.text();
    // Неверный или отключённый ключ — менять модель бессмысленно.
    if (/API_KEY|PERMISSION_DENIED|API key/i.test(body)) {
      console.error('gemini.auth', response.status, body.slice(0, 500));
      throw new TranslationUnavailableError('Неверный ключ GEMINI_API_KEY на сервере.');
    }
    throw new Error(`Gemini (${model}) вернул ошибку ${response.status}: ${body.slice(0, 300)}`);
  }
  if (response.status === 404) throw new ModelUnavailableError(`Модель ${model} недоступна.`);
  if (response.status === 429) throw new TranslationRateLimitError('Исчерпан лимит бесплатного перевода. Попробуйте через минуту.');
  if (!response.ok) {
    throw new Error(`Gemini (${model}) вернул ошибку ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Gemini (${model}) вернул не JSON (finishReason: ${payload.candidates?.[0]?.finishReason ?? 'нет'}).`);
  }
  const parsed = TranslationSchema.safeParse(json);
  if (!parsed.success) throw new Error(`Gemini (${model}) вернул неполный перевод.`);
  return parsed.data;
}

export async function translateMenuText(nameRu: string, descriptionRu: string): Promise<Translation> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new TranslationUnavailableError('Автоперевод не настроен: на сервере не задан GEMINI_API_KEY.');
  }

  let lastError: unknown;
  for (const model of modelChain()) {
    try {
      const result = await callGemini(model, apiKey, nameRu, descriptionRu);
      if (!descriptionRu.trim()) {
        result.descriptionEn = '';
        result.descriptionKy = '';
      }
      return result;
    } catch (error) {
      if (error instanceof TranslationUnavailableError) throw error;
      console.warn('gemini.model', model, error instanceof Error ? error.message : error);
      lastError = error;
    }
  }
  if (lastError instanceof TranslationRateLimitError) throw lastError;
  throw new Error('Не удалось перевести автоматически.', { cause: lastError });
}
