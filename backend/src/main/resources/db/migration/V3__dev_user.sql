-- Dev-only user so check-ins work end-to-end before Google OAuth is wired in.
-- Remove (or stop seeding) once real authentication lands.
INSERT INTO users (id, name, email)
VALUES ('00000000-0000-0000-0000-0000000000aa', 'Dev User', 'dev@templepassport.local')
ON CONFLICT (id) DO NOTHING;
