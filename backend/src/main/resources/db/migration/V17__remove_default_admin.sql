-- Remove the insecure default admin seeded in V13.
-- Run scripts/create-admin.sh on the VM to create a proper admin account.
DELETE FROM admin_users WHERE username = 'admin';
