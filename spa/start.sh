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
# Prepare the output folder
#
rm -rf ../dist 2>/dev/null
mkdir ../dist

#
# Run a debug build of the SPA, serve its static content and open the browser
# On Linux ensure that you have first granted Node.js permissions to listen on port 443:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
npm start
if [ $? -ne 0 ]; then
  echo 'Problem encountered serving SPA static content'
  read -n 1
  exit 1
fi

#
# Show a message if the static content server is already running
#
read -n 1
