#!/bin/bash

########################################
# Build release files to the dist folder
########################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Install dependencies
#
npm install
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing SPA dependencies'
  read -n 1
  exit 1
fi

#
# First check code quality
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'SPA code quality checks failed'
  read -n 1
  exit 1
fi

#
# Prepare the dist folder
#
cd ..
rm -rf dist 2>/dev/null
mkdir dist
mkdir dist/spa

#
# Produce minified JavaScript bundles
#
cd spa
NODE_OPTIONS='--import tsx' npx webpack --config webpack/webpack.config.prod.ts
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  read -n 1
  exit 1
fi
