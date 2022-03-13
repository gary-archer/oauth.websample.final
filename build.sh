#!/bin/bash

#######################################################
# A script to build the SPA resources ready for running
#######################################################

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
# Download and build local token handler resources if running against a local API
#
if [ "$1" == 'LOCALAPI' ]; then
    
    git clone https://github.com/gary-archer/oauth.localtokenhandler.deployment ./resources
    cd resources
    ./build.sh
    if [ $? -ne 0 ]; then
        echo 'Problem encountered building local token handler resources'
        exit
    fi
fi
echo 'All projects built successfully'