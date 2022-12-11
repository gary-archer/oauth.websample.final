#!/bin/bash

##############################################
# Build the web host ready for local execution
##############################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Install the web host dependencies
#
if [ ! -d 'node_modules' ]; then
  
  npm install
  if [ $? -ne 0 ]; then
    echo 'Problem encountered installing webhost dependencies'
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
# Build its code
#
npm run buildRelease
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the webhost code'
  exit 1
fi
