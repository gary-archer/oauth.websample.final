#!/bin/bash

#####################################################################################
# A script to test local Docker deployment of web resources on a development computer
# This is only for local setups where a Content Delivery Network cannot be used
#####################################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Download certificates if required
#
./downloadcerts.sh
if [ $? -ne 0 ]; then
  exit
fi

#
# Build the web host's Javascript code
#
cd webhost
./build.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the web host'
  exit
fi
cd ..

#
# Build the SPA release Javascript bundles
#
cd spa
./build.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  exit
fi
cd ..

#
# Build the web host into a docker image
#
docker build -f ./webhost/docker/Dockerfile -t webhost:v1 .
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the Web Host docker container'
  exit 1
fi

#
# Run the docker deployment
#
docker compose --file ./webhost/docker/docker-compose.yml --project-name webhost up --force-recreate --detach
if [ $? -ne 0 ]; then
  echo 'Problem encountered running web host Docker image'
  exit 1
fi

#
# Wait for it to become available
#
echo 'Waiting for web content to become available ...'
INDEX_HTML_URL='https://web.authsamples-dev.com/spa/index.html'
while [ "$(curl -k -s -o /dev/null -w ''%{http_code}'' "$INDEX_HTML_URL")" != '200' ]; do
  sleep 2
done