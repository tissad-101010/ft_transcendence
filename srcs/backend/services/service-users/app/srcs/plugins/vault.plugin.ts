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

    // Copier dans process.env pour que tout le code continue de lire process.env
    for (const [key, value] of Object.entries(secrets)) {
      process.env[key] = value as string;
    }

    console.log("✅ Vault secrets loaded successfully");
    console.log('🚀 Loading secrets from Vault...', process.env.TOTO, process.env.ACCESS_TOKEN_SECRET);
  } catch (err: any) {
    fastify.log.error("❌ Failed to load secrets from Vault", err);
    throw err; // Stop Fastify startup
  }
};

export default vaultPlugin;
