pid_file = "/tmp/vault-agent.pid"
vault {
  address         = "https://hashicorp_vault:8200"
  tls_skip_verify = true
}
auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/secrets/chat/role_id"
      secret_id_file_path = "/secrets/chat/secret_id"
    }
  }
}

sink "file" {
  config = {
    path = "/secrets/chat/vault-token"
    mode = 0640
  }
}

template {
  source      = "/secrets/chat/secrets.tpl"
  destination = "/secrets/chat/secrets.env"
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
