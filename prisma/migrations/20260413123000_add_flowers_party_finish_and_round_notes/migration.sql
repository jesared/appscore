ALTER TABLE "FlowersParty"
ADD COLUMN "isFinished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "finishedAt" TIMESTAMP(3);

ALTER TABLE "FlowersPartyRound"
ADD COLUMN "note" TEXT;
