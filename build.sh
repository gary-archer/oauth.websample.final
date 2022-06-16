#!/bin/bash

#######################################################
# A script to build the SPA resources ready for running
#######################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download SSL certificates if required
#
./downloadcerts.sh
if [ $? -ne 0 ]; then
  exit
fi

#
# Build the web host's code
#
cd webhost
./build.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the web host'
  exit
fi

#
# Build the SPA's code
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
