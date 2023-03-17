// this function conforms to the CloudEvent functions specification, see https://cloud.google.com/functions/docs/writing/write-event-driven-functions

const functions = require('@google-cloud/functions-framework');

// Register a CloudEvent function with the Functions Framework
functions.cloudEvent('receiveEvent', event => {
  const message = event.data.message
  switch (message.attributes.eventType) {
    case 'SpaceCreated':
      console.log('Received SpaceCreated event', atob(message.data))
      break
    default:
      console.log('Received unexpected event', event)
  }
});