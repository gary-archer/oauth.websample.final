#!/bin/bash

##############################################################################
# A script to deploy token handler resources to a local Docker compose network
##############################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download the OAuth Agent API
#
rm -rf oauth-agent
git clone https://github.com/gary-archer/oauth.tokenhandler.docker oauth-agent
if [ $? -ne 0 ]; then
  echo 'Problem encountered downloading the OAuth Agent'
  exit 1
fi
cd oauth-agent

#
# Build its code
#
rm -rf node_modules
npm install
if [ $? -ne 0 ]; then
  echo "Problem encountered installing OAuth Agent dependencies"
  exit 1
fi

npm run buildRelease
if [ $? -ne 0 ]; then
  echo "Problem encountered building OAuth Agent code"
  exit 1
fi

#
# Prepare root CA certificates that the OAuth Agent will trust
#
cp ../../certs/authsamples-dev.ca.pem ./trusted.ca.pem

#
# Build the OAuth Agent docker image
#
docker build -f ./docker/Dockerfile --build-arg TRUSTED_CA_CERTS='./trusted.ca.pem' -t oauthagent:v1 .
if [ $? -ne 0 ]; then
  echo "Problem encountered building the OAuth Agent docker container"
  exit 1
fi
cd ..

#
# Build the custom Docker image for the Reverse Proxy and its OAuth Proxy plugin
#
docker build -f ./reverseproxy/Dockerfile -t custom_kong:2.8.1-alpine .
if [ $? -ne 0 ]; then
  echo "Problem encountered building the Reverse Proxy docker container"
  exit 1
fi
