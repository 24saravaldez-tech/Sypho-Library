/*
  Warnings:

  - Made the column `actualizado_en` on table `libro` required. This step will fail if there are existing NULL values in that column.
  - Made the column `creado_en` on table `libro` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estado` on table `libro` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipo_lectura_id` on table `libro` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "libro" ALTER COLUMN "actualizado_en" SET NOT NULL,
ALTER COLUMN "actualizado_en" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "creado_en" SET NOT NULL,
ALTER COLUMN "estado" SET NOT NULL,
ALTER COLUMN "tipo_lectura_id" SET NOT NULL;

-- RenameForeignKey
ALTER TABLE "libro" RENAME CONSTRAINT "libro_tipo_lectura_id_fkey" TO "fk_tipo_lectura_id";
