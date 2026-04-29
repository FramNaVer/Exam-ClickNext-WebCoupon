-- AlterTable
ALTER TABLE "user" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN     "provider_id" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ALTER COLUMN "password" DROP NOT NULL;
