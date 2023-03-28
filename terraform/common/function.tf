# see https://cloud.google.com/functions/docs/tutorials/terraform-pubsub

resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_service_account" "account" {
  project      = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  account_id   = "holi-ocis-integration-sa"
  display_name = "holi-ocis-integration Service Account"
}
resource "google_project_iam_member" "secretmanager_accessor" {
  for_each = toset([
    "serviceAccount:service-984061681268@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:984061681268@cloudbuild.gserviceaccount.com",
    "serviceAccount:holi-ocis-integration-sa@holi-shared.iam.gserviceaccount.com",
  ])
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = each.key
  role    = "roles/secretmanager.secretAccessor"
}

resource "google_storage_bucket" "bucket" {
  project                     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name                        = "${random_id.bucket_prefix.hex}-gcf-source"
  location                    = "europe-north1"
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "object" {
  name   = "receiveEvent.zip"
  bucket = google_storage_bucket.bucket.name
  source = "../../receiveEvent.zip"
}

data "google_secret_manager_secret" "ocis_admin_username_development" {
  secret_id = "OCIS_ADMIN_USERNAME_DEVELOPMENT"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret" "ocis_admin_password_development" {
  secret_id = "OCIS_ADMIN_PASSWORD_DEVELOPMENT"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret" "ocis_admin_username_production" {
  secret_id = "OCIS_ADMIN_USERNAME_PRODUCTION"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

data "google_secret_manager_secret" "ocis_admin_password_production" {
  secret_id = "OCIS_ADMIN_PASSWORD_PRODUCTION"
  project   = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
}

resource "google_cloudfunctions2_function" "holi-ocis-integration-staging" {
  project     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name        = "holi-ocis-integration-staging"
  location    = "europe-north1"
  description = "holi-ocis-integration-staging function"

  build_config {
    runtime     = "nodejs18"
    entry_point = "receiveEvent"

    source {
      storage_source {
        bucket = google_storage_bucket.bucket.name
        object = google_storage_bucket_object.object.name
      }
    }
  }

  service_config {
    max_instance_count = 1
    min_instance_count = 0
    available_memory   = "128Mi"
    timeout_seconds    = 60
    environment_variables = {
      ENVIRONMENT       = "development"
      OCIS_OIDC_ISSUER  = "https://dev-auth.project-holi.org"
      OWNCLOUD_BASE_URL = "https://development.cloud.project-holi.org"
    }

    ingress_settings               = "ALLOW_INTERNAL_ONLY"
    all_traffic_on_latest_revision = true
    service_account_email          = google_service_account.account.email

    secret_environment_variables {
      key        = "OCIS_ADMIN_USERNAME"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.ocis_admin_username_development.secret_id
      version    = "latest"
    }

    secret_environment_variables {
      key        = "OCIS_ADMIN_PASSWORD"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.ocis_admin_password_development.secret_id
      version    = "latest"
    }
  }

  event_trigger {
    trigger_region = "europe-north1"
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = "projects/holi-shared/topics/okuna_development"
    retry_policy   = "RETRY_POLICY_RETRY"
  }

  # taken from https://github.com/hashicorp/terraform-provider-google/issues/1938#issuecomment-1229042663
  lifecycle {
    replace_triggered_by = [
      google_storage_bucket_object.object
    ]
  }
}

resource "google_cloudfunctions2_function" "holi-ocis-integration-production" {
  project     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name        = "holi-ocis-integration-production"
  location    = "europe-north1"
  description = "holi-ocis-integration-production function"

  build_config {
    runtime     = "nodejs18"
    entry_point = "receiveEvent"

    source {
      storage_source {
        bucket = google_storage_bucket.bucket.name
        object = google_storage_bucket_object.object.name
      }
    }
  }

  service_config {
    max_instance_count = 3
    min_instance_count = 0
    available_memory   = "256Mi"
    timeout_seconds    = 60
    environment_variables = {
      ENVIRONMENT       = "production"
      OCIS_OIDC_ISSUER  = "https://auth.project-holi.org"
      OWNCLOUD_BASE_URL = "https://production.cloud.project-holi.org/"
    }
    ingress_settings               = "ALLOW_INTERNAL_ONLY"
    all_traffic_on_latest_revision = true
    service_account_email          = google_service_account.account.email

    secret_environment_variables {
      key        = "OCIS_ADMIN_USERNAME"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.ocis_admin_username_production.secret_id
      version    = "latest"
    }

    secret_environment_variables {
      key        = "OCIS_ADMIN_PASSWORD"
      project_id = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
      secret     = data.google_secret_manager_secret.ocis_admin_password_production.secret_id
      version    = "latest"
    }
  }

  event_trigger {
    trigger_region = "europe-north1"
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = "projects/holi-shared/topics/okuna_production"
    retry_policy   = "RETRY_POLICY_RETRY"
  }

  # taken from https://github.com/hashicorp/terraform-provider-google/issues/1938#issuecomment-1229042663
  lifecycle {
    replace_triggered_by = [
      google_storage_bucket_object.object
    ]
  }
}


