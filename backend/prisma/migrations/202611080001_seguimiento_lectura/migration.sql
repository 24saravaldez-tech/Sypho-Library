-- Todo junto: si algo falla, no dejamos la base a medio camino.
BEGIN;

-- CreateEnum
CREATE TYPE "EstadoLectura" AS ENUM ('PENDIENTE', 'EN_CURSO', 'TERMINADO', 'ABANDONADO');

-- AlterTable
ALTER TABLE "libro" ADD COLUMN     "actualizado_en" TIMESTAMPTZ(3),
ADD COLUMN     "calificacion" INTEGER,
ADD COLUMN     "creado_en" TIMESTAMPTZ(3),
ADD COLUMN     "estado" "EstadoLectura",
ADD COLUMN     "fin_lectura" DATE,
ADD COLUMN     "inicio_lectura" DATE,
ADD COLUMN     "pagina_actual" INTEGER,
ADD COLUMN     "portada_url" VARCHAR(2048),
ADD COLUMN     "resena" TEXT,
ADD COLUMN     "segundo_actual" INTEGER,
ADD COLUMN     "tipo_lectura_id" INTEGER,
ALTER COLUMN "descripcion" SET DATA TYPE TEXT;

-- Primero agregamos columnas vacias. Solo DESPUES ponemos los defaults.
-- Asi no fingimos que todos los libros viejos se crearon hoy o estan pendientes xd.
ALTER TABLE "libro" ALTER COLUMN "creado_en" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';

-- CreateTable
CREATE TABLE "tipo_lectura" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "tipo_lectura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_lectura_codigo_key" ON "tipo_lectura"("codigo");

-- CreateIndex
CREATE INDEX "libro_autor_id_idx" ON "libro"("autor_id");

-- CreateIndex
CREATE INDEX "libro_categoria_id_idx" ON "libro"("categoria_id");

-- CreateIndex
CREATE INDEX "libro_tipo_lectura_id_idx" ON "libro"("tipo_lectura_id");

-- AddForeignKey
ALTER TABLE "libro" ADD CONSTRAINT "libro_tipo_lectura_id_fkey" FOREIGN KEY ("tipo_lectura_id") REFERENCES "tipo_lectura"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- No asignamos un formato a los libros anteriores porque no sabemos cual era.
INSERT INTO "tipo_lectura" ("codigo", "nombre") VALUES
('FISICO', 'Libro fisico'),
('DIGITAL', 'Libro digital'),
('AUDIOLIBRO', 'Audiolibro');

COMMIT;
