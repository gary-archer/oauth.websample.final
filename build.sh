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
# When connecting the SPA to a local API, run token handler components on the local development computer
#
if [ "$LOCALAPI" == 'true' ]; then

  rm -rf localtokenhandler 2>/dev/null
  git clone https://github.com/gary-archer/oauth-agent-node-express localtokenhandler
  if [ $? -ne 0 ]; then
    echo 'Problem encountered downloading local token handler resources'
    exit
  fi

  cd localtokenhandler
  git checkout feature/cookie_revamp
  cd ..

  echo 'Building local token handler components ...'
  ./localtokenhandler/deployment/docker-local/build.sh
  if [ $? -ne 0 ]; then
    echo 'Problem encountered building local token handler resources'
    exit
  fi
fi

#
# Build the development web host's code
#
echo 'Building the development web host ...'
./webhost/build.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the development web host'
  exit
fi

#
# Build the SPA code
#
echo 'Building the SPA ...'
./spa/build.sh 'DEBUG'
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  exit
fi

