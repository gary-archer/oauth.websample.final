#!/bin/bash

#################################################################
# A script to build the shell app resources under the dist folder
#################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Clean the output folder
#
mkdir '../dist' 2>/dev/null
DIST_FOLDER='../dist/shellapp'
rm -rf "$DIST_FOLDER" 2>/dev/null
mkdir "$DIST_FOLDER"

#
# Copy HTML assets to the output folder
#
cp index.html shell.js favicon.ico "$DIST_FOLDER"