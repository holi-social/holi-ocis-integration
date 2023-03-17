BASEDIR=$(dirname $0)

create_message () {
    local event_type=$1
    local event_version=$2
    local event_path=$3
    local data=$(cat $event_path | base64)
    local message=$(
        cat $BASEDIR/message_template.json | \
        jq '.message.data = $data' --arg data "$data" | \
        jq '.message.attributes.eventType = $eventType' --arg eventType "$event_type" | \
        jq '.message.attributes.eventVersion = $eventVersion' --arg eventVersion "$event_version"
    )
    echo $message
}

send_message () {
    echo $MESSAGE | curl localhost:8080 \
        -X POST \
        -H "Content-Type: application/json" \
        -H "ce-id: 123451234512345" \
        -H "ce-specversion: 1.0" \
        -H "ce-time: 2020-01-02T12:34:56.789Z" \
        -H "ce-type: google.cloud.pubsub.topic.v1.messagePublished" \
        -H "ce-source: //pubsub.googleapis.com/projects/MY-PROJECT/topics/MY-TOPIC" \
        -d @-
}
