/**
 * Vyzo — Commission Service
 * Calculates commission estimates using the configured commission rules.
 * Uses Decimal.js for exact decimal arithmetic — never binary floating-point.
 *
 * IMPORTANT: All values are in PAISE (integer, 1 INR = 100 paise).
 * This prevents all rounding issues with float arithmetic.
 */

import Decimal from 'decimal.js';
import { db } from '@/lib/firebase/admin';

// Configure Decimal.js for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface CommissionResult {
  commission_rule_id: string | null;
  commission_rule_name: string;
  commission_rate: number;              // e.g., 0.05 for 5%
  estimated_commission_paise: number;   // in paise
  estimated_reward_paise: number;       // 50% of commission, in paise
  is_catch_all: boolean;
}

export interface CommissionRule {
  id: string;
  name: string;
  category_id: string | null;
  rate: number;
  maximum_reward: number | null;
  priority: number;
}

/**
 * CommissionService — looks up the applicable commission rule for a product
 * and calculates estimated commission and reward.
 *
 * Rules are fetched from the database (configurable by admin).
 * Never hardcoded in application logic.
 */
export class CommissionService {
  /**
   * Find the best-matching commission rule for a category.
   * Checks category + all its ancestors, then falls back to catch-all.
   * Higher priority rules win.
   */
  async findRule(categoryId: string | null): Promise<CommissionRule | null> {
    if (!categoryId) {
      return this.getCatchAllRule();
    }

    // Build the category chain (category + all parents) for rule lookup
    const categoryChain = await this.getCategoryChain(categoryId);
    const categoryIds = categoryChain.map((c) => c.id);

    if (categoryIds.length > 0) {
      // Find best-matching active rule for any category in the chain
      const snapshot = await db
        .collection('commission_rules')
        .where('is_active', '==', true)
        .where('category_id', 'in', categoryIds)
        .orderBy('priority', 'desc')
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as CommissionRule;
      }
    }

    return this.getCatchAllRule();
  }

  private async getCatchAllRule(): Promise<CommissionRule | null> {
    const snapshot = await db
      .collection('commission_rules')
      .where('is_active', '==', true)
      .where('category_id', '==', null)
      .orderBy('priority', 'desc')
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CommissionRule;
    }
    return null;
  }

  private async getCategoryChain(categoryId: string): Promise<{ id: string }[]> {
    const chain: { id: string }[] = [];
    let currentId: string | null = categoryId;

    // Walk up the category tree (max 5 levels to prevent infinite loops)
    for (let depth = 0; depth < 5 && currentId; depth++) {
      const docSnap = await db.collection('categories').doc(currentId).get();

      if (!docSnap.exists) break;
      
      const data = docSnap.data();
      chain.push({ id: docSnap.id });
      currentId = data?.parent_id ?? null;
    }

    return chain;
  }

  /**
   * Calculate commission and reward for a product price.
   * All arithmetic is done with Decimal.js to avoid floating-point errors.
   *
   * @param pricePaise Product price in paise (e.g. ₹999 = 99900)
   * @param categoryId Category ID for rule lookup
   */
  async calculate(
    pricePaise: number,
    categoryId: string | null
  ): Promise<CommissionResult> {
    const rule = await this.findRule(categoryId);

    if (!rule) {
      return {
        commission_rule_id: null,
        commission_rule_name: 'No Rule Found',
        commission_rate: 0,
        estimated_commission_paise: 0,
        estimated_reward_paise: 0,
        is_catch_all: true,
      };
    }

    const price = new Decimal(pricePaise);
    const rate = new Decimal(rule.rate);

    // commission = price × rate
    let commissionPaise = price.times(rate).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();

    // Apply maximum_reward cap if set (e.g., Bill Payment: max ₹3 = 300 paise)
    if (rule.maximum_reward !== null && rule.maximum_reward !== undefined) {
      const maxPaise = new Decimal(rule.maximum_reward).times(100).toNumber();
      commissionPaise = Math.min(commissionPaise, maxPaise);
    }

    // reward = commission × 50% (user gets half of affiliate commission)
    const rewardPaise = new Decimal(commissionPaise)
      .times(0.5)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber();

    return {
      commission_rule_id: rule.id,
      commission_rule_name: rule.name,
      commission_rate: rule.rate,
      estimated_commission_paise: commissionPaise,
      estimated_reward_paise: rewardPaise,
      is_catch_all: rule.category_id === null,
    };
  }
}
