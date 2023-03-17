set -x

BASEDIR=$(dirname $0)

EVENT_TYPE="SpaceCreated"
EVENT_VERSION="1.0.0"

DATA=$(cat $BASEDIR/space_created.json | base64)
MESSAGE=$(
  cat $BASEDIR/message_template.json | \
  jq '.message.data = $data' --arg data "$DATA" | \
  jq '.message.attributes.eventType = "SpaceCreated"' | \
  jq '.message.attributes.eventVersion = "1.0.0"'
)

echo $MESSAGE | curl localhost:8080 \
  -X POST \
  -H "Content-Type: application/json" \
  -H "ce-id: 123451234512345" \
  -H "ce-specversion: 1.0" \
  -H "ce-time: 2020-01-02T12:34:56.789Z" \
  -H "ce-type: google.cloud.pubsub.topic.v1.messagePublished" \
  -H "ce-source: //pubsub.googleapis.com/projects/MY-PROJECT/topics/MY-TOPIC" \
  -d @-