-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "FlowersParty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameSlug" TEXT NOT NULL DEFAULT 'flowers',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlowersParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowersPartyPlayer" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "FlowersPartyPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowersPartyRound" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "FlowersPartyRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowersPartyScore" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "blueScore" INTEGER NOT NULL DEFAULT 0,
    "yellowScore" INTEGER NOT NULL DEFAULT 0,
    "redScore" INTEGER NOT NULL DEFAULT 0,
    "greenScore" INTEGER NOT NULL DEFAULT 0,
    "butterflyScore" INTEGER NOT NULL DEFAULT 0,
    "invalidCards" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FlowersPartyScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlowersParty_updatedAt_idx" ON "FlowersParty"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "FlowersPartyPlayer_partyId_position_idx" ON "FlowersPartyPlayer"("partyId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "FlowersPartyPlayer_partyId_clientId_key" ON "FlowersPartyPlayer"("partyId", "clientId");

-- CreateIndex
CREATE INDEX "FlowersPartyRound_partyId_position_idx" ON "FlowersPartyRound"("partyId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "FlowersPartyRound_partyId_clientId_key" ON "FlowersPartyRound"("partyId", "clientId");

-- CreateIndex
CREATE INDEX "FlowersPartyScore_partyId_idx" ON "FlowersPartyScore"("partyId");

-- CreateIndex
CREATE UNIQUE INDEX "FlowersPartyScore_playerId_roundId_key" ON "FlowersPartyScore"("playerId", "roundId");

-- AddForeignKey
ALTER TABLE "FlowersPartyPlayer" ADD CONSTRAINT "FlowersPartyPlayer_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "FlowersParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowersPartyRound" ADD CONSTRAINT "FlowersPartyRound_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "FlowersParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowersPartyScore" ADD CONSTRAINT "FlowersPartyScore_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "FlowersParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowersPartyScore" ADD CONSTRAINT "FlowersPartyScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "FlowersPartyPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowersPartyScore" ADD CONSTRAINT "FlowersPartyScore_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FlowersPartyRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

