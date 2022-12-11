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
# Prepare root CA certificates that the Docker container will trust
#
cp certs/authsamples-dev.ca.pem deployment/shared/trusted.ca.pem

#
# Build the web host into a docker image
#
docker build -f ./deployment/shared/Dockerfile --build-arg TRUSTED_CA_CERTS='deployment/shared/trusted.ca.pem'  -t webhost:v1 .
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the Web Host docker container'
  exit 1
fi
