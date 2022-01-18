#!/bin/bash

###########################
# Run the SPA in watch mode
###########################

cd "$(dirname "${BASH_SOURCE[0]}")"
npm start
if [ $? -ne 0 ]; then
    echo 'Problem encountered producing SPA bundles'
    exit 1
fi