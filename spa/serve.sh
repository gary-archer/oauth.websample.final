#!/bin/bash

##############################################################
# Run the webpack dev server to serve the SPA's static content
##############################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

NODE_OPTIONS='--import tsx' npx webpack serve --config webpack/webpack.config.dev.ts
if [ $? -ne 0 ]; then
  echo 'Problem encountered serving SPA static content'
  read -n 1
  exit 1
fi
