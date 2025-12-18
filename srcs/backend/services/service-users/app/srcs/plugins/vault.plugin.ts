import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import fs from "fs";

const SECRETS_FILE = "/secrets/user/secrets.env";

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Secrets file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();

    process.env[key] = value;
  }
}

const secretsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.log.info("📦 Loading secrets from file...");

  try {
    loadEnvFile(SECRETS_FILE);

    fastify.log.info("✅ Secrets loaded successfully from file");

    // 🔧 Reconstruire DATABASE_URL pour Prisma
    const {
      DB_USER,
      DB_PASSWORD,
      DB_HOST,
      DB_PORT,
      DB_NAME,
    } = process.env;

    if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT || !DB_NAME) {
      throw new Error("Missing database environment variables");
    }

    process.env.DATABASE_URL =
      `postgresql://${DB_USER}:${DB_PASSWORD}` +
      `@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

    fastify.log.info("🔌 DATABASE_URL ready");

  } catch (err) {
    fastify.log.error("❌ Failed to load secrets from file");
    fastify.log.error(err);
    throw err;
  }
};

export default fp(secretsPlugin, {
  name: "secrets-file-plugin",
});


