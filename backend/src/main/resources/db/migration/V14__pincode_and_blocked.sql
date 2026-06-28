-- Add pincode to temples (captured in admin portal temple form)
ALTER TABLE temples ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);

-- Add blocked flag to users (managed from admin portal)
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT false NOT NULL;
