# Sypho-Library

Backend (API REST) para registrar libros, autores y categorías, y llevar el seguimiento de tus lecturas.

**Stack:** Node.js · Express 5 · TypeScript 7 · Prisma 7 · PostgreSQL 16 (en Docker)

> Este README cubre solo la **instalación y puesta en marcha** del backend.

---

## Requisitos

- **Node.js 22 o superior** y npm (se desarrolló con Node 24.13.0)
- **Docker** (para la base de datos PostgreSQL)
- **Git**
- Opcional: DBeaver, para ver las tablas

## Versiones importantes

| Herramienta | Versión |
|---|---|
| TypeScript | 7.0.2 |
| Express | 5.x |
| Prisma (CLI) y `@prisma/client` | **7.10.1** (siempre la misma versión mayor) |
| PostgreSQL | 16 |

> ⚠️ **No actualices Prisma a la 8.0.** Es una versión de prueba (RC) con comandos distintos, y mezclarla con el cliente 7.x rompe `prisma init` y otros comandos. Para comprobar que están alineados: `npm ls prisma @prisma/client`.

---

## Instalación

Todos los comandos se ejecutan desde la carpeta `backend`, salvo que se indique otra cosa.

### 1. Clonar el repositorio

```bash
git clone https://github.com/24saravaldez-tech/Sypho-Library
cd Sypho-Library/backend
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Levantar PostgreSQL con Docker

Crea el contenedor (cambia `TU_CONTRASEÑA` por la que quieras usar):

```bash
docker run --name mi-postgres -e POSTGRES_PASSWORD=TU_CONTRASEÑA -e POSTGRES_DB=practica -p 5432:5432 -d postgres:16
```

Si el contenedor ya existía, solo enciéndelo:

```bash
docker start mi-postgres
```

**Comprueba** que está corriendo (debe aparecer `mi-postgres` con estado `Up`):

```bash
docker ps
```

> Si Docker te dice que no tienes permisos, usa `sudo` delante del comando o agrega tu usuario al grupo `docker`.

### 4. Crear el archivo `.env`

En la carpeta `backend`, crea un archivo llamado `.env` con este contenido:

```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/practica"
PORT=5010
```

- `PORT` es **solo el número** (no una URL). Si le pones una URL, el servidor no arranca.
- Si tu contraseña tiene caracteres especiales (`@`, `#`, `/`...), deben ir codificados en la URL.
- El `.env` **no se sube a git** (ya está en `.gitignore`). No lo compartas ni lo incluyas en zips.

### 5. Generar el cliente de Prisma

```bash
npx prisma generate
```

Debe terminar con: `✔ Generated Prisma Client (7.10.1) to ./generated/prisma`

La carpeta `generated/prisma` **no está en git**, así que este paso es obligatorio en cada instalación nueva y cada vez que cambie `prisma/schema.prisma` (Prisma 7 ya no lo hace automáticamente).

### 6. Crear las tablas

```bash
npx prisma migrate deploy
```

Aplica las migraciones guardadas en `prisma/migrations`. **Comprueba** que se crearon las tablas:

```bash
docker exec mi-postgres psql -U postgres -d practica -c "\dt"
```

Deben aparecer: `autor`, `categoria`, `libro`, `tipo_lectura` y `_prisma_migrations`.

### 7. Cargar datos de ejemplo (opcional)

```bash
npx tsx prisma/seed.ts
```

Resultado esperado:

```
Libros nuevos creados en esta corrida: 9
Total en la base -> libros: 9, autores: 4, categorías: 2, tipos de lectura: 3
```

Puedes ejecutarlo más de una vez: no duplica datos (la segunda vez dice `0` libros nuevos).

### 8. Arrancar el servidor

```bash
npm run dev
```

Debe mostrar:

```
🚀 Servidor ejecutándose en http://localhost:5010
```

El servidor se reinicia solo cuando guardas cambios en el código.

---

## Comandos útiles

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Arranca el servidor con recarga automática |
| `npx tsc --noEmit` | Revisa los tipos de TypeScript sin generar archivos |
| `npx prisma validate` | Comprueba que `schema.prisma` está bien escrito |
| `npx prisma generate` | Regenera el cliente de Prisma |
| `npx prisma migrate deploy` | Aplica las migraciones existentes (instalación nueva) |
| `npx prisma migrate dev --name <nombre>` | Crea y aplica una migración nueva (desarrollo) |
| `npx tsx prisma/seed.ts` | Carga los datos de ejemplo |
| `npx prisma migrate reset` | ⚠️ Borra **todos** los datos y reaplica las migraciones |

### Cuando cambies el esquema (desarrollo)

1. Edita `prisma/schema.prisma`.
2. `npx prisma migrate dev --name describe_el_cambio`
3. `npx prisma generate`
4. Reinicia el servidor.

### Respaldo y restauración de la base

Haz los respaldos **fuera de la carpeta del proyecto** para no subirlos a git por accidente:

```bash
# Respaldar
docker exec mi-postgres pg_dump -U postgres practica > ~/respaldo.sql
ls -lh ~/respaldo.sql
grep "CREATE TABLE" ~/respaldo.sql

# Restaurar (en una base vacía)
docker exec -i mi-postgres psql -U postgres -d practica < ~/respaldo.sql
```

---

## Estructura del proyecto

```
Sypho-Library/
└── backend/
    ├── prisma/
    │   ├── schema.prisma        modelos de la base de datos
    │   ├── seed.ts              datos de ejemplo
    │   └── migrations/          historial de migraciones
    ├── generated/prisma/        cliente generado (no se sube a git)
    ├── prisma7.config.ts        configuración de Prisma
    ├── src/
    │   ├── service.ts           arranque del servidor
    │   ├── index.ts             app de Express y rutas
    │   ├── lib/prisma.ts        cliente de Prisma (una sola instancia)
    │   ├── middlewares/         manejo de errores
    │   ├── modules/             libros, autores y categorías
    │   └── utils/               errores, respuestas y validadores
    └── .env                     variables de entorno (no se sube a git)
```

---

## Solución de problemas

| Síntoma | Causa y solución |
|---|---|
| `Cannot resolve environment variable: DATABASE_URL` | Falta el archivo `.env` o no está en la carpeta `backend`. |
| `Can't reach database server at localhost:5432` | El contenedor está apagado: `docker ps` y luego `docker start mi-postgres`. Revisa también contraseña y puerto en la `DATABASE_URL`. |
| El servidor falla al importar `generated/prisma/client` | Falta generar el cliente: `npx prisma generate`. |
| `No flag registered for --...` o comandos de Prisma que se comportan raro | Versiones desalineadas. Revisa `npm ls prisma @prisma/client`; ambos deben ser 7.10.1. Instala con `npm install -D prisma@7.10.1`. |
| `Drift detected: Your database schema is not in sync with your migration history` | La base tiene tablas que ninguna migración creó (por ejemplo, la armaste a mano). En una base de práctica: respalda, desconecta DBeaver y ejecuta `npx prisma migrate reset`. ⚠️ Borra todos los datos. |
| El reinicio de la base se queda esperando | DBeaver u otro programa tiene la base abierta. Desconéctalo (clic derecho en la conexión, *Disconnect*) y repite. |
| `EACCES` al arrancar el servidor | `PORT` en el `.env` tiene una URL en vez de un número. Debe ser solo `5010` (o el puerto que quieras). |
