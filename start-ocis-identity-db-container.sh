#!/bin/bash

# This script checks if the docker container ocis-identity-db exists.
# If it is running do nothing, if it's stopped start it, otherwise create a new container with the same name.
IMAGE_NAME=holi-ocis-integration/postgres
CONTAINER_NAME=ocis-identity-db

if docker ps -a --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
  if docker ps -a --filter "name=$CONTAINER_NAME" --filter "status=running" --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "Container $CONTAINER_NAME is already running."
  else
    echo "Starting container $CONTAINER_NAME..."
    docker start $CONTAINER_NAME
  fi
else
  echo "Creating new container $CONTAINER_NAME..."
  docker build -t $CONTAINER_NAME . && docker run -p 8087:5432 --name $CONTAINER_NAME -d $CONTAINER_NAME
fi
