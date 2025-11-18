-- CreateTable
CREATE TABLE "friendly_matches" (
    "id" SERIAL NOT NULL,
    "player1_id" INTEGER NOT NULL,
    "player2_id" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'waiting',
    "speed" VARCHAR(10) NOT NULL,
    "scoreMax" VARCHAR(10) NOT NULL,
    "timeBefore" VARCHAR(10) NOT NULL,
    "score1" INTEGER NOT NULL DEFAULT 0,
    "score2" INTEGER NOT NULL DEFAULT 0,
    "winner_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "friendly_matches_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "friendly_matches" ADD CONSTRAINT "friendly_matches_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendly_matches" ADD CONSTRAINT "friendly_matches_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;













