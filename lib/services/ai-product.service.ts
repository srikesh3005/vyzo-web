/**
 * Vyzo — AI Product Service
 * Generates AI summaries, pros/cons, SEO, and buying advice for products.
 * AI output is schema-validated before saving — never blindly stored.
 *
 * SAFETY RULES (enforced via prompt engineering + schema validation):
 * - AI must NOT invent price, specs, warranty, policies, discounts, or commission rates.
 * - AI must only summarize verified product data supplied as input.
 * - For health/supplement products: no medical claims.
 * - If information is missing: "Information unavailable"
 */

import { z } from 'zod';

// ─── Output Schema ─────────────────────────────────────────────────────────────

export const AISummarySchema = z.object({
  summary: z.string().min(20).max(1000),
  pros: z.array(z.string().max(200)).min(1).max(10),
  cons: z.array(z.string().max(200)).min(1).max(10),
  best_for: z.array(z.string().max(200)).min(1).max(5),
  who_should_avoid: z.array(z.string().max(200)).max(5),
  buying_advice: z.string().max(500).optional(),
  faqs: z.array(
    z.object({
      question: z.string().max(200),
      answer: z.string().max(500),
    })
  ).max(5),
  recommendation_score: z.number().min(0).max(10),
  seo_title: z.string().max(70).optional(),
  seo_description: z.string().max(160).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  search_keywords: z.array(z.string().max(100)).max(20).optional(),
});

export type AISummary = z.infer<typeof AISummarySchema>;

export interface ProductInputForAI {
  title: string;
  brand?: string;
  description?: string;
  price_inr?: number;
  rating?: number;
  review_count?: number;
  category?: string;
  specifications?: Array<{ name: string; value: string }>;
}

const SYSTEM_PROMPT = `You are Vyzo AI, a product research assistant. Your job is to generate an honest, 
helpful product summary based ONLY on the verified product data provided to you.

CRITICAL RULES:
1. Do NOT invent, guess, or extrapolate: prices, specs, warranty terms, Amazon policies, 
   availability, discounts, or commission rates.
2. If any information is missing or unavailable, say "Information unavailable" — do not guess.
3. For health, skincare, supplement, and fitness products: do NOT make medical or health claims.
   Use phrases like "may support", "some users report" or simply describe the product.
4. Be honest — mention real drawbacks if evident from the data.
5. Keep summaries concise, factual, and useful for purchase decisions.
6. Return ONLY valid JSON matching the schema. No extra text.`;

function buildUserPrompt(product: ProductInputForAI): string {
  return `Analyze this product and return a JSON summary:

Product: ${product.title}
Brand: ${product.brand ?? 'Unknown'}
Category: ${product.category ?? 'Unknown'}
Price: ${product.price_inr ? `₹${product.price_inr.toLocaleString('en-IN')}` : 'Not provided'}
Rating: ${product.rating ?? 'Not provided'} / 5
Reviews: ${product.review_count ?? 'Not provided'}
Description: ${product.description ?? 'Not provided'}
Specifications:
${(product.specifications ?? []).map((s) => `- ${s.name}: ${s.value}`).join('\n') || 'None provided'}

Return JSON with: summary, pros (array), cons (array), best_for (array), who_should_avoid (array),
buying_advice, faqs (array of {question, answer}), recommendation_score (0-10),
seo_title, seo_description, tags (array), search_keywords (array).`;
}

export class AIProductService {
  private apiKey: string | null;
  private provider: 'gemini' | 'openai' | 'none';

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.apiKey = process.env.GEMINI_API_KEY;
      this.provider = 'gemini';
    } else if (process.env.OPENAI_API_KEY) {
      this.apiKey = process.env.OPENAI_API_KEY;
      this.provider = 'openai';
    } else {
      this.apiKey = null;
      this.provider = 'none';
    }
  }

  get isAvailable(): boolean {
    return this.provider !== 'none';
  }

  /**
   * Generate AI summary for a product.
   * Returns null if AI is not configured.
   * Validates output against schema — never saves arbitrary AI output.
   */
  async generateSummary(product: ProductInputForAI): Promise<AISummary | null> {
    if (!this.isAvailable) return null;

    const userPrompt = buildUserPrompt(product);

    try {
      let rawText: string;

      if (this.provider === 'gemini') {
        rawText = await this.callGemini(userPrompt);
      } else {
        rawText = await this.callOpenAI(userPrompt);
      }

      // Strip markdown code fences if present
      const cleaned = rawText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();

      const parsed = JSON.parse(cleaned);
      const validated = AISummarySchema.parse(parsed);
      return validated;
    } catch (err) {
      console.error('[AIProductService] Failed to generate/validate summary:', err);
      return null;
    }
  }

  private async callGemini(userPrompt: string): Promise<string> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2,    // low temp for factual output
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  private async callOpenAI(userPrompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? '';
  }
}
