ALTER TABLE temples
    ADD COLUMN IF NOT EXISTS image_url     TEXT,
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
    ADD COLUMN IF NOT EXISTS description   TEXT;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
    ADD COLUMN IF NOT EXISTS created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE temples SET
    image_url     = 'https://placehold.co/800x400/E8A33D/1E2A78?text=' || replace(name, ' ', '+'),
    thumbnail_url = 'https://placehold.co/120x120/E8A33D/1E2A78?text=' || replace(name, ' ', '+');
