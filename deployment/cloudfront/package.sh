#!/bin/bash

#####################################################################
# A script to package the SPA files ready to upload to AWS Cloudfront
# Note that the web host is not needed and we simple upload files
#####################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Move to the SPA folder
#
ROOT_FOLDER='../../spa'
cd $ROOT_FOLDER

#
# Install SPA dependencies if required
#
if [ ! -d ./node_modules ]; then
  npm install
fi

#
# Do a release build of the SPA code
#
npm run buildRelease

#
# Create the package folder
#
cd ../deployment/cloudfront
rm -rf .package
mkdir .package
mkdir .package/spa

#
# The production configuration is hard coded into the app and not deployed
# In some environments we could deploy a configuration file like this:
# - cp ./spa.config.json .package/spa

#
# Copy HTML files
#
cp "$ROOT_FOLDER/dist/index.html" .package/spa

#
# Copy Javascript files
#
cp "$ROOT_FOLDER/dist/vendor.bundle.js" .package/spa
cp "$ROOT_FOLDER/dist/app.bundle.js"    .package/spa

#
# Copy CSS files
#
cp "$ROOT_FOLDER/dist/bootstrap.min.css" .package/spa
cp "$ROOT_FOLDER/dist/app.css"           .package/spa

#
# Copy image files
#
cp "$ROOT_FOLDER/dist/favicon.ico" .package