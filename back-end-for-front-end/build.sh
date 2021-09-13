#!/bin/bash

#####################################################
# Get and build the Curity Back End for Front End API
#####################################################

rm -rf bff-node-express
git clone https://github.com/curityio/bff-node-express
if [ $? -ne 0 ]; then
  echo "Problem encountered downloading the BFF API"
  exit 1
fi

cd bff-node-express
npm install
if [ $? -ne 0 ]; then
  echo "Problem encountered installing the BFF API dependencies"
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  echo "Problem encountered building the BFF API code"
  exit 1
fi

docker build -f Dockerfile -t curity-bff-api:1.0.0 .
if [ $? -ne 0 ]; then
  echo "Problem encountered building the BFF API Docker file"
  exit 1
fi