resource "google_pubsub_subscription" "okuna" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name    = "holi-ocis-integration-okuna-${local.environment_name}-sub"
  topic   = local.environment_name == "production" ? data.terraform_remote_state.okuna_common_state.outputs.google_pubsub_topic_okuna_production : data.terraform_remote_state.okuna_common_state.outputs.google_pubsub_topic_okuna_staging

  ack_deadline_seconds = 10 * 60 # 10 minutes, max. value
  expiration_policy {
    ttl = "" # never expire
  }

  push_config {
    push_endpoint = google_cloudfunctions2_function.holi_ocis_integration.service_config[0].uri

    oidc_token {
      service_account_email = data.terraform_remote_state.holi_ocis_integration_common_state.outputs.function_service_account
    }
  }
}
