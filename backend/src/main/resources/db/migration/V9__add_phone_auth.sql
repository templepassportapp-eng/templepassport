ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(15) UNIQUE;

CREATE TABLE IF NOT EXISTS otp_sessions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    phone      VARCHAR(15) NOT NULL,
    code       VARCHAR(6)  NOT NULL,
    expires_at TIMESTAMP   NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_sessions(phone);
