#!/bin/bash

#########################################################
# A script to deployed the SPA files to S3 and Cloudfront
#########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Upload all files to S3
#
aws s3 cp .package s3://web.authsamples.com --recursive

#
# Invalidate existing files
#
aws cloudfront create-invalidation --distribution-id=E1P4XPOL1PNE6Z --paths '/*'