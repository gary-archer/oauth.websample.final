#!/bin/bash

####################################################################
# A script to build lambdas ready to upload to AWS S3 and Cloudfront
####################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Two scenarios are supported, where the SPA connects to APIs that use either Serverless or Kubernetes hosting
#
ENVIRONMENT='serverless'
if [ "$1" == 'cloudnative' ]; then
  ENVIRONMENT='cloudnative'
fi

#
# Build lambda extensions
#
if [ ! -d ./node_modules ]; then
  npm install
fi
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing dependencies for cloudfront extensions'
  exit
fi

#
# Clean the output folder
#
rm -rf dist 2>/dev/null
mkdir dist

#
# Build the Serverless code
#
npm run buildRelease
if [ $? -ne 0 ]; then
  echo 'Problem encountered building cloudfront extensions'
  exit
fi

#
# Do a release build of the extensions and package them ready for deploying
#
if [ "$ENVIRONMENT" == 'serverless' ]; then
  npm run packageServerless
else
  npm run packageCloudnative
fi
if [ $? -ne 0 ]; then
  echo 'Problem encountered packaging cloudfront extensions'
  exit
fi
