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
cd shellapp
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
cd ..

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
cp '../shellapp/dist/index.html'           .package
cp '../shellapp/dist/vendor.bundle.js'     .package
cp '../shellapp/dist/app.bundle.js'        .package
cp '../shellapp/dist/bootstrap.min.css'    .package
cp '../shellapp/dist/app.css'              .package
cp '../shellapp/dist/favicon.ico'          .package

cp '../demoapp/dist/index.html'            .package/demoapp
cp '../demoapp/dist/vendor.bundle.js'      .package/demoapp
cp '../demoapp/dist/app.bundle.js'         .package/demoapp
cp '../demoapp/dist/bootstrap.min.css'     .package/demoapp
cp '../demoapp/dist/app.css'               .package/demoapp