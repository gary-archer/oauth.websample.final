#!/bin/bash

##############################################
# Build the web host ready for local execution
##############################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download SSL certificates for serving web content locally
#
git clone https://github.com/gary-archer/oauth.developmentcertificates ./resources
if [ $? -ne 0 ]; then
    echo 'Problem encountered downloading development certificates'
    exit 1
fi

#
# Move web host certificates to this folder
#
rm -rf certs
mv ./resources/authsamples-dev ./certs
rm -rf ./resources

#
# Build the webhost code
#
rm -rf node_modules
npm install
if [ $? -ne 0 ]; then
    echo 'Problem encountered installing webhost dependencies'
    exit 1
fi
