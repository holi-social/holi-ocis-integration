locals {
  ocis_integration_database_port = "5432"
}

# Development database configuratrion
data "google_secret_manager_secret_version_access" "ocis_integration_db_username" {
  secret  = local.environment_name == "production" ? "OCIS_INTEGRATION_DB_USERNAME_PRODUCTION" : "OCIS_INTEGRATION_DB_USERNAME_DEVELOPMENT"
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret_version_access" "ocis_integration_db_password" {
  secret  = local.environment_name == "production" ? "OCIS_INTEGRATION_DB_PASSWORD_PRODUCTION" : "OCIS_INTEGRATION_DB_PASSWORD_DEVELOPMENT"
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

resource "google_sql_user" "ocis_integration_db_user" {
  name     = data.google_secret_manager_secret_version_access.ocis_integration_db_username.secret_data
  project  = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  instance = local.environment_name == "production" ? data.terraform_remote_state.holi_infra_state.outputs.database_name_production : data.terraform_remote_state.holi_infra_state.outputs.database_name_development
  password = data.google_secret_manager_secret_version_access.ocis_integration_db_password.secret_data
}

resource "google_sql_database" "ocis_integration" {
  # reuse old development database for staging. It would be clean to use the random id here, but legacy...
  name     = local.environment_name == "staging" ? "ocis-integration-development" : "ocis-integration-${local.environment_name}"
  project  = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  instance = local.environment_name == "production" ? data.terraform_remote_state.holi_infra_state.outputs.database_name_production : data.terraform_remote_state.holi_infra_state.outputs.database_name_development
}
