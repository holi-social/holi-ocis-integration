resource "google_project_iam_member" "pubsub_subscriber" {
  for_each = toset([
    "serviceAccount:service-984061681268@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:984061681268@cloudbuild.gserviceaccount.com",
    "serviceAccount:holi-ocis-integration-sa@holi-shared.iam.gserviceaccount.com",
  ])
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = each.key
  role    = "roles/pubsub.subscriber"
}

resource "google_project_iam_member" "pubsub_publisher" {
  for_each = toset([
    "serviceAccount:service-984061681268@gcf-admin-robot.iam.gserviceaccount.com",
    "serviceAccount:984061681268@cloudbuild.gserviceaccount.com",
    "serviceAccount:holi-ocis-integration-sa@holi-shared.iam.gserviceaccount.com",
  ])
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  member  = each.key
  role    = "roles/pubsub.publisher"
}

