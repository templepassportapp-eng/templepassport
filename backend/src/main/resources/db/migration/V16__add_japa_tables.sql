-- Naam Jap integration: japa data linked to existing temple_passport users

CREATE TABLE IF NOT EXISTS japa_mantra_stats (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mantra_id      VARCHAR(64)  NOT NULL,
    mantra_name    VARCHAR(255),
    mantra_latin   VARCHAR(255),
    total_japa     BIGINT       NOT NULL DEFAULT 0,
    total_malas    BIGINT       NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (user_id, mantra_id)
);

CREATE TABLE IF NOT EXISTS japa_daily_history (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    japa_date   DATE    NOT NULL,
    total_japa  BIGINT  NOT NULL DEFAULT 0,
    total_malas BIGINT  NOT NULL DEFAULT 0,
    synced_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, japa_date)
);

CREATE INDEX IF NOT EXISTS idx_japa_mantra_stats_user   ON japa_mantra_stats (user_id);
CREATE INDEX IF NOT EXISTS idx_japa_daily_history_user  ON japa_daily_history (user_id, japa_date DESC);
