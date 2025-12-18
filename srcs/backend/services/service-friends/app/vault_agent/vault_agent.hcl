pid_file = "/tmp/vault-agent.pid"

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/secrets/friends/role_id"
      secret_id_file_path = "/secrets/friends/secret_id"
    }
  }
}

sink "file" {
  config = {
    path = "/secrets/friends/vault-token"
    mode = 0640
  }
}

template {
  source      = "/secrets/friends/secrets.tpl"
  destination = "/secrets/friends/secrets.env"
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


