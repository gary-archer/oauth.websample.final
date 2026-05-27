#!/bin/bash

#################################
# Run the SPA in development mode
#################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Create SSL certificates if required
#
./certs/create.sh
if [ $? -ne 0 ]; then
  exit 1
fi

#
# When connecting the SPA to a local API, run token handler components in Docker
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

  ./localtokenhandler/docker/deploy.sh
  if [ $? -ne 0 ]; then
    exit 1
  fi
fi

#
# Install dependencies
#
npm install
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing SPA dependencies'
  read -n 1
  exit 1
fi

#
# Check code quality
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'SPA code quality checks failed'
  read -n 1
  exit 1
fi

#
# Make sure certificates are trusted during live reload requests from rollup
#
if [ "$NODE_EXTRA_CA_CERTS" == '' ]; then
  export NODE_EXTRA_CA_CERTS='./certs/authsamples-dev.ca.crt'
fi

# Build the SPA using a bundler and run a development web server
# On Linux ensure that you have first granted Node.js permissions to listen on port 443:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
npm start
if [ $? -ne 0 ]; then
  echo 'Problem encountered serving SPA static content'
  read -n 1
  exit 1
fi
