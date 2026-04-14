CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameSlug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

INSERT INTO "GameSession" (
    "id",
    "name",
    "gameSlug",
    "isActive",
    "isFinished",
    "finishedAt",
    "createdAt",
    "updatedAt",
    "data"
)
SELECT
    party."id",
    party."name",
    party."gameSlug",
    party."isActive",
    party."isFinished",
    party."finishedAt",
    party."createdAt",
    party."updatedAt",
    jsonb_build_object(
        'players',
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', player."clientId",
                        'name', player."name"
                    )
                    ORDER BY player."position"
                )
                FROM "FlowersPartyPlayer" AS player
                WHERE player."partyId" = party."id"
            ),
            '[]'::jsonb
        ),
        'rounds',
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', round."clientId",
                        'name', round."name",
                        'note', round."note"
                    )
                    ORDER BY round."position"
                )
                FROM "FlowersPartyRound" AS round
                WHERE round."partyId" = party."id"
            ),
            '[]'::jsonb
        ),
        'scoreSheets',
        COALESCE(
            (
                SELECT jsonb_object_agg(player_data.player_id, player_data.round_scores)
                FROM (
                    SELECT
                        player."clientId" AS player_id,
                        COALESCE(
                            (
                                SELECT jsonb_object_agg(
                                    round."clientId",
                                    jsonb_build_object(
                                        'blueScore', COALESCE(score."blueScore", 0),
                                        'yellowScore', COALESCE(score."yellowScore", 0),
                                        'redScore', COALESCE(score."redScore", 0),
                                        'greenScore', COALESCE(score."greenScore", 0),
                                        'butterflyScore', COALESCE(score."butterflyScore", 0),
                                        'invalidCards', COALESCE(score."invalidCards", 0)
                                    )
                                )
                                FROM "FlowersPartyRound" AS round
                                LEFT JOIN "FlowersPartyScore" AS score
                                    ON score."roundId" = round."id"
                                   AND score."playerId" = player."id"
                                WHERE round."partyId" = party."id"
                            ),
                            '{}'::jsonb
                        ) AS round_scores
                    FROM "FlowersPartyPlayer" AS player
                    WHERE player."partyId" = party."id"
                ) AS player_data
            ),
            '{}'::jsonb
        )
    )
FROM "FlowersParty" AS party;

CREATE INDEX "GameSession_gameSlug_updatedAt_idx"
ON "GameSession"("gameSlug", "updatedAt" DESC);

CREATE INDEX "GameSession_isActive_updatedAt_idx"
ON "GameSession"("isActive", "updatedAt" DESC);

DROP TABLE "FlowersPartyScore";
DROP TABLE "FlowersPartyRound";
DROP TABLE "FlowersPartyPlayer";
DROP TABLE "FlowersParty";
