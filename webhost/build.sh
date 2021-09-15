#!/bin/bash

##############################################
# Build the web host ready for local execution
##############################################

#
# Download SSL certificates
#
rm -rf .certs
git clone https://github.com/gary-archer/oauth.developmentcertificates ./.certs
if [ $? -ne 0 ]; then
    echo 'Problem encountered downloading webhost certificates'
    exit 1
fi

#
# Install node dependencies
#
rm -rf node_modules
npm install
if [ $? -ne 0 ]; then
    echo 'Problem encountered installing webhost dependencies'
    exit 1
fi