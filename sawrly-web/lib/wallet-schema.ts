import { query } from '@/lib/db';

let walletSchemaReady = false;
let ensuringWalletSchema: Promise<void> | null = null;

/**
 * The wallet is derived from confirmed payments plus this immutable payout log.
 * Keeping payouts separate from `payments` prevents an outgoing transfer from
 * being mistaken for a customer payment and makes the balance auditable.
 */
async function ensureWalletSchemaInternal(): Promise<void> {
    await query(`
        CREATE TABLE IF NOT EXISTS wallet_payouts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
            method payment_method NOT NULL DEFAULT 'bank_transfer',
            status VARCHAR(20) NOT NULL DEFAULT 'completed'
                CHECK (status IN ('pending', 'completed', 'rejected')),
            reference TEXT,
            note TEXT,
            created_by UUID NOT NULL REFERENCES users(id),
            processed_by UUID REFERENCES users(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            processed_at TIMESTAMPTZ
        )
    `);
    await query(`
        CREATE INDEX IF NOT EXISTS idx_wallet_payouts_creator_status
        ON wallet_payouts(creator_id, status, created_at DESC)
    `);
    await query(`
        CREATE INDEX IF NOT EXISTS idx_wallet_payouts_reference
        ON wallet_payouts(reference)
    `);
}

export async function ensureWalletSchema(): Promise<void> {
    if (walletSchemaReady) return;

    if (!ensuringWalletSchema) {
        ensuringWalletSchema = ensureWalletSchemaInternal()
            .then(() => {
                walletSchemaReady = true;
            })
            .finally(() => {
                ensuringWalletSchema = null;
            });
    }

    await ensuringWalletSchema;
}
