#!/bin/bash

########################################
# Run the web host on the local computer
########################################

cd "$(dirname "${BASH_SOURCE[0]}")"
npm start
if [ $? -ne 0 ]; then
    echo 'Problem encountered running the Web Host'
    exit 1
fi