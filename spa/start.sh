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
# Copy non JavaScript files to the dist folder
#
rm -rf dist 2>/dev/null
mkdir dist
mkdir dist/spa
cp ../favicon.ico   dist/
cp index.html *.css dist/spa/

#
# Ensure that the SPA uses the correct backend for frontend URL
#
if [ "$LOCALAPI" == 'true' ]; then
  cp ../deployment/environments/dev-localapi/spa.config.json dist/spa/spa.config.json

else 
  cp ../deployment/environments/dev/spa.config.json dist/spa/spa.config.json
fi

#
# Start listening in watch mode
#
npx vite
if [ $? -ne 0 ]; then
  echo 'Problem encountered serving SPA static content'
  read -n 1
  exit 1
fi
