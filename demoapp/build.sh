#!/bin/bash

#########################################################
# Install and build the main demo app ready for deploying
#########################################################

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
  echo 'Demo app code quality checks failed'
  exit 1
fi

#
# Clean the output folder
#
rm -rf ./dist 2>/dev/null
mkdir ./dist

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

#
# Reduce the CSS size
#
npm run purgecss
if [ $? -ne 0 ]; then
  echo 'Problem encountered reducing CSS for the demo app'
  exit 1
fi

#
# Copy HTML assets to the output folder
#
cp demoapp.config.json index.html app.css ./dist
