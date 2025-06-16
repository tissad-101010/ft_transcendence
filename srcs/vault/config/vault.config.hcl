api_addr      = "https://localhost:8220"
cluster_addr  = "https://0.0.0.0:8221"
cluster_name  = "vault-cluster"
disable_mlock = true
ui            = true

listener "tcp" {
  address         = "hashicorp_vault:0"
  cluster_address = "hashicorp_vault:1"
  tls_disable     = 0
  tls_min_version = "tls12"

  tls_cert_file   = "/etc/vault/certs/vault.crt"
  tls_key_file    = "/etc/vault/certs/vault.key"
}

storage "file" {
  path = "/vault/data"
}
