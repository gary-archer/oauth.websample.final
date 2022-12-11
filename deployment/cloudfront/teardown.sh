#!/bin/bash

##############################################################################
# A script to remove lambda edge resources after manually deleting the lambdas
##############################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# The Serverless resources are built to support two scenarios, where the SPA connects to APIs that use either Serverless or Kubernetes hosting
#
ENVIRONMENT='serverless'
if [ "$1" == 'cloudnative' ]; then
  ENVIRONMENT='cloudnative'
fi

#
# Remove other resources such as the S3 bucket and cloudformation
#
cd ../../cloudfront-extensions
if [ "$ENVIRONMENT" == 'serverless' ]; then
  npm run removeServerless
else
  npm run removeCloudnative
fi
