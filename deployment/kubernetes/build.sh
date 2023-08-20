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
  echo '*** Web Host build problem encountered'
  exit 1
fi
cd ..

#
# Build the shell application, which I use as a simple post logout landing page
#
cd shell
./build.sh 'RELEASE'
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the shell application'
  exit 1
fi
cd ..

#
# Build the SPA
#
cd spa
./build.sh 'RELEASE'
if [ $? -ne 0 ]; then
  echo '*** SPA build problem encountered'
  exit 1
fi
cd ..

#
# Build the Docker image
#
docker build --no-cache -f deployment/shared/Dockerfile -t "$DOCKER_IMAGE" .
if [ $? -ne 0 ]; then
  echo '*** Web Host docker build problem encountered'
  exit 1
fi

#
# Load it into kind's Docker registry
#
kind load docker-image "$DOCKER_IMAGE" --name oauth
if [ $? -ne 0 ]; then
  echo '*** Web Host docker deploy problem encountered'
  exit 1
fi
