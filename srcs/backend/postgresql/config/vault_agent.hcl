pid_file = "/tmp/vault-agent.pid"

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/var/lib/postgresql/data/postgresql/vault_agent/role_id"
      secret_id_file_path = "/var/lib/postgresql/data/postgresql/vault_agent/secret_id"
    }
  }
}

sink "file" {
  config = {
    path = "/var/lib/postgresql/data/postgresql/vault_agent/vault-token"
    mode = 0640
  }
}

template {
  source      = "/var/lib/postgresql/data/postgresql/vault_agent/secrets.tpl"
  destination = "/var/lib/postgresql/data/postgresql/vault_agent/secrets.env"
}

cache {
  use_auto_auth_token = true
}

listener "tcp" {
  address     = "127.0.0.1:8201"
  tls_disable = true
}

vault {
  address         = "https://hashicorp_vault:8200"
  tls_skip_verify = true
}
