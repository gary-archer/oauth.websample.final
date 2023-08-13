#!/bin/bash

##########################################################################
# A script to build all resources ready to upload to AWS S3 and Cloudfront
##########################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Two scenarios are supported, where the SPA connects to APIs that use either Serverless or Kubernetes hosting
#
ENVIRONMENT="$1"

#
# Build the shell app, which handles the redirect URI and logged out page
#
cd spa/shellapp
./build.sh 'RELEASE'
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the shell application'
  exit
fi
cd ..

#
# Build the main demo app's Javascript bundles
#
cd demoapp
./build.sh 'RELEASE'
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the demo application'
  exit
fi
cd ../..

#
# Build extensions to the Cloudfront web host
#
cd cloudfront-extensions
./build.sh "$ENVIRONMENT"
if [ $? -ne 0 ]; then
  echo 'Problem encountered building Cloudfront extensions'
  exit
fi

#
# Create the package folder
#
rm -rf .package 2> /dev/null
mkdir .package
mkdir .package/demoapp

#
# Copy HTML assets
#
cp ../spa/shellapp/dist/index.html  .package
cp ../spa/shellapp/dist/*.bundle.js .package
cp ../spa/shellapp/dist/*.css       .package
cp ../spa/shellapp/dist/favicon.ico .package

cp ../spa/demoapp/dist/index.html   .package/demoapp
cp ../spa/demoapp/dist/*.bundle.js  .package/demoapp
cp ../spa/demoapp/dist/*.css        .package/demoapp
