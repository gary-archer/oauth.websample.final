#!/bin/bash

########################################################################
# A script to build the shell application's resources to the dist folder
########################################################################

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
cp index.html index.mjs app.css favicon.ico ./dist

if [ "$BUILD_CONFIGURATION" == 'RELEASE' ]; then

  #
  # Reduce the CSS size
  #
  npm run purgecss
  if [ $? -ne 0 ]; then
    echo 'Problem encountered reducing CSS for the shell application'
    exit 1
  fi

  #
  # Rewrite the index.html with script integrity values
  #
  node ./rewriteIndexHtml.mjs
  if [ $? -ne 0 ]; then
    echo 'Problem encountered rewriting the shell index.html'
    exit 1
  fi

else

  #
  # In debug builds just copy full CSS
  #
  cp bootstrap.min.css ./dist
fi
