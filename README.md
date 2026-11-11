# Sypho Library

API de biblioteca personal con Express, TypeScript, Prisma y PostgreSQL. Incluye libros, autores, categorías y seguimiento de lectura.

## Requisitos

- Node.js 24.x y npm.
- Git.
- PostgreSQL en ejecución, con un usuario y contraseña disponibles.

## Instalación desde cero

Estas instrucciones utilizan una **base nueva y vacía**.

1. Clona la rama de desarrollo y prepara las variables de entorno:

   ```bash
   git clone --branch develop https://github.com/24saravaldez-tech/Sypho-Library.git
   cd Sypho-Library/backend
   cp .env.example .env
   ```

   En Windows puedes copiar el archivo manualmente. Edita `.env`: coloca tu usuario, contraseña, host y puerto de PostgreSQL. `PORT` es el puerto de la API; el puerto de la base va dentro de `DATABASE_URL`. No subas `.env` al repositorio.

2. Crea la base desde una sesión de PostgreSQL con permisos para crear bases. Por ejemplo, entra con `psql -h localhost -U postgres` y ejecuta:

   ```sql
   CREATE DATABASE sypho_library;
   ```

   Si usas otro nombre o usuario, ajusta `DATABASE_URL` y asegúrate de que ese usuario tenga permisos sobre la base y el esquema `public`.

3. Desde `backend`, instala las dependencias y aplica las migraciones:

   ```bash
   npm ci
   npx prisma migrate deploy --config prisma7.config.ts
   npm run prisma:generate
   ```

   Las migraciones crean las tablas, relaciones y el catálogo de tipos de lectura. Prisma Client se genera localmente; no se incluye en Git.

4. Carga los datos de ejemplo y arranca el servidor:

   ```bash
   npx tsx prisma/seed.ts
   npm run dev
   ```

   El seeder agrega autores, categorías y libros de ejemplo. Busca los autores y libros antes de crearlos; los tipos de lectura y categorías utilizan `upsert`. Al repetirlo secuencialmente no vuelve a insertar esos mismos ejemplos; tampoco actualiza los libros de ejemplo que ya existan.

La API queda en `http://localhost:5010` salvo que cambies `PORT`. Puedes comprobarla con:

```bash
curl http://localhost:5010/api/sypho-library/books/all
```

`npm run dev` reinicia el servidor cuando cambia el código. Para detenerlo, usa `Ctrl+C`.

## Comandos útiles

Ejecuta los comandos desde `backend`.

| Comando | Uso |
| --- | --- |
| `npm run dev` | Iniciar el servidor en desarrollo. |
| `npm run typecheck` | Comprobar los tipos de TypeScript. |
| `npm run prisma:validate` | Validar el esquema de Prisma. |
| `npm run prisma:generate` | Regenerar Prisma Client después de cambiar el esquema. |
| `npm run db:estado` | Consultar el estado de las migraciones. |
| `npx prisma migrate deploy --config prisma7.config.ts` | Aplicar las migraciones pendientes del repositorio. |
| `npx tsx prisma/seed.ts` | Cargar los datos de ejemplo. |
| `npx prisma migrate dev --name nombre_del_cambio --config prisma7.config.ts` | Crear y aplicar una migración nueva en una base de desarrollo. Revisar cualquier solicitud de reset antes de aceptarla. |

## Si la base ya contiene datos

Haz un respaldo y revisa `npm run db:estado` antes de aplicar migraciones. La migración más reciente hace obligatorios el formato, el estado y las fechas de control: fallará si existen valores `NULL` en esas columnas. Hay que revisar y completar esos registros antes de aplicarla.

`0_init` representa el esquema original. Una base anterior sin historial de migraciones requiere comprobar ese esquema y preparar su baseline; no marques migraciones como aplicadas sin verificar que coinciden con la base real. `npm run db:comparar` compara con ese esquema original, no con el esquema actual.

No uses `migrate reset` para actualizar una base cuyos datos quieres conservar. El respaldo SQL local no es necesario para instalar el proyecto desde cero.
