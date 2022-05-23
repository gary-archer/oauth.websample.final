#!/bin/bash

#######################################################
# A script to build the SPA resources ready for running
#######################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download SSL certificates if required and move the ones of interest to a certs folder
#
if [ ! -d 'certs' ]; then
  
  git clone https://github.com/gary-archer/oauth.developmentcertificates ./resources
  if [ $? -ne 0 ]; then
    echo 'Problem encountered downloading development certificates'
    exit 1
  fi

  rm -rf certs
  mv ./resources/authsamples-dev ./certs
  rm -rf ./resources
fi    

if [ "$1" == 'LOCALAPI' ]; then

  # Point the SPA to the local token handler by using this configuration file
  cp spa/config/config.localtokenhandler.json spa/spa.config.json
else

  # By default we instead point the SPA to the remote token handler, so that only the SPA needs to be run locally
  cp spa/config/config.remotetokenhandler.json spa/spa.config.json
fi

#
# Build the web host
#
cd webhost
./build.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the web host'
  exit
fi

#
# Build the SPA
#
cd ../spa
./build.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  exit
fi
cd ..

#
# When connecting the SPA to a local API, build a token handler to run on the local development computer
#
if [ "$1" == 'LOCALAPI' ]; then
    
  ./localtokenhandler/build.sh
  if [ $? -ne 0 ]; then
    echo 'Problem encountered building local token handler resources'
    exit
  fi
fi