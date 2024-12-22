#!/bin/bash

########################################
# Build release files to the dist folder
########################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Install dependencies
#
if [ ! -d 'node_modules' ]; then
  
  npm install
  if [ $? -ne 0 ]; then
    echo 'Problem encountered installing SPA dependencies'
    read -n 1
    exit 1
  fi
fi

#
# First check code quality
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'SPA code quality checks failed'
  read -n 1
  exit 1
fi

#
# Copy non JavaScript files to the dist folder without a configuration file
#
cd ..
rm -rf dist 2>/dev/null
mkdir dist
mkdir dist/spa
cp favicon.ico                                 dist/
cp spa/index.html spa/*.css                    dist/spa/
cp deployment/environments/dev/spa.config.json dist/spa/spa.config.json
cd spa


#
# Produce minified JavaScript bundles
#
NODE_OPTIONS='--import tsx' npx webpack --config webpack/webpack.config.prod.ts
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  read -n 1
  exit 1
fi

#
# Produce minified CSS
#
#npx purgecss -c purgecss.config.cjs -o ../dist/spa
#if [ $? -ne 0 ]; then
#  echo 'Problem encountered reducing CSS for the SPA'
#  read -n 1
#  exit 1
#fi

#
# Write the final index.html with integrity details and cache busting timestamps
#
npx tsx ./webpack/rewriteIndexHtml.ts
if [ $? -ne 0 ]; then
  echo 'Problem encountered rewriting the SPA index.html file'
  read -n 1
  exit 1
fi
