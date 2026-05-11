-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "level" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" INTEGER,
    "actor_name" TEXT,
    "target_type" TEXT,
    "target_id" INTEGER,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);
