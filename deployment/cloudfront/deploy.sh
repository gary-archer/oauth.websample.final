#!/bin/bash

#########################################################
# A script to deployed the SPA files to S3 and Cloudfront
#########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Check that packaging has been run first
#
if [ ! -d '.package' ]; then
  echo 'Please run the build.sh script before the deploy.sh script'
  exit
fi

#
# Deployment supports two scenarios, where the SPA connects to APIs that use either Serverless or Kubernetes hosting
#
if [ "$1" == 'cloudnative' ]; then
  ENVIRONMENT='cloudnative'
  DOMAIN='www.authsamples-k8s.com'
  DISTRIBUTION_ID='E3ADD9C1K3LQWL'
else 
  ENVIRONMENT='serverless'
  DOMAIN='www.authsamples.com'
  DISTRIBUTION_ID='E1P4XPOL1PNE6Z'
fi

#
# Deploy the SPA's static content to the upload point for distribution
#
aws s3 cp .package "s3://$DOMAIN" --recursive
if [ $? -ne 0 ]; then
  echo 'Problem encountered uploading web static content to S3'
  exit
fi

#
# Invalidate the index.html
#
aws cloudfront create-invalidation --distribution-id="$DISTRIBUTION_ID" --paths '/spa/index.html'
if [ $? -ne 0 ]; then
  echo 'Problem encountered creating a Cloudfront invalidation'
  exit
fi
