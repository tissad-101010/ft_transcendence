// import Vault from "node-vault";


// const vault = Vault({
//   endpoint:"https://hashicorp_vault:8200",
//   token: process.env.VAULT_TOKEN!,
  
//   requestOptions: { strictSSL: false }
// });

// async function loadSecretsToEnv() {
//   console.log('🚀 Loading secrets from Vault...');
//   if (!process.env.VAULT_TOKEN) {
//     console.error("VAULT_TOKEN is not set in environment variables");
//     throw new Error("VAULT_TOKEN is not set in environment variables");
//   }
  
//   const result = await vault.read('/secret/data/backend');
//   console.log('====================================================================+>Vault secrets loaded:', result);
//   const secrets = result.data.data;

//   // Copier dans process.env pour que tout le code continue de lire process.env
//   for (const [key, value] of Object.entries(secrets)) {
//     process.env[key] = value as string;
//   }
// }

// export { loadSecretsToEnv };

import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import Vault from "node-vault";

const vaultPlugin: FastifyPluginAsync = async (fastify) => {
  if (!process.env.VAULT_TOKEN) {
    fastify.log.error("VAULT_TOKEN is not set in environment variables");
    throw new Error("VAULT_TOKEN is not set in environment variables");
  }

  const vault = Vault({
    endpoint: "https://hashicorp_vault:8200",
    token: process.env.VAULT_TOKEN,
    requestOptions: { strictSSL: false },
  });

  fastify.log.info("🚀 Loading secrets from Vault...");

  try {
    const result = await vault.read("secret/data/backend"); // KV v2
    const secrets = result.data.data;

    for (const [key, value] of Object.entries(secrets)) {
      process.env[key] = value as string;
    }

    fastify.log.info("✅ Vault secrets loaded successfully");

    // 🔧 Reconstruire DATABASE_URL pour Prisma
    process.env.DATABASE_URL =
      `postgresql://${process.env.DB_USER}` +
      `:${process.env.DB_PASSWORD}` +
      `@${process.env.DB_HOST}` +
      `:${process.env.DB_PORT}` +
      `/${process.env.DB_NAME}`;

    fastify.log.info(`🔌 DATABASE_URL ready: ${process.env.DATABASE_URL}`);

  } catch (err: any) {
    fastify.log.error("❌ Failed to load secrets from Vault");
    fastify.log.error(err);
    throw err;
  }
};

// ⬇️ Le plugin Fastify exporté avec nom
export default fp(vaultPlugin, {
  name: "vault-plugin",
});

