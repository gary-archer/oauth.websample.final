#!/bin/bash

######################################################################
# A script to build resources ready to upload to AWS S3 and Cloudfront
######################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# The Serverless resources are built to support two scenarios, where the SPA connects to APIs that use either Serverless or Kubernetes hosting
#
ENVIRONMENT='serverless'
if [ "$1" == 'cloudnative' ]; then
  ENVIRONMENT='cloudnative'
fi

#
# Move to the SPA folder
#
SPA_FOLDER='../../spa'
cd $SPA_FOLDER

#
# Install SPA dependencies if required
#
if [ ! -d ./node_modules ]; then
  npm install
fi
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing SPA dependencies'
  exit
fi

#
# Do a release build of the SPA code
#
npm run buildRelease
if [ $? -ne 0 ]; then
  echo 'Problem encountered building SPA release bundles'
  exit
fi

#
# Create the package folder
#
cd ../deployment/cloudfront
rm -rf .package
mkdir .package
mkdir .package/spa

#
# Copy HTML assets and note that the production configuration is hard coded into the app and not deployed
#
cp "$SPA_FOLDER/dist/index.html"        .package/spa
cp "$SPA_FOLDER/dist/vendor.bundle.js"  .package/spa
cp "$SPA_FOLDER/dist/app.bundle.js"     .package/spa
cp "$SPA_FOLDER/dist/bootstrap.min.css" .package/spa
cp "$SPA_FOLDER/dist/app.css"           .package/spa
cp "$SPA_FOLDER/dist/favicon.ico"       .package

#
# Next build lambda extensions
#
cd ../../cloudfront-extensions
if [ ! -d ./node_modules ]; then
  npm install
fi
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing dependencies for cloudfront extensions'
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
  echo 'Problem encountered building Cloudfront extensions'
  exit
fi
