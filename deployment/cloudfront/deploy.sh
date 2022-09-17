#!/bin/bash

#########################################################
# A script to deployed the SPA files to S3 and Cloudfront
#########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Check that packaging has been run first
#
if [ ! -d '.package' ]; then
  echo '*** Please run the package.sh script before the deploy.sh script'
  exit
fi

#
# Deployment supports two scenarios, where the SPA connects to APIs that use either Serverless or Kubernetes hosting
#
ENVIRONMENT='serverless'
if [ "$1" == 'cloudnative' ]; then
  ENVIRONMENT='cloudnative'
fi

#
# Upload the SPA's packaged files to S3
#
if [ "$ENVIRONMENT" == 'serverless' ]; then
  aws s3 cp .package s3://web.authsamples.com --recursive
else
  aws s3 cp .package s3://web.authsamples-k8s.com --recursive
fi
if [ $? -ne 0 ]; then
  echo 'Problem encountered uploading web static content to S3'
  exit
fi

#
# Upload the serverless functions used for lambda extensions
#
cd ../../cloudfront-extensions
if [ "$ENVIRONMENT" == 'serverless' ]; then
  npm run deployServerless
else
  npm run deployCloudnative
fi
if [ $? -ne 0 ]; then
  echo 'Problem encountered deploying lambda edge extensions and applying them to the cloudfront distribution'
  exit
fi

#
# Invalidate existing files
#
if [ "$ENVIRONMENT" == 'serverless' ]; then
  aws cloudfront create-invalidation --distribution-id=E1P4XPOL1PNE6Z --paths '/*'
else
  aws cloudfront create-invalidation --distribution-id=E3ADD9C1K3LQWL --paths '/*'
fi
if [ $? -ne 0 ]; then
  echo 'Problem encountered creating a Cloudfront invalidation'
  exit
fi