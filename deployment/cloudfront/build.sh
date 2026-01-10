#!/bin/bash

##########################################################################
# A script to build all resources ready to upload to AWS S3 and Cloudfront
##########################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Build the SPA's Javascript bundles
#
./spa/buildRelease.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  exit
fi

#
# Create the package folder
#
rm -rf .package 2> /dev/null
mkdir .package
mkdir .package/spa

#
# Copy HTML assets
#
cp ./dist/favicon.ico    .package
cp ./dist/spa/index.html .package/spa
cp ./dist/spa/*.js       .package/spa
cp ./dist/spa/*.css      .package/spa
