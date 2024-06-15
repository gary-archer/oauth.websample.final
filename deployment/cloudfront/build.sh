#!/bin/bash

##########################################################################
# A script to build all resources ready to upload to AWS S3 and Cloudfront
##########################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Build the SPA's Javascript bundles
#
cd spa
./build.sh 'RELEASE'
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  exit
fi
cd ..

#
# Create the package folder
#
rm -rf .package 2> /dev/null
mkdir .package
mkdir .package/spa

#
# Copy HTML assets
#
cp ./spa/favicon.ico       .package
cp ./spa/dist/index.html   .package/spa
cp ./spa/dist/*.bundle.js  .package/spa
cp ./spa/dist/*.css        .package/spa
