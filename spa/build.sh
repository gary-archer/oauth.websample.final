#!/bin/bash

##########################################################################
# Install and build the main SPA ready for deploying
# On Windows, ensure that you have first set Git bash as the node.js shell
# npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
##########################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
BUILD_CONFIGURATION="$1"

#
# Install dependencies
#
if [ ! -d 'node_modules' ]; then
  
  npm install
  if [ $? -ne 0 ]; then
    echo 'Problem encountered installing SPA dependencies'
    exit 1
  fi
fi

#
# Clean the output folder
#
rm -rf ./dist 2>/dev/null
mkdir ./dist

#
# Check code quality
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'SPA code quality checks failed'
  exit 1
fi

#
# Copy HTML assets to the output folder
#
cp index.html app.css spa.config.json ./dist
if [ "$BUILD_CONFIGURATION" == 'RELEASE' ]; then

  # Do the release build
  npm run webpackRelease
  if [ $? -ne 0 ]; then
    echo 'Problem encountered building the SPA'
    exit 1
  fi

  # In release builds, produce minimized CSS
  npm run purgecss
  if [ $? -ne 0 ]; then
    echo 'Problem encountered reducing CSS for the SPA'
    exit 1
  fi

  ## Rewrite the index.html with script integrity timestamps before deploying to a CDN
  node --loader ts-node/esm --no-warnings ./build/rewriteIndexHtml.ts
  if [ $? -ne 0 ]; then
    echo 'Problem encountered rewriting the shell index.html file'
    exit 1
  fi
else

  # In debug builds copy the full CSS to the dist folder
  cp bootstrap.min.css ./dist

  # Do a webpack build in watch mode, and develop with a pure SPA development model
  npm run webpackDebug
  if [ $? -ne 0 ]; then
    echo 'Problem encountered building the SPA'
    exit 1
  fi
fi
