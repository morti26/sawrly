-- Creator wallet payout ledger. Customer earnings remain derived from confirmed payments.
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
);

CREATE INDEX IF NOT EXISTS idx_wallet_payouts_creator_status
    ON wallet_payouts(creator_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_payouts_reference
    ON wallet_payouts(reference);
