#!/bin/bash

##############################################
# Build the web host ready for local execution
##############################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Move web host certificates to this folder
#
rm -rf certs
mv ../resources/devcerts/webauthsamples-dev ./certs

#
# Build the webhost code
#
rm -rf node_modules
npm install
if [ $? -ne 0 ]; then
    echo 'Problem encountered installing webhost dependencies'
    exit 1
fi
