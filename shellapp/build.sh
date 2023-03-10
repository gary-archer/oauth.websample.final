#!/bin/bash

#################################################################
# A script to build the shell app resources under the dist folder
#################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
BUILD_CONFIGURATION="$1"

#
# Install dependencies
#
if [ ! -d 'node_modules' ]; then
  
  npm install
  if [ $? -ne 0 ]; then
    echo 'Problem encountered installing shell dependencies'
    exit 1
  fi
fi

#
# Clean the output folder
#
rm -rf ./dist 2>/dev/null
mkdir ./dist

#
# Copy HTML assets to the output folder
#
cp index.html favicon.ico *.css ./dist

#
# Now do the main webpack build
#
if [ "$BUILD_CONFIGURATION" == 'RELEASE' ]; then
  npm run webpackRelease
else
  npm run webpackDebug
fi
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the shell app'
  exit 1
fi
