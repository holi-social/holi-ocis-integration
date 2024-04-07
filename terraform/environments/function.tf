# see https://cloud.google.com/functions/docs/tutorials/terraform-pubsub

resource "random_id" "main" {
  byte_length = 2
  prefix      = "ocis-integration-${local.environment_name}-"
}

resource "google_storage_bucket" "sources" {
  project                     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name                        = random_id.main.hex
  location                    = local.default_location
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "function_source" {
  name   = "receiveEvent.zip"
  bucket = google_storage_bucket.sources.name
  source = "../../receiveEvent.zip"
}

data "google_secret_manager_secret" "ocis_admin_username" {
  secret_id = local.environment_name == "production" ? "OCIS_ADMIN_USERNAME_PRODUCTION" : "OCIS_ADMIN_USERNAME_DEVELOPMENT"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret" "ocis_admin_password" {
  secret_id = local.environment_name == "production" ? "OCIS_ADMIN_PASSWORD_PRODUCTION" : "OCIS_ADMIN_PASSWORD_DEVELOPMENT"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

# START CMEK encryption for functions
resource "google_kms_crypto_key" "holi_ocis_integration" {
  name            = random_id.main.hex
  key_ring        = data.terraform_remote_state.holi_infra_state.outputs.kms_shared_key_ring_id
  rotation_period = "100000s" # must be greater than a day


  lifecycle {
    prevent_destroy = true # if destroyed, data is inaccessible forever
  }
}

resource "google_kms_crypto_key_iam_binding" "holi_ocis_integration" {
  crypto_key_id = google_kms_crypto_key.holi_ocis_integration.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"

  # https://cloud.google.com/functions/docs/securing/cmek?hl=de#granting_service_accounts_access_to_the_key
  members = [
    "serviceAccount:service-${google_project.shared.number}@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:service-${google_project.shared.number}@gcp-sa-artifactregistry.iam.gserviceaccount.com",
    "serviceAccount:service-${google_project.shared.number}@gs-project-accounts.iam.gserviceaccount.com",
    "serviceAccount:service-${google_project.shared.number}@serverless-robot-prod.iam.gserviceaccount.com",
    "serviceAccount:service-${google_project.shared.number}@gcp-sa-eventarc.iam.gserviceaccount.com",
  ]
}
# END CMEK encryption for functions

resource "google_cloudfunctions2_function" "holi_ocis_integration" {
  project      = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name         = random_id.main.hex
  location     = local.default_location
  kms_key_name = google_kms_crypto_key.holi_ocis_integration.id

  build_config {
    runtime     = "nodejs18"
    entry_point = "receiveEvent"

    # https://github.com/hashicorp/terraform-provider-google/issues/1938#issuecomment-1576849526
    environment_variables = {
      # Causes a re-deploy of the function when the source changes
      "SOURCE_SHA" = filesha256("../../receiveEvent.zip")
    }

    source {
      storage_source {
        bucket = google_storage_bucket.sources.name
        object = google_storage_bucket_object.function_source.name
      }
    }
  }

  service_config {
    max_instance_count = local.environment_name == "production" ? 3 : 1
    min_instance_count = 0
    available_memory   = "128Mi"
    timeout_seconds    = 60
    environment_variables = {
      ENVIRONMENT              = local.environment_name
      OCIS_OIDC_ISSUER         = local.environment_name == "production" ? "https://auth.holi.social" : "https://dev-auth.holi.social"
      OWNCLOUD_BASE_URL        = local.environment_name == "production" ? "https://production.cloud.holi.social" : "https://development.cloud.holi.social"
      OCIS_INTEGRATION_DB_HOST = local.environment_name == "production" ? data.terraform_remote_state.holi_infra_state.outputs.database_ip_address_production : data.terraform_remote_state.holi_infra_state.outputs.database_ip_address_development
      OCIS_INTEGRATION_DB_PORT = local.ocis_integration_database_port
      OCIS_INTEGRATION_DB_NAME = google_sql_database.ocis_integration.name
      INSTANCE_CONNECTION_NAME = local.environment_name == "production" ? data.terraform_remote_state.holi_infra_state.outputs.database_name_production : data.terraform_remote_state.holi_infra_state.outputs.database_name_development
    }
    secret_environment_variables {
      key        = "OCIS_ADMIN_USERNAME"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.ocis_admin_username.secret_id
      version    = "latest"
    }

    secret_environment_variables {
      key        = "OCIS_ADMIN_PASSWORD"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.ocis_admin_password.secret_id
      version    = "latest"
    }
    secret_environment_variables {
      key        = "OCIS_INTEGRATION_DB_PASSWORD"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret_version_access.ocis_integration_db_password.secret
      version    = "latest"
    }
    secret_environment_variables {
      key        = "OCIS_INTEGRATION_DB_USERNAME"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret_version_access.ocis_integration_db_username.secret
      version    = "latest"
    }
    vpc_connector                  = data.terraform_remote_state.holi_infra_state.outputs.vpc_access_connector_name
    vpc_connector_egress_settings  = "PRIVATE_RANGES_ONLY"
    ingress_settings               = "ALLOW_INTERNAL_ONLY"
    all_traffic_on_latest_revision = true
    service_account_email          = data.terraform_remote_state.holi_ocis_integration_common_state.outputs.function_service_account


    # taken from https://github.com/hashicorp/terraform-provider-google/issues/1938#issuecomment-1229042663
    #  lifecycle {
    #    replace_triggered_by = [
    #      google_storage_bucket_object.function_source
    #    ]
    #  }
  }
}
