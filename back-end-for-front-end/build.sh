#!/bin/bash

#####################################################
# Get and build the Curity Back End for Front End API
#####################################################

#
# Download SSL certificates
#
rm -rf .certs
git clone https://github.com/gary-archer/oauth.developmentcertificates ./.certs
if [ $? -ne 0 ]; then
    echo 'Problem encountered downloading webhost certificates'
    exit 1
fi

#
# Get the API gateway plugin
#
rm -rf kong-bff-plugin
git clone https://github.com/curityio/kong-bff-plugin
if [ $? -ne 0 ]; then
  echo "Problem encountered downloading the BFF plugin"
  exit 1
fi

#
# Get the BFF API code
#
rm -rf bff-node-express
git clone https://github.com/curityio/bff-node-express
if [ $? -ne 0 ]; then
  echo "Problem encountered downloading the BFF API"
  exit 1
fi

#
# Install dependencies
#
cd bff-node-express
npm install
if [ $? -ne 0 ]; then
  echo "Problem encountered installing the BFF API dependencies"
  exit 1
fi

#
# Build the NodeJS code
#
npm run build
if [ $? -ne 0 ]; then
  echo "Problem encountered building the BFF API code"
  exit 1
fi

#
# Package the BFF API into a Docker container
#
docker build -f Dockerfile -t curity-bff-api:1.0.0 .
if [ $? -ne 0 ]; then
  echo "Problem encountered building the BFF API Docker file"
  exit 1
fi

