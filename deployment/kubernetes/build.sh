#!/bin/bash

#######################################################################
# Build the Web Host's code into a Docker image when using KIND locally
#######################################################################

#
# Ensure that we are in the root folder
#
cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Build Javascript bundles
#
cd demoapp
npm install
npm run buildRelease
if [ $? -ne 0 ]; then
  echo '*** SPA build problem encountered'
  exit 1
fi
cd ..

#
# Build the web host
#
cd webhost
npm install
npm run buildRelease
if [ $? -ne 0 ]; then
  echo '*** Web Host build problem encountered'
  exit 1
fi
cd ..

#
# Copy in the internal cluster root CA from the parent project, to be trusted within the container
#
cp ../certs/cluster.internal.ca.pem deployment/shared/trusted.ca.pem

#
# Build the Docker image
#
docker build --no-cache -f deployment/shared/Dockerfile -t webhost:v1 .
if [ $? -ne 0 ]; then
  echo '*** Web Host docker build problem encountered'
  exit 1
fi

#
# Load it into kind's Docker registry
#
kind load docker-image webhost:v1 --name oauth
if [ $? -ne 0 ]; then
  echo '*** Web Host docker deploy problem encountered'
  exit 1
fi
