# see https://cloud.google.com/functions/docs/tutorials/terraform-pubsub

resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_service_account" "account" {
  project      = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  account_id   = "holi-ocis-integration-sa"
  display_name = "holi-ocis-integration Service Account"
}

resource "google_project_iam_binding" "iam_binding_gcf" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  members = [
    "serviceAccount:service-984061681268@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:984061681268@cloudbuild.gserviceaccount.com"
  ]
  role    = "roles/storage.objectViewer"
}

resource "google_storage_bucket" "bucket" {
  project                     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name                        = "${random_id.bucket_prefix.hex}-gcf-source"
  location                    = "europe-north1"
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "object" {
  name    = "receiveEvent.zip"
  bucket  = google_storage_bucket.bucket.name
  source  = "../../receiveEvent.zip"
}

resource "google_cloudfunctions2_function" "holi-ocis-integration" {
  project     = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name        = "holi-ocis-integration"
  location    = "europe-north1"
  description = "holi-ocis-integration function"

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
    min_instance_count = 1
    available_memory   = "128Mi"
    timeout_seconds    = 60
    
    ingress_settings               = "ALLOW_INTERNAL_ONLY"
    all_traffic_on_latest_revision = true
    service_account_email          = google_service_account.account.email
  }

  event_trigger {
    trigger_region = "europe-north1"
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = "projects/holi-shared/topics/okuna_development"
    retry_policy   = "RETRY_POLICY_RETRY"
  }
}

# TODO function for production deployment