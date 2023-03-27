BASEDIR=$(dirname $0)

source $BASEDIR/helpers.sh

MESSAGE=$(create_message "SpaceCreated" "1.0.0" "$BASEDIR/space_created.json")
send_message $MESSAGE
