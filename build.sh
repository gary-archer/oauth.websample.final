#!/bin/bash

#################################################################################
# A script to build all components needed to run an SPA and token handler locally
# A simple web host will run locally, with the token handler running in Docker
#################################################################################

#
# Build the web host
#
cd webhost
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building the web host'
    exit
fi

#
# Build the SPA
#
cd ../spa
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building the SPA'
    exit
fi

#
# Download SSL certificates
#
cd ..
rm -rf certs
git clone https://github.com/gary-archer/oauth.developmentcertificates ./certs
if [ $? -ne 0 ]; then
    echo 'Problem encountered downloading webhost certificates'
    exit 1
fi

#
# Download the token handler, which the SPA uses to manage its OAuth tokens
#
rm -rf .tmp
mkdir .tmp
cd .tmp
git clone https://github.com/gary-archer/oauth.tokenhandlerapi
if [ $? -ne 0 ]; then
    echo 'Problem encountered downloading the token handler API'
    exit 1
fi

#
# Build its code
#
cd oauth.tokenhandlerapi
git checkout feature/revamp
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building the token handler API'
    exit
fi
