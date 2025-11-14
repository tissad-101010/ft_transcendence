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

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_states" ADD CONSTRAINT "game_states_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
