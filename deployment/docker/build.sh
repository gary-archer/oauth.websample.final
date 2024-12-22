#!/bin/bash

#####################################################################################
# A script to test local Docker deployment of web resources on a development computer
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
# Build the React SPA's code in release mode
#
./spa/buildRelease.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  exit
fi

#
# Build the web host's Javascript code
#
./deployment/docker/webhost/buildRelease.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the web host'
  exit
fi


#
# Build files into a docker image
#
docker build -t webhost:latest .
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the Web Host docker container'
  exit 1
fi
