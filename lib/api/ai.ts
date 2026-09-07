/**
 * AI API
 * AI-powered features: summaries, chat (streaming), picks, comparisons
 */

import { api } from './client';
import type { ApiProduct } from './products';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AISummaryResponse {
  product_id: string;
  summary: string;
  pros: string[];
  cons: string[];
  best_for: string[];
  who_should_avoid: string[];
  buying_guide: string;
  faqs: { question: string; answer: string }[];
  recommendation_score: number;
  model_version: string;
  generated_at: string;
  is_cached: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  product_refs?: ApiProduct[]; // products mentioned in the response
}

export interface AIChatRequest {
  messages: ChatMessage[];
  context?: {
    current_product_id?: string;
    wishlist_ids?: string[];
    recently_viewed_ids?: string[];
  };
}

export interface AIPicksResponse {
  picks: {
    product: ApiProduct;
    score: number;
    reason: string;
    category: string;
  }[];
  personalized: boolean;
  generated_at: string;
}

export interface AIComparisonResponse {
  product_ids: string[];
  comparison_text: string;
  winner?: {
    product_id: string;
    reason: string;
  };
  summary_table: Record<string, string[]>; // attribute → [val1, val2, ...]
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Get AI summary for a product (cached for 7 days) */
export async function getAISummary(
  productId: string
): Promise<AISummaryResponse> {
  return api.get<AISummaryResponse>(`/ai/summary/${productId}`);
}

/** Trigger generation of a new AI summary (admin or scheduled) */
export async function generateAISummary(
  productId: string
): Promise<{ job_id: string; status: 'queued' | 'processing' }> {
  return api.post(`/ai/summary/${productId}/generate`);
}

/**
 * AI Chat — returns a streaming response.
 * Uses Server-Sent Events (SSE) for real-time token streaming.
 * @param request Chat messages + context
 * @param onChunk Callback for each streamed token
 * @param onComplete Callback when stream finishes
 * @param onError Callback on error
 */
export async function streamAIChat(
  request: AIChatRequest,
  onChunk: (token: string) => void,
  onComplete: (fullMessage: string, products: ApiProduct[]) => void,
  onError: (error: Error) => void
): Promise<() => void> {
  const controller = new AbortController();

  const baseUrl =
    process.env.API_URL || 'https://api.vyzo.in/api/v1';

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('vyzo_access_token')
      : null;

  fetch(`${baseUrl}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      const products: ApiProduct[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete(fullText, products);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE events: "data: {token}\n\n"
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'token') {
                fullText += parsed.content;
                onChunk(parsed.content);
              } else if (parsed.type === 'products') {
                products.push(...parsed.products);
              }
            } catch {
              // Raw token (non-JSON streaming)
              fullText += data;
              onChunk(data);
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError(err);
    });

  // Return abort function
  return () => controller.abort();
}

/** Get AI-curated picks (personalized if authenticated) */
export async function getAIPicks(params?: {
  budget?: 'student' | 'budget' | 'mid' | 'premium';
  category?: string;
  limit?: number;
}): Promise<AIPicksResponse> {
  return api.get<AIPicksResponse>('/ai/picks', params);
}

/** Get AI comparison text for multiple products */
export async function getAIComparison(
  productIds: string[]
): Promise<AIComparisonResponse> {
  return api.post<AIComparisonResponse>('/ai/compare', {
    product_ids: productIds,
  });
}
