#!/bin/bash

####################################################################################
# A script to deploy local token handler resources to a local Docker compose network
####################################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download the OAuth Agent API and copy in required files
#
rm -rf oauth-agent
git clone https://github.com/gary-archer/oauth.tokenhandler.docker oauth-agent
if [ $? -ne 0 ]; then
  echo 'Problem encountered downloading the OAuth Agent'
  exit 1
fi
cp oauth-agent.config.json oauth-agent/api.config.json
cp ../certs/authsamples-dev.ca.pem oauth-agent/trusted.ca.pem
cd oauth-agent

#
# Build the OAuth Agent into a Docker container
#
rm -rf node_modules
npm install
if [ $? -ne 0 ]; then
  echo "Problem encountered installing the Token Handler API dependencies"
  exit 1
fi

npm run buildRelease
if [ $? -ne 0 ]; then
  echo "Problem encountered building the Token Handler API code"
  exit 1
fi

docker build -f ./Dockerfile -t oauthagent:v1 .
if [ $? -ne 0 ]; then
  echo "Problem encountered building the OAuth Agent Docker container"
  exit 1
fi
cd ..

#
# Build the custom Docker image for the reverse proxy and OAuth plugin
#
docker build -f ./Kong-Dockerfile -t custom_kong:2.8.1-alpine .
if [ $? -ne 0 ]; then
  echo "Problem encountered building the Reverse Proxy Docker container"
  exit 1
fi