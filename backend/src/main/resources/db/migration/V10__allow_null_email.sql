-- Allow phone-only users (no email required)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
