#!/bin/bash

#######################################################################
# Build the Web Host's code into a Docker image when using KIND locally
#######################################################################

#
# Ensure that we are in the root folder
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Use a timestamp based docker image tag
#
TAG=$(date +%Y%m%d%H%M%S)
echo $TAG > ./dockertag.txt
DOCKER_IMAGE="webhost:$TAG"

#
# Build the web host's Javascript code
#
cd ../..
cd webhost
./build.sh
if [ $? -ne 0 ]; then
  echo 'Web host build problem encountered'
  exit 1
fi
cd ..

#
# Build the SPA
#
cd spa
export BUILD_CONFIGURATION='RELEASE'
./build.sh
if [ $? -ne 0 ]; then
  echo 'SPA build problem encountered'
  exit 1
fi
cd ..

#
# Build the Docker image
#
docker build --no-cache -f deployment/shared/Dockerfile -t "$DOCKER_IMAGE" .
if [ $? -ne 0 ]; then
  echo 'Web host docker build problem encountered'
  exit 1
fi

#
# Load it into kind's Docker registry
#
kind load docker-image "$DOCKER_IMAGE" --name oauth
if [ $? -ne 0 ]; then
  echo 'Web host docker deploy problem encountered'
  exit 1
fi
