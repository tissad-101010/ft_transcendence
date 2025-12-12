import Vault from "node-vault";


const vault = Vault({
  endpoint:"https://hashicorp_vault:8200",
  token: process.env.VAULT_TOKEN!,
  
  requestOptions: { strictSSL: false }
});

async function loadSecretsToEnv() {
  console.log('🚀 Loading secrets from Vault...');
  if (!process.env.VAULT_TOKEN) {
    console.error("VAULT_TOKEN is not set in environment variables");
    throw new Error("VAULT_TOKEN is not set in environment variables");
  }
  
  const result = await vault.read('/secret/backend');
  console.log('====================================================================+>Vault secrets loaded:', result);
  // const secrets = result.data;

  // // Copier dans process.env pour que tout le code continue de lire process.env
  // for (const [key, value] of Object.entries(secrets)) {
  //   process.env[key] = value as string;
  // }
}

export { loadSecretsToEnv };

