#!/bin/bash

###############################################
# Install and build the SPA ready for deploying
###############################################

cd "$(dirname "${BASH_SOURCE[0]}")"

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
# Check code quality
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Code quality checks failed'
  exit 1
fi

#
# Build Javascript bundles
#
npm run buildRelease
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  exit 1
fi
