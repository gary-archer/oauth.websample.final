#!/bin/bash

#############################################################################################
# A script to build the SPA and set up dependencies ready for deploying a token handler setup
#############################################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

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
# Build the SPA which will then enter watch mode
#
cd ../spa
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building the SPA'
    exit
fi
cd ..

#
# Build local token handler resources 
#
rm -rf resources
git clone https://github.com/gary-archer/oauth.localtokenhandler.deployment ./resources
cd resources
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building local token handler resources'
    exit
fi

echo 'All projects built successfully'