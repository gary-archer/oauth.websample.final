#!/bin/bash

###########################################################
# A script to build all web resources for local development
###########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download development SSL certificates
#
./downloadcerts.sh
if [ $? -ne 0 ]; then
  exit
fi

#
# Build the development web host's code
#
cd webhost
./build.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the development web host'
  exit
fi
cd ..

#
# Build the shell app, which handles the redirect URI and logged out page
#
cd shellapp
./build.sh 'DEBUG'
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the shell application'
  exit
fi
cd ..

#
# Build the React SPA's Javascript bundles
#
cd demoapp
./build.sh 'DEBUG'
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the demo application'
  exit
fi
cd ..

#
# When connecting the SPA to a local API, build a token handler to run on the local development computer
#
if [ "$1" == 'LOCALAPI' ]; then

  rm -rf localtokenhandler 2>/dev/null
  git clone https://github.com/gary-archer/oauth.tokenhandler.docker localtokenhandler
  if [ $? -ne 0 ]; then
    echo 'Problem encountered downloading local token handler resources'
    exit
  fi

  ./localtokenhandler/deployment/docker-local/build.sh
  if [ $? -ne 0 ]; then
    echo 'Problem encountered building local token handler resources'
    exit
  fi
fi
