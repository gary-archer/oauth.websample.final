#!/bin/bash

##############################################
# Build the web host ready for local execution
##############################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Build the webhost code
#
if [ ! -d 'node_modules' ]; then
  
  npm install
  if [ $? -ne 0 ]; then
    echo 'Problem encountered installing webhost dependencies'
    exit 1
  fi
fi
