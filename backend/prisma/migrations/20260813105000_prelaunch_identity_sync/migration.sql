ALTER TABLE "Profile" ADD COLUMN "avatarSeed" TEXT;
ALTER TABLE "Profile" ADD COLUMN "favoriteTeam" TEXT;
ALTER TABLE "Profile" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC';
ALTER TABLE "Profile" ADD COLUMN "lastSeenAt" TIMESTAMP(3);

ALTER TABLE "Thesis" ADD COLUMN "clientId" TEXT;
CREATE UNIQUE INDEX "Thesis_clientId_key" ON "Thesis"("clientId");

ALTER TABLE "Replay" ADD COLUMN "clientId" TEXT;
CREATE UNIQUE INDEX "Replay_clientId_key" ON "Replay"("clientId");

ALTER TABLE "Memory" ADD COLUMN "sourceReplayId" TEXT;
ALTER TABLE "Memory" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX "Memory_sourceReplayId_key" ON "Memory"("sourceReplayId");
