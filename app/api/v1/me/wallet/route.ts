/**
 * GET /api/v1/me/wallet
 * Returns wallet balance and recent transactions.
 * Balance is derived from the ledger — never trusted from a mutable field alone.
 */
import { NextRequest } from 'next/server';
import { WalletService } from '@/lib/services/wallet.service';
import { successResponse, Errors } from '@/lib/utils/response';
import { requireAuth, AuthError } from '@/lib/utils/auth-server';

export const dynamic = "force-dynamic";

const walletService = new WalletService();

export async function GET(req: NextRequest) {
  let user;
  try { user = await requireAuth(req); } catch (e) {
    if (e instanceof AuthError) return Errors.unauthorized(e.message);
    return Errors.internal();
  }

  const [balance, transactions] = await Promise.all([
    walletService.getBalance(user.sub),
    walletService.getTransactions(user.sub, 20),
  ]);

  return successResponse({
    wallet_id: balance.wallet_id,
    coins: balance.coins,
    rupees: balance.rupees,
    is_frozen: balance.is_frozen,
    coin_to_rupee_rate: 0.01,
    // Always clearly labeled as estimates vs confirmed
    recent_transactions: transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      coins: tx.coins,
      balance_after: tx.balance_after,
      description: tx.description,
      reference_id: tx.reference_id,
      created_at: tx.created_at,
    })),
  });
}
