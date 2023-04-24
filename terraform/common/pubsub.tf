resource "google_project_iam_member" "pubsub_subscriber" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = "serviceAccount:holi-ocis-integration-sa@holi-shared.iam.gserviceaccount.com"
  role    = "roles/pubsub.subscriber"
}

resource "google_project_iam_member" "pubsub_publisher" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = "serviceAccount:holi-ocis-integration-sa@holi-shared.iam.gserviceaccount.com"
  role    = "roles/pubsub.publisher"
}
resource "google_pubsub_topic" "okuna_staging_dead_letter" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name    = "okuna_staging_dead_letter"
  message_storage_policy {
    allowed_persistence_regions = ["europe-north1"]
  }
}

# resource "google_pubsub_topic" "okuna_production_dead_letter" {
#   project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
#   name    = "okuna_production_dead_letter"
#   message_storage_policy {
#     allowed_persistence_regions = ["europe-north1"]
#   }
# }

resource "google_pubsub_subscription" "holi-ocis-integration-okuna-staging-sub" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name    = "holi-ocis-integration-okuna-staging-sub"
  topic   = data.terraform_remote_state.okuna-common_state.outputs.google_pubsub_topic_okuna_staging

  ack_deadline_seconds = 10 * 60 # 10 minutes, max. value
  expiration_policy {
    ttl = "" # never expire
  }

  push_config {
    push_endpoint = google_cloudfunctions2_function.holi-ocis-integration-staging.service_config[0].uri

    oidc_token {
      service_account_email = google_service_account.account.email
    }
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.okuna_staging_dead_letter.id
    max_delivery_attempts = 5
  }
}

resource "google_pubsub_subscription" "holi-ocis-integration-okuna-production-sub" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name    = "holi-ocis-integration-okuna-production-sub"
  topic   = data.terraform_remote_state.okuna-common_state.outputs.google_pubsub_topic_okuna_production

  ack_deadline_seconds = 10 * 60 # 10 minutes, max. value
  expiration_policy {
    ttl = "" # never expire
  }

  push_config {
    push_endpoint = google_cloudfunctions2_function.holi-ocis-integration-production.service_config[0].uri

    oidc_token {
      service_account_email = google_service_account.account.email
    }
  }

  # dead_letter_policy {
  #   dead_letter_topic     = google_pubsub_topic.okuna_production_dead_letter.id
  #   max_delivery_attempts = 10
  # }
}

resource "google_pubsub_subscription" "holi-ocis-integration-okuna-staging-dead-letter-sub" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name    = "holi-ocis-integration-okuna-staging-dead-letter-sub"
  topic   = google_pubsub_topic.okuna_staging_dead_letter.id

  expiration_policy {
    ttl = "" # permanent subscription
  }
}

# resource "google_pubsub_subscription" "holi-ocis-integration-okuna-production-dead-letter-sub" {
#   project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
#   name    = "holi-ocis-integration-okuna-production-dead-letter-sub"
#   topic   = google_pubsub_topic.okuna_production_dead_letter.id

#   expiration_policy {
#     ttl = "" # permanent subscription
#   }
# }
