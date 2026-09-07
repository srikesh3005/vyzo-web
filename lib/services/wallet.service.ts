/**
 * Vyzo — Wallet Service (Ledger-based)
 *
 * CRITICAL RULES:
 * - The balance is NEVER stored directly as a mutable value to be incremented.
 * - Every balance change creates a wallet_transaction (the ledger).
 * - The `cached_balance_coins` column is a performance cache — always derived
 *   from summing wallet_transactions.
 * - Never allow the frontend to modify balances directly.
 * - 1 Vyzo Coin = ₹0.01 (1 paise)
 */

import { db } from '@/lib/db/client';

export type TransactionType =
  | 'REWARD_PENDING'
  | 'REWARD_CONFIRMED'
  | 'REWARD_REVERSED'
  | 'REDEMPTION'
  | 'ADJUSTMENT'
  | 'REFUND';

export interface WalletBalance {
  wallet_id: string;
  user_id: string;
  coins: number;           // current balance
  rupees: number;          // coins × 0.01
  is_frozen: boolean;
}

export interface LedgerTransaction {
  id: string;
  type: TransactionType;
  coins: number;           // positive = credit, negative = debit
  balance_after: number;
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

export class WalletService {
  /** Get or create wallet for a user */
  async getOrCreateWallet(userId: string): Promise<{ id: string; cached_balance_coins: number; is_frozen: boolean }> {
    // Try to get existing wallet
    const { data: existing } = await db
      .from('wallets')
      .select('id, cached_balance_coins, is_frozen')
      .eq('user_id', userId)
      .single();

    if (existing) return existing;

    // Create new wallet
    const { data: created, error } = await db
      .from('wallets')
      .insert({ user_id: userId, cached_balance_coins: 0 })
      .select('id, cached_balance_coins, is_frozen')
      .single();

    if (error) throw error;
    return created!;
  }

  /** Get wallet balance */
  async getBalance(userId: string): Promise<WalletBalance> {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      wallet_id: wallet.id,
      user_id: userId,
      coins: wallet.cached_balance_coins,
      rupees: wallet.cached_balance_coins / 100,
      is_frozen: wallet.is_frozen,
    };
  }

  /**
   * Add a pending reward.
   * Called when user clicks affiliate link — reward is not confirmed yet.
   * Does NOT credit coins yet. Creates a ledger entry for tracking.
   */
  async addPendingReward(
    userId: string,
    estimatedCoins: number,
    referenceId: string,
    description: string
  ): Promise<LedgerTransaction> {
    // Pending rewards don't affect balance (coins = 0)
    return this.createTransaction(userId, {
      type: 'REWARD_PENDING',
      coins: 0,        // pending — no balance change
      description,
      reference_id: referenceId,
      reference_type: 'affiliate_click',
      metadata: { estimated_coins: estimatedCoins },
    });
  }

  /**
   * Confirm a pending reward.
   * Called when affiliate commission is confirmed.
   * CREDITS coins to the wallet.
   */
  async confirmReward(
    userId: string,
    confirmedCoins: number,
    referenceId: string,
    description: string
  ): Promise<LedgerTransaction> {
    return this.createTransaction(userId, {
      type: 'REWARD_CONFIRMED',
      coins: confirmedCoins,
      description,
      reference_id: referenceId,
      reference_type: 'affiliate_commission',
    });
  }

  /**
   * Reverse a confirmed reward.
   * Called when purchase is cancelled or commission is reversed.
   * DEBITS coins (creates negative transaction).
   */
  async reverseReward(
    userId: string,
    coinsToReverse: number,
    referenceId: string,
    description: string
  ): Promise<LedgerTransaction> {
    return this.createTransaction(userId, {
      type: 'REWARD_REVERSED',
      coins: -coinsToReverse,
      description,
      reference_id: referenceId,
      reference_type: 'affiliate_reversal',
    });
  }

  /**
   * Admin adjustment — credit or debit (admin use only).
   */
  async adminAdjustment(
    userId: string,
    coins: number,
    description: string,
    adminUserId: string
  ): Promise<LedgerTransaction> {
    return this.createTransaction(userId, {
      type: 'ADJUSTMENT',
      coins,
      description,
      reference_id: adminUserId,
      reference_type: 'admin_adjustment',
    });
  }

  /**
   * Derive the true balance by summing all confirmed transactions.
   * Use this for audits. For performance, use cached_balance_coins.
   */
  async deriveBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    const { data, error } = await db
      .from('wallet_transactions')
      .select('coins')
      .eq('wallet_id', wallet.id)
      .neq('type', 'REWARD_PENDING'); // pending has coins=0 but exclude for clarity

    if (error) throw error;
    return (data ?? []).reduce((sum, tx) => sum + (tx.coins as number), 0);
  }

  /** Get transaction history */
  async getTransactions(userId: string, limit = 50): Promise<LedgerTransaction[]> {
    const wallet = await this.getOrCreateWallet(userId);
    const { data, error } = await db
      .from('wallet_transactions')
      .select('id, type, coins, balance_after, description, reference_id, reference_type, created_at')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as LedgerTransaction[];
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private async createTransaction(
    userId: string,
    tx: {
      type: TransactionType;
      coins: number;
      description: string;
      reference_id?: string | null;
      reference_type?: string | null;
      metadata?: Record<string, unknown>;
    }
  ): Promise<LedgerTransaction> {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.is_frozen) {
      throw new Error('Wallet is frozen. Contact support.');
    }

    const newBalance = wallet.cached_balance_coins + tx.coins;
    if (newBalance < 0) {
      throw new Error('Insufficient balance for this transaction.');
    }

    // Insert transaction and update cached balance atomically via RPC
    const { data, error } = await db.rpc('create_wallet_transaction', {
      p_wallet_id: wallet.id,
      p_user_id: userId,
      p_type: tx.type,
      p_coins: tx.coins,
      p_balance_after: newBalance,
      p_description: tx.description,
      p_reference_id: tx.reference_id ?? null,
      p_reference_type: tx.reference_type ?? null,
      p_metadata: tx.metadata ?? null,
    });

    if (error) throw error;
    return data as LedgerTransaction;
  }
}
