#!/bin/bash

###########################################################
# A script to build all web resources for local development
###########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Get the build configuration
#
BUILD_CONFIGURATION="$1"
if [ "$BUILD_CONFIGURATION" != 'RELEASE' ]; then
  BUILD_CONFIGURATION='DEBUG'
fi

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
echo 'Building the web host ...'
./build.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the development web host'
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

  echo 'Building the local token handler ...'
  ./localtokenhandler/deployment/docker-local/build.sh
  if [ $? -ne 0 ]; then
    echo 'Problem encountered building local token handler resources'
    exit
  fi
fi


#
# Build the minimal shell application, which acts as a second micro-UI
#
cd shellapp
echo 'Building the shell application ...'
./build.sh "$BUILD_CONFIGURATION"
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the shell application'
  exit
fi
cd ..

#
# Build the demo application in watch mode, so that we can develop and see changes
#
echo 'Building the demo application ...'
cd demoapp
./build.sh "$BUILD_CONFIGURATION"
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the demo application'
  exit
fi
cd ..
