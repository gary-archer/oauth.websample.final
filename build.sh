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
# Build minified production assets
#
npm run build
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  read -n 1
  exit 1
fi
