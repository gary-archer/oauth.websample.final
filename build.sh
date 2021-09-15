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
cd ../back-end-for-front-end
rm -rf oauth.webproxyapi
git clone https://github.com/gary-archer/oauth.webproxyapi
if [ $? -ne 0 ]; then
  echo "Problem encountered downloading the back end for front end API"
  exit 1
fi

#
# Build the back end for front end
#
cd oauth.webproxyapi
git checkout feature/revamp
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building the back end for front end API'
    exit
fi

#
# Also prepare the API Gateway, which forwards API requests to remote domains from a developer PC
#
cd ../api-gateway
./build.sh
if [ $? -ne 0 ]; then
    echo 'Problem encountered building the API Gateway'
    exit
fi
