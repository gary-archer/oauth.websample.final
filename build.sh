#!/bin/bash

################################################
# Build components needed to run the SPA locally
################################################

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
# Build the back end for front end
#
cd ../back-end-for-front-end
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building the back end for front end API'
    exit
fi
