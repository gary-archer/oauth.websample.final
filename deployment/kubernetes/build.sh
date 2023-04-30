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
# Build the web host's Javascript code
#
cd webhost
./build.sh
if [ $? -ne 0 ]; then
  echo '*** Web Host build problem encountered'
  exit 1
fi
cd ..

#
# Build the shell app, which handles the redirect URI and logged out page
#
cd spa/shellapp
./build.sh 'RELEASE'
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the shell application'
  exit 1
fi
cd ..

#
# Build the SPA
#
cd demoapp
./build.sh 'RELEASE'
if [ $? -ne 0 ]; then
  echo '*** SPA build problem encountered'
  exit 1
fi
cd ../..

#
# Build the Docker image
#
docker build --no-cache -f deployment/shared/Dockerfile -t webhost:latest .
if [ $? -ne 0 ]; then
  echo '*** Web Host docker build problem encountered'
  exit 1
fi

#
# Load it into kind's Docker registry
#
kind load docker-image webhost:latest --name oauth
if [ $? -ne 0 ]; then
  echo '*** Web Host docker deploy problem encountered'
  exit 1
fi
