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
# Get the back end for front end API, which deals with OAuth requests for the SPA
#
cd ..
rm -rf back-end-for-front-end
git clone https://github.com/gary-archer/oauth.webproxyapi back-end-for-front-end
if [ $? -ne 0 ]; then
  echo "Problem encountered downloading the back end for front end API"
  exit 1
fi

#
# Build the back end for front end components
#
cd back-end-for-front-end
git checkout feature/revamp
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building back end for front end components'
    exit
fi
