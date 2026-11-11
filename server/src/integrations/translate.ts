import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import * as z from 'zod/v4';

/** Результат перевода: английский и кыргызский варианты названия и описания. */
const TranslationSchema = z.object({
  nameEn: z.string(),
  nameKy: z.string(),
  descriptionEn: z.string(),
  descriptionKy: z.string(),
});

export type Translation = z.infer<typeof TranslationSchema>;

export class TranslationUnavailableError extends Error {}

const SYSTEM_PROMPT = `You translate the menu of GAIJIN SUSHI, a sushi bar in Kyrgyzstan, from Russian into English and Kyrgyz.
Guests read these names and descriptions on their phones while ordering, so keep them short, natural and appetising, in the same tone as the Russian text.

Rules:
- Kyrgyz must be written in Kyrgyz Cyrillic (with ң, ө, ү), as a native speaker in Bishkek would write a menu.
- Proper names of rolls, sets and pizzas (Филадельфия, Калифорния, Аяши, Том-ям, Маргарита) are kept as names: transliterate them in English (Philadelphia, California) and keep them in Cyrillic in Kyrgyz. Brand names (Coca-Cola, Fanta, Piko) stay as they are.
- Translate the descriptive parts: ingredients, cooking style, size, volume ("1 л" → "1 L" in English, "1 л" in Kyrgyz).
- Keep "XL", numbers and prices unchanged.
- If the Russian description is empty, return empty strings for both descriptions.

Examples from the current menu:
- "Запечённый сет" → English "Baked Set", Kyrgyz "Бышырылган сет"
- "Темпура с лососем" → English "Salmon Tempura", Kyrgyz "Лосось менен темпура"
- "Сырные палочки" → English "Cheese Sticks", Kyrgyz "Сыр таякчалары"
- "Классический ролл с лососем, сливочным сыром и огурцом." → English "Classic roll with salmon, cream cheese and cucumber.", Kyrgyz "Лосось, каймак сыры жана бадыраң кошулган классикалык ролл."`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new TranslationUnavailableError('Автоперевод не настроен: на сервере не задан ANTHROPIC_API_KEY.');
  }
  client ??= new Anthropic();
  return client;
}

export async function translateMenuText(nameRu: string, descriptionRu: string): Promise<Translation> {
  const response = await getClient().beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {
      effort: 'low',
      format: betaZodOutputFormat(TranslationSchema),
    },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Название (RU): ${nameRu}\nОписание (RU): ${descriptionRu || '(пусто)'}`,
      },
    ],
  });

  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    throw new Error('Модель не вернула перевод.');
  }
  const result = response.parsed_output;
  if (!descriptionRu.trim()) {
    result.descriptionEn = '';
    result.descriptionKy = '';
  }
  return result;
}
