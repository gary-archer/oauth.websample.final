#!/bin/bash

###############################################
# Install and build the SPA ready for deploying
###############################################

cd "$(dirname "${BASH_SOURCE[0]}")"
BUILD_CONFIGURATION="$1"

#
# Install dependencies
#
if [ ! -d 'node_modules' ]; then
  
  npm install
  if [ $? -ne 0 ]; then
    echo 'Problem encountered installing demo app dependencies'
    exit 1
  fi
fi

#
# Check code quality
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Code quality checks failed'
  exit 1
fi

#
# Clean the output folder
#
rm -rf ./dist 2>/dev/null
mkdir ./dist

#
# Copy HTML assets to the output folder
#
cp spa.config.json index.html *.css ./dist

#
# Now do the main webpack build
#
if [ "$BUILD_CONFIGURATION" == 'RELEASE' ]; then
  npm run webpackRelease
else
  npm run webpackDebug
fi
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the demo app'
  exit 1
fi