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
# Build the shell application, which I use as a simple post logout landing page
#
cd shell
./build.sh 'RELEASE'
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the shell application'
  exit
fi
cd ..

#
# Build the React SPA's Javascript bundles
#
cd spa
./build.sh 'RELEASE'
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  exit
fi
cd ..

#
# Build the web host into a docker image
#
docker build -f ./deployment/shared/Dockerfile -t webhost:latest .
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the Web Host docker container'
  exit 1
fi
