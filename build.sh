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
# Download dependencies that were added with these commands:
# - git submodule add https://github.com/gary-archer/oauth.tokenhandlerapi         dependencies/tokenhandler
# - git submodule add https://github.com/gary-archer/oauth.developmentcertificates dependencies/certs
#
git submodule update --init --remote --rebase
if [ $? -ne 0 ]; then
  echo 'Problem encountered downloading submodule dependencies'
  exit
fi

#
# Build the token handler code
#
cd dependencies/tokenhandler
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building the token handler API'
    exit
fi
