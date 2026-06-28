-- Admin users (separate from app users — internal staff only)
CREATE TABLE admin_users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- bcrypt
    name          VARCHAR(128),
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- Seed a default admin (password: admin123 — CHANGE IN PRODUCTION)
-- bcrypt of 'admin123' with cost 10
INSERT INTO admin_users (username, password_hash, name)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Super Admin');

-- Feature flags — controls what is enabled in the app
CREATE TABLE feature_flags (
    key         VARCHAR(64) PRIMARY KEY,
    label       VARCHAR(128) NOT NULL,
    description TEXT,
    enabled     BOOLEAN DEFAULT true NOT NULL,
    category    VARCHAR(32) DEFAULT 'CORE',
    updated_at  TIMESTAMPTZ DEFAULT now(),
    updated_by  VARCHAR(64)
);

INSERT INTO feature_flags (key, label, description, enabled, category) VALUES
    ('CHECKINS_ENABLED',           'Temple Check-ins',    'Allow users to check in at temples and earn stamps',                        true,  'CORE'),
    ('POSTS_ENABLED',              'Social Posts',        'Allow users to create posts and share their pilgrimage',                    true,  'SOCIAL'),
    ('FEED_ENABLED',               'Social Feed',         'Show the social feed on home and sangha screens',                          true,  'SOCIAL'),
    ('YATRA_GROUPS_ENABLED',       'Yatra Groups',        'Allow users to create and join yatra groups with expense splitting',        true,  'SOCIAL'),
    ('GROUP_CHAT_ENABLED',         'Group Chat',          'Real-time messaging within yatra groups',                                   true,  'SOCIAL'),
    ('USER_DISCOVERY_ENABLED',     'User Discovery',      'Search for and follow other pilgrims by name or phone number',             true,  'DISCOVERY'),
    ('AFFILIATE_MARKETING_ENABLED','Affiliate Offers',    'Show stay, journey, and yatra essentials booking options from affiliates',  false, 'COMMERCE'),
    ('STAY_BOOKING_ENABLED',       'Stay Booking',        'Show hotel and dharamshala booking options near temples',                   false, 'COMMERCE'),
    ('JOURNEY_BOOKING_ENABLED',    'Journey Booking',     'Show train, bus, and cab booking for pilgrimages',                          false, 'COMMERCE');

-- Affiliates — third-party partners for stay, journey, and yatra essentials
CREATE TABLE affiliates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(128) NOT NULL,
    type            VARCHAR(32) NOT NULL CHECK (type IN ('STAY', 'JOURNEY', 'YATRA_ESSENTIALS')),
    description     TEXT,
    website_url     VARCHAR(512),
    logo_url        VARCHAR(512),
    contact_email   VARCHAR(256),
    contact_phone   VARCHAR(32),
    commission_pct  NUMERIC(5, 2),
    enabled         BOOLEAN DEFAULT true NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX affiliates_type_idx ON affiliates (type);
CREATE INDEX affiliates_enabled_idx ON affiliates (enabled);
