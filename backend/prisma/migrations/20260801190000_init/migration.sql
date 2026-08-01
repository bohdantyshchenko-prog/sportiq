CREATE TABLE "Profile" (
  "id" UUID NOT NULL,
  "email" TEXT,
  "displayName" TEXT,
  "locale" TEXT NOT NULL DEFAULT 'ru',
  "theme" TEXT NOT NULL DEFAULT 'dark',
  "sportsIQ" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

CREATE TABLE "Match" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerMatchId" TEXT NOT NULL,
  "tournament" TEXT NOT NULL,
  "homeTeam" TEXT NOT NULL,
  "awayTeam" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Match_provider_providerMatchId_key" ON "Match"("provider","providerMatchId");
CREATE INDEX "Match_startsAt_idx" ON "Match"("startsAt");
CREATE INDEX "Match_status_startsAt_idx" ON "Match"("status","startsAt");

CREATE TABLE "Thesis" (
  "id" UUID NOT NULL,
  "profileId" UUID NOT NULL,
  "matchId" TEXT NOT NULL,
  "scenario" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "risk" TEXT NOT NULL,
  "alternative" TEXT,
  "confidence" INTEGER NOT NULL,
  "lockedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Thesis_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Thesis_profileId_createdAt_idx" ON "Thesis"("profileId","createdAt");
CREATE INDEX "Thesis_matchId_idx" ON "Thesis"("matchId");

CREATE TABLE "Replay" (
  "id" UUID NOT NULL,
  "thesisId" UUID NOT NULL,
  "outcome" TEXT NOT NULL,
  "reflection" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "evidence" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Replay_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Replay_thesisId_key" ON "Replay"("thesisId");

CREATE TABLE "Memory" (
  "id" UUID NOT NULL,
  "profileId" UUID NOT NULL,
  "kind" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "confidence" INTEGER NOT NULL,
  "evidence" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Memory_profileId_createdAt_idx" ON "Memory"("profileId","createdAt");

CREATE TABLE "PushDevice" (
  "id" UUID NOT NULL,
  "profileId" UUID NOT NULL,
  "endpoint" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PushDevice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PushDevice_endpoint_key" ON "PushDevice"("endpoint");
CREATE INDEX "PushDevice_profileId_idx" ON "PushDevice"("profileId");

ALTER TABLE "Thesis" ADD CONSTRAINT "Thesis_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Thesis" ADD CONSTRAINT "Thesis_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Replay" ADD CONSTRAINT "Replay_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PushDevice" ADD CONSTRAINT "PushDevice_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
