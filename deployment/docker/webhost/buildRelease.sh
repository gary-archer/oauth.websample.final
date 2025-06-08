#!/bin/bash

#########################################
# Build the web host ready for deployment
#########################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Install the web host dependencies
#
npm install
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing webhost dependencies'
  exit 1
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
# Build the code
#
rm -rf dist 2>/dev/null
npx tsc --sourceMap false
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the webhost code'
  exit 1
fi
