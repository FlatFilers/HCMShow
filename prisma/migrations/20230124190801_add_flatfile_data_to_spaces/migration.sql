/*
  Warnings:

  - Added the required column `flatfileData` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Space" ADD COLUMN "flatfileData" JSONB;

UPDATE "Space" SET "flatfileData" = '{}';

ALTER TABLE "Space"
ALTER COLUMN "flatfileData" SET NOT NULL;