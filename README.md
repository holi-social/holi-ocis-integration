# holi-ocis-integration

This repository contains Google Cloud Functions implementation for the integration of OwnCloud Infinite Storage (OCIS) into holi. The cloud function

* can be found in `receiveEvent`
* and is triggered by events on Google Cloud Pub/Sub, emitted by Okuna on the `okuna_development` and `okuna_production` topics, respectively

## Links

* [Google Cloud Pub/Sub Topics](https://console.cloud.google.com/cloudpubsub/topic/list?project=holi-shared)
* [Google Cloud Functions](https://console.cloud.google.com/functions/list?env=gen2&project=holi-shared&tab=logs)

## Local Execution

Within `receiveEvent` directory, run:

- `npm start` to run the cloud function locally.
- `tests/space_created.sh` to send an example `SpaceCreated` event to the cloud function as if it was sent by Google Cloud Pub/Sub.
