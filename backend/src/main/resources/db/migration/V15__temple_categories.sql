-- Multi-category support for temples (stored as JSON array TEXT)
ALTER TABLE temples ADD COLUMN IF NOT EXISTS categories TEXT DEFAULT '[]';

-- Category definitions (predefined + admin-created custom)
CREATE TABLE IF NOT EXISTS temple_category_definitions (
    key        VARCHAR(64) PRIMARY KEY,
    label      VARCHAR(128) NOT NULL,
    color      VARCHAR(16)  DEFAULT '#6B1A2C',
    is_custom  BOOLEAN      DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ  DEFAULT now()
);

INSERT INTO temple_category_definitions (key, label, color, is_custom) VALUES
    ('JYOTIRLINGA',  'Jyotirlinga',  '#C5341C', false),
    ('CHAR_DHAM',    'Char Dham',    '#6B1A2C', false),
    ('PANCH_BHOOTA', 'Panch Bhoota', '#1F5E4A', false),
    ('SHAKTI',       'Shakti Peeth', '#B87A00', false),
    ('SHIVA',        'Shiva',        '#4A1220', false),
    ('VISHNU',       'Vishnu',       '#1F5E4A', false),
    ('GANESH',       'Ganesh',       '#E89B2C', false),
    ('LAKSHMI',      'Lakshmi',      '#C49A3A', false)
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS temple_category_definitions_custom_idx ON temple_category_definitions (is_custom);
