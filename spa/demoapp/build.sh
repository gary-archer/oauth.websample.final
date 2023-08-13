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
# Clean the output folder
#
rm -rf ./dist 2>/dev/null
mkdir ./dist

#
# Copy in shared code
#
rm -rf ./build 2>/dev/null
cp -R ../shared/build ./build
rm -rf ./src/plumbing/errors/lib 2>/dev/null
cp -R ../shared/errorlogic ./src/plumbing/errors/lib

#
# Check code quality
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Demo app code quality checks failed'
  exit 1
fi

#
# Build JavaScript bundles
# On Windows, ensure that you have first set Git bash as the node.js shell
# npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
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

#
# Finally, rewrite the index.html in release builds
#
if [ "$BUILD_CONFIGURATION" == 'RELEASE' ]; then

  node --loader ts-node/esm --no-warnings ./build/rewriteIndexHtml.ts
  if [ $? -ne 0 ]; then
    echo 'Problem encountered rewriting the shell app index.html'
    exit 1
  fi
fi
