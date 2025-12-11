import Vault from "node-vault";

const vault = Vault({
  endpoint: process.env.VAULT_ADDR!,
  token: process.env.VAULT_TOKEN!,
  requestOptions: { strictSSL: false },
});

async function loadSecretsToEnv(): Promise<void> {
  let secretsLoaded = false;

  // Boucle jusqu'à ce que Vault soit prêt
  while (!secretsLoaded) {
    try {
      const result = await vault.read("secret/data/backend"); // KV v2
      const secrets = result.data.data;

      // Copier dans process.env
      for (const [key, value] of Object.entries(secrets)) {
        process.env[key] = value as string;
      }

      secretsLoaded = true;
      console.log("✅ Secrets loaded from Vault");
    } catch (err: any) {
      if (err.message.includes("Vault is sealed") || err.message.includes("connection refused")) {
        console.log("⏳ Vault not ready yet, retrying in 2s...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        throw err;
      }
    }
  }
}

export { loadSecretsToEnv };

