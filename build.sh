#!/bin/bash

#######################################################
# A script to build the SPA resources ready for running
#######################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

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
# Run ./build.sh LOCALAPI to route to one of my blog's final APIs running locally, via a local token handler
#
if [ "$1" == 'LOCALAPI' ]; then
    
  rm -rf resources
  git clone https://github.com/gary-archer/oauth.localtokenhandler.deployment ./resources
  cd resources
  ./build.sh
  if [ $? -ne 0 ]; then
    echo 'Problem encountered building local token handler resources'
    exit
  fi
fi