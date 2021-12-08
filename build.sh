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
cd ..

#
# Build the token handler code
#
cd dependencies/tokenhandler
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building the token handler API'
    exit
fi
