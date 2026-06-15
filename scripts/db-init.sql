-- PostgreSQL init script — NEWGAME Security
-- Dijalankan satu kali saat container postgres pertama kali dibuat.
-- Membuat user dengan permission minimal (principle of least privilege).

-- Buat database jika belum ada
SELECT 'CREATE DATABASE newgame'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'newgame')\gexec

-- Revoke akses publik dari database
REVOKE ALL ON DATABASE newgame FROM PUBLIC;

-- User aplikasi hanya bisa CRUD, tidak bisa DROP atau ALTER
-- (user ini dipakai oleh NestJS API)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'newgame_app') THEN
    CREATE ROLE newgame_app WITH LOGIN;
  END IF;
END
$$;

-- Grant minimal privileges
GRANT CONNECT ON DATABASE newgame TO newgame_app;
GRANT USAGE ON SCHEMA public TO newgame_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO newgame_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO newgame_app;

-- Pastikan future tables juga punya permission yang sama
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO newgame_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO newgame_app;
