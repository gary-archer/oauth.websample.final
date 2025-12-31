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
# Start the SPA
# On Linux ensure that you have first granted Node.js permissions to listen on port 443:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
NODE_OPTIONS='--import tsx' npx webpack serve -config build/webpack.config.dev.ts
if [ $? -ne 0 ]; then
  echo 'Problem encountered serving SPA static content'
  read -n 1
  exit 1
fi
