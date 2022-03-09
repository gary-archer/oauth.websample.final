#!/bin/bash

###############################################
# Install and build the SPA ready for deploying
###############################################

rm -rf node_modules
npm install
if [ $? -ne 0 ]; then
    echo 'Problem encountered installing SPA dependencies'
    exit 1
fi

npm run buildRelease
if [ $? -ne 0 ]; then
    echo 'Problem encountered building the SPA'
    exit 1
fi
