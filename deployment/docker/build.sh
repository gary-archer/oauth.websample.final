#!/bin/bash

##########################################################################
# A script to build the deployed web server for local computer deployments
##########################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Install the web host dependencies
#
npm install
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing webhost dependencies'
  exit 1
fi

#
# Build the web host code
#
rm -rf dist 2>/dev/null
npx tsc
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the webhost code'
  exit 1
fi

#
# Build the React SPA's code in release mode
#
../../build.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  exit
fi

#
# Build files into a docker image
#
cd ../..
docker build --no-cache -f deployment/docker/Dockerfile -t webhost:latest .
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the Web Host docker container'
  exit 1
fi
