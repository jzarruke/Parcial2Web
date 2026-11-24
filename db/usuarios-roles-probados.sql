-- =====================================================================
-- Script SQL de usuarios y roles probados
--
-- Requisito: las tablas ya existen (las crea TypeORM con synchronize
-- al arrancar la app con `pnpm start:dev`).
--
-- Ejecutar:
--   Get-Content db/usuarios-roles-probados.sql | docker exec -i parcial2-db psql -U parcial2_app -d usuarios_roles
--
-- Es idempotente: se puede correr varias veces sin duplicar datos.
--
-- Contraseñas (los hashes son de PasswordHasher, scrypt):
--   admin@parcial.com      -> Admin123*
--   resto de usuarios      -> Test123*
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Roles
-- ---------------------------------------------------------------------
INSERT INTO roles (role_name, description) VALUES
  ('admin',      'Administrador del sistema'),
  ('supervisor', 'Supervisa usuarios'),
  ('user',       'Usuario estándar')
ON CONFLICT (role_name) DO NOTHING;

-- ---------------------------------------------------------------------
-- 2. Usuarios
-- ---------------------------------------------------------------------
INSERT INTO users (email, password, name, phone, is_active) VALUES
  ('admin@parcial.com',
   '$scrypt$ln=17,r=8,p=1$hKUivzmhkemnvnLYJGsezA$C3jmcE9wWKtgzz9VRAHxcnnwdAmKctMozmaJp76c55I',
   'Administrador', NULL, true),
  ('supervisor@parcial.com',
   '$scrypt$ln=17,r=8,p=1$LHdM7bWw3MRkWrRMdNmhjw$2u/KBp2z6fB/nOkncM0dv5WOiC0gMEE0i39FDi3kL6s',
   'Sofía Supervisora', '3001234567', true),
  ('usuario@parcial.com',
   '$scrypt$ln=17,r=8,p=1$LHdM7bWw3MRkWrRMdNmhjw$2u/KBp2z6fB/nOkncM0dv5WOiC0gMEE0i39FDi3kL6s',
   'Uriel Usuario', NULL, true),
  ('sinrol@parcial.com',
   '$scrypt$ln=17,r=8,p=1$LHdM7bWw3MRkWrRMdNmhjw$2u/KBp2z6fB/nOkncM0dv5WOiC0gMEE0i39FDi3kL6s',
   'Sara Sin Rol', NULL, true),
  ('inactivo@parcial.com',
   '$scrypt$ln=17,r=8,p=1$LHdM7bWw3MRkWrRMdNmhjw$2u/KBp2z6fB/nOkncM0dv5WOiC0gMEE0i39FDi3kL6s',
   'Iván Inactivo', NULL, false)
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------
-- 3. Asignación de roles (muchos a muchos)
-- ---------------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON (
     (u.email = 'admin@parcial.com'      AND r.role_name = 'admin')
  OR (u.email = 'supervisor@parcial.com' AND r.role_name IN ('supervisor', 'user'))
  OR (u.email = 'usuario@parcial.com'    AND r.role_name = 'user')
  OR (u.email = 'inactivo@parcial.com'   AND r.role_name = 'user')
)
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================================
-- Consultas de prueba
-- =====================================================================

-- P1. Cada usuario con sus roles (lo que devuelve GET /users)
SELECT u.email,
       u.is_active,
       COALESCE(string_agg(r.role_name, ', ' ORDER BY r.role_name), '(sin roles)') AS roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r       ON r.id = ur.role_id
GROUP BY u.email, u.is_active
ORDER BY u.email;

-- P2. Usuarios con rol admin (pasan todas las policies con before())
SELECT u.email
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r       ON r.id = ur.role_id
WHERE r.role_name = 'admin';

-- P3. Usuarios sin ningún rol (como queda alguien recién registrado)
SELECT u.email
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id);

-- P4. Usuarios desactivados (el login responde 423)
SELECT email FROM users WHERE is_active = false;

-- P5. Cantidad de usuarios por rol
SELECT r.role_name, COUNT(ur.user_id) AS usuarios
FROM roles r
LEFT JOIN user_roles ur ON ur.role_id = r.id
GROUP BY r.role_name
ORDER BY r.role_name;

-- P6. Ningún password se guarda en texto plano (todos deben ser hash scrypt)
SELECT COUNT(*) AS passwords_sin_hash
FROM users
WHERE password NOT LIKE '$scrypt$%';
