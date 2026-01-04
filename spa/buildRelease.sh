#!/bin/bash

########################################
# Build release files to the dist folder
########################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Install dependencies
#
npm install
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing SPA dependencies'
  read -n 1
  exit 1
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
# Prepare the dist folder
#
cd ..
rm -rf dist 2>/dev/null
mkdir dist

#
# Produce minified JavaScript bundles
#
cd spa
npx rollup --config ./build/rollup.config.ts --configPlugin @rollup/plugin-typescript
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the SPA'
  read -n 1
  exit 1
fi

echo 'quit early'
exit 1

#
# Produce minified CSS and use a safelist to prevent required elements from being removed
# https://github.com/FullHuman/purgecss/issues/491
#
npx purgecss --css bootstrap.min.css --content ../dist/spa/app.bundle.js --safelist 'body' --safelist 'container' --output ../dist/spa
if [ $? -ne 0 ]; then
  echo 'Problem encountered reducing CSS for the SPA'
  read -n 1
  exit 1
fi

#
# Write the final index.html with integrity details and cache busting timestamps
#
npx tsx ./build/rewriteIndexHtml.ts
if [ $? -ne 0 ]; then
  echo 'Problem encountered rewriting the SPA index.html file'
  read -n 1
  exit 1
fi
