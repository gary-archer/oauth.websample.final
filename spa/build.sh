#!/bin/bash

################
# Set up the SPA
################

rm -rf node_modules
npm install
if [ $? -ne 0 ]; then
    echo 'Problem encountered installing SPA dependencies'
    exit 1
fi
