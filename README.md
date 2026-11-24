# Preparcial 2 · Sistema de usuarios y roles

API en **NestJS** con autenticación JWT (access token + refresh token con rotación), autorización por roles con **policies** y persistencia en **PostgreSQL** con una relación muchos a muchos entre usuarios y roles.

ISIS3710 · Programación con tecnologías web · Universidad de los Andes

## Stack

| Pieza | Tecnología |
|---|---|
| Framework | NestJS 12 (ESM) |
| Autenticación | `@nestjs/authentication` (JWT Bearer, `PasswordHasher` con scrypt, `TokenService`) |
| Autorización | `@nestjs/authorization` (`@Policy()`, `@Can()`, `before()`) |
| Persistencia | TypeORM 1.x + PostgreSQL 17 |
| Validación | `class-validator` + `ValidationPipe` |
| Documentación | Swagger en `/api` |
| Base de datos | Docker Compose |
| Gestor de paquetes | pnpm |

## Requisitos

- Node.js 22 o superior
- pnpm
- Docker y Docker Compose

## Cómo ejecutarlo

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Variables de entorno
Copiar la plantilla y completar los valores:
```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (por defecto `3000`) |
| `DB_HOST` | Host de PostgreSQL (`localhost`) |
| `DB_PORT` | Puerto de PostgreSQL (`5432`) |
| `DB_USER` | Usuario de la base |
| `DB_PASS` | Contraseña de la base |
| `DB_NAME` | Nombre de la base |
| `JWT_SECRET` | Secreto para firmar los JWT: **mínimo 32 caracteres aleatorios** |
| `JWT_EXPIRES_IN` | Duración del access token (`2m`) |
| `JWT_REFRESH_EXPIRES_IN` | Duración del refresh token (`7d`) |

Para generar `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

> `docker-compose.yml` lee `DB_USER`, `DB_PASS`, `DB_NAME` y `DB_PORT` del mismo `.env`, así que la base y la API quedan con las mismas credenciales.

### 3. Levantar PostgreSQL
```bash
docker compose up -d
```
Crea el contenedor `parcial2-db` con un volumen (`pgdata`) para que los datos no se pierdan al apagarlo.

### 4. Arrancar la API (crea las tablas)
```bash
pnpm start:dev
```
Con `synchronize: true`, TypeORM crea las tablas `users`, `roles` y `user_roles` a partir de las entidades.

### 5. Cargar los datos con las migraciones
En otra terminal, con la API ya arrancada una vez:
```bash
pnpm migration:run
```

### 6. Probar
Swagger: **http://localhost:3000/api**

1. `POST /auth/login` con un usuario de la tabla de abajo.
2. Copiar el `accessToken` y pegarlo en **Authorize**.
3. Probar las rutas protegidas. El access token dura **2 minutos**: si todo empieza a responder 401, renovarlo con `POST /auth/refresh`.

## Usuarios de prueba

| Email | Contraseña | Roles | Sirve para probar |
|---|---|---|---|
| `admin@parcial.com` | `Admin123*` | admin | Acceso a todas las rutas |
| `supervisor@parcial.com` | `Test123*` | supervisor, user | Usuario con varios roles |
| `usuario@parcial.com` | `Test123*` | user | 403 en rutas de admin |
| `sinrol@parcial.com` | `Test123*` | (ninguno) | Usuario recién registrado |
| `inactivo@parcial.com` | `Test123*` | user, `is_active = false` | 423 en el login |

## Endpoints

| Método | Ruta | Acceso | Éxito | Errores |
|---|---|---|---|---|
| POST | `/auth/register` | público | 201 | 400 email inválido · 409 email ya registrado |
| POST | `/auth/login` | público | 200 | 401 credenciales incorrectas · 423 usuario desactivado |
| POST | `/auth/refresh` | público | 200 | 400 refreshToken requerido · 401 inválido, usado o revocado |
| POST | `/auth/logout` | público | 204 | 400 refreshToken requerido |
| POST | `/roles` | admin | 201 | 400 · 401 · 403 · 409 role_name ya existe |
| GET | `/roles` | admin | 200 | 401 · 403 · 500 |
| PATCH | `/users/:id/roles` | admin | 200 | 400 roles inválidos · 401 · 403 · 404 |
| GET | `/users/me` | autenticado | 200 | 401 · 404 |
| GET | `/users` | admin | 200 | 401 · 403 · 500 |

Body de `PATCH /users/:id/roles`:
```json
{ "roles": ["admin", "supervisor"] }
```
Reemplaza los roles del usuario por los de la lista.

## Migraciones

Están en `src/db/migrations` y se ejecutan compiladas desde `dist/`, con la conexión de `src/db/data-source.ts`.

| Migración | Qué hace |
|---|---|
| `DefaultState` | Vacía las tablas y crea el rol `admin` y el usuario `admin@parcial.com` |
| `TestData` | Crea los roles `supervisor` y `user` y los usuarios de prueba con sus roles |

```bash
pnpm migration:run      # ejecuta las pendientes
pnpm migration:revert   # deshace la última
```

**Volver al estado inicial** (por ejemplo, si se dañaron datos):
```bash
pnpm migration:revert
pnpm migration:revert
pnpm migration:run
```

## Script SQL de usuarios y roles probados

`db/usuarios-roles-probados.sql` inserta los mismos roles, usuarios y asignaciones, y trae consultas que comprueban el resultado: usuarios con sus roles, admins, usuarios sin rol, usuarios desactivados, usuarios por rol y que ningún password esté en texto plano. Se puede ejecutar varias veces sin duplicar datos.

```bash
# PowerShell
Get-Content db/usuarios-roles-probados.sql | docker exec -i parcial2-db psql -U parcial2_app -d usuarios_roles

# bash
docker exec -i parcial2-db psql -U parcial2_app -d usuarios_roles < db/usuarios-roles-probados.sql
```
Cambiar `parcial2_app` y `usuarios_roles` si en el `.env` se usaron otros valores de `DB_USER` y `DB_NAME`.

## Decisiones técnicas

- **Autenticación con `@nestjs/authentication`.** Su guard global protege todas las rutas, y las de `/auth` se abren con `@Public()`. `JwtAuth` (`JwtBearerProvider`) carga el usuario del token **con sus roles**, que es lo que leen las policies.
- **Refresh tokens con rotación.** Cada refresh token sirve una sola vez. Si se reutiliza uno ya usado, el paquete revoca toda la familia de tokens. Se guardan en memoria (`allowInMemoryStorage: true`, permitido por el enunciado): al reiniciar la API hay que volver a iniciar sesión.
- **Contraseñas con `PasswordHasher` (scrypt).** En el login, `verify()` se ejecuta aunque el email no exista, así la respuesta tarda lo mismo y no revela qué cuentas existen. El 401 tiene el mismo mensaje para email inexistente y contraseña incorrecta.
- **Usuario desactivado (423) después de verificar la contraseña.** Así, quien no conoce la contraseña no puede averiguar que la cuenta existe.
- **Autorización con policies.** `UserPolicy` y `RolePolicy` dejan pasar al admin con `before()`. Las demás reglas devuelven `false`. Todo queda **cerrado por defecto**: una ruta sin `@Can()`, `@Can.Anyone()` o `@Public()` responde 403. Sin token responde 401 y con token pero sin el rol, 403; los dos los responden los paquetes.
- **El password nunca se devuelve.** `@Exclude()` en la entidad, aplicado por `ClassSerializerInterceptor`. Además, `/users` y `/users/me` arman la respuesta solo con los campos del enunciado.
- **El registro no asigna roles.** El DTO de registro no tiene `roles`, y `ValidationPipe` con `whitelist` descarta cualquier campo que no esté en el DTO. Los roles los asigna un admin.
- **`synchronize: true` + migraciones de datos.** TypeORM mantiene la estructura de las tablas y las migraciones manejan los datos: el estado por defecto (admin) y los datos de prueba. Así se puede volver a un estado conocido con `revert` y `run`.
- **`ParseUUIDPipe` en `/users/:id/roles`.** Un id que no es uuid responde 400 en vez de un 500 de PostgreSQL.

## Estructura

```
src/
├── auth/            register, login, refresh, logout · JwtAuth · DTOs
├── users/           entidad User · UserPolicy · asignar roles, perfil, listar
├── roles/           entidad Role · RolePolicy · crear y listar
├── db/
│   ├── data-source.ts   conexión para el CLI de TypeORM
│   └── migrations/      DefaultState y TestData
├── app.module.ts
└── main.ts          ValidationPipe global y Swagger
db/
└── usuarios-roles-probados.sql
docker-compose.yml
.env.example
```
