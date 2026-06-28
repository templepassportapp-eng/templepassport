CREATE TABLE IF NOT EXISTS users (
    id      UUID PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    email   VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS temples (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    deity               VARCHAR(255),
    city                VARCHAR(255),
    district            VARCHAR(255),
    state               VARCHAR(255),
    category            VARCHAR(100),
    latitude            DOUBLE PRECISION NOT NULL,
    longitude           DOUBLE PRECISION NOT NULL,
    verification_radius INTEGER DEFAULT 750
);

CREATE TABLE IF NOT EXISTS checkins (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id),
    temple_id         UUID NOT NULL REFERENCES temples(id),
    visit_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    verification_type VARCHAR(20) NOT NULL CHECK (verification_type IN ('VERIFIED', 'SELF_REPORTED')),
    latitude          DOUBLE PRECISION,
    longitude         DOUBLE PRECISION,
    notes             TEXT,
    photo_url         VARCHAR(500)
);
