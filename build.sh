#!/bin/bash

###################################
# Build the SPA in development mode
###################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Build the SPA
#
./spa/build.sh
if [ $? -ne 0 ]; then
  exit
fi

#
# When connecting the SPA to a local API, build token handler components into a Docker image
#
if [ "$LOCALAPI" == 'true' ]; then

  rm -rf localtokenhandler 2>/dev/null
  git clone https://github.com/gary-archer/oauth.tokenhandler.cloudnative localtokenhandler
  if [ $? -ne 0 ]; then
    echo ' Problem encountered downloading local token handler resources'
    exit 1
  fi

  echo 'Building local token handler components ...'
  ./localtokenhandler/docker/build.sh
  if [ $? -ne 0 ]; then
    exit 1
  fi
fi
