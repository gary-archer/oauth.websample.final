#!/bin/bash

##############################################################
# A script to build the shell app resources to the dist folder
##############################################################

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
# Clean the output folder and copy the Javascript
#
rm -rf ./dist 2>/dev/null
mkdir ./dist
cp ./src/index.mjs ./dist

#
# Reduce the CSS size
#
npm run purgecss
if [ $? -ne 0 ]; then
  echo 'Problem encountered reducing CSS for the shell app'
  exit 1
fi

#
# Copy HTML assets to the output folder
#
cp index.html app.css favicon.ico ./dist

#
# Finally, rewrite the index.html in release builds
#
if [ "$BUILD_CONFIGURATION" == 'RELEASE' ]; then

  node ./build/rewriteIndexHtml.mjs
  if [ $? -ne 0 ]; then
    echo 'Problem encountered rewriting the shell app index.html'
    exit 1
  fi
fi