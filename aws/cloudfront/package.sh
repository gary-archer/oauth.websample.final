#!/bin/bash

###################################################
# A script to package the SPA files ready to upload
###################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
ROOT_FOLDER='../../spa'

#
# Ensure a clean folder
#
rm -rf .package
mkdir .package
mkdir .package/spa

#
# The production configuration is hard coded into the app and not deployed
#
# cp ./spa.config.json .package/spa

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