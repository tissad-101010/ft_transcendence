-- CreateTable
CREATE TABLE "GameProfile" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "login" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "player1_id" INTEGER,
    "player2_id" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'waiting',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_states" (
    "game_id" INTEGER NOT NULL,
    "ball_x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ball_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ball_dx" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "ball_dy" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "player1_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "player2_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score1" INTEGER NOT NULL DEFAULT 0,
    "score2" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "game_states_pkey" PRIMARY KEY ("game_id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'waiting',
    "speed" VARCHAR(10) NOT NULL,
    "scoreMax" VARCHAR(10) NOT NULL,
    "timeBefore" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_participants" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "alias" VARCHAR(255) NOT NULL,
    "ready" BOOLEAN NOT NULL DEFAULT false,
    "eliminated" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_matches" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "match_number" INTEGER NOT NULL,
    "player1_id" INTEGER,
    "player2_id" INTEGER,
    "winner_id" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "next_match_id" INTEGER,
    "next_match_slot" INTEGER,
    "score1" INTEGER NOT NULL DEFAULT 0,
    "score2" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "tournament_matches_pkey" PRIMARY KEY ("id")
);

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
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "friendly_matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameProfile_username_key" ON "GameProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "GameProfile_email_key" ON "GameProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_participants_tournament_id_user_id_key" ON "tournament_participants"("tournament_id", "user_id");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_states" ADD CONSTRAINT "game_states_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "tournament_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "tournament_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "tournament_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendly_matches" ADD CONSTRAINT "friendly_matches_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendly_matches" ADD CONSTRAINT "friendly_matches_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
