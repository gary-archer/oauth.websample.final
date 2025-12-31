#!/bin/bash

#################################
# Build the SPA before running it
#################################

cd "$(dirname "${BASH_SOURCE[0]}")"

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
# Prepare the dist folder
#
cd ..
rm -rf dist 2>/dev/null
mkdir dist
mkdir dist/spa

#
# Use the correct configuration file
#
if [ "$LOCALAPI" == 'true' ]; then
  cp ./deployment/environments/dev-localapi/spa.config.json dist/spa/spa.config.json

else 
  cp ./deployment/environments/dev/spa.config.json dist/spa/spa.config.json
fi

#
# Build and run the SPA
# On Linux ensure that you have first granted Node.js permissions to listen on port 443:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
cd spa
NODE_OPTIONS='--import tsx' npx webpack serve --config webpack/webpack.config.dev.ts
if [ $? -ne 0 ]; then
  echo 'Problem encountered serving SPA static content'
  read -n 1
  exit 1
fi
