#!/bin/bash

#######################################
# A script to download SSL certificates
#######################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download SSL certificates from a central repo if needed
#
if [ ! -d 'certs' ]; then

  rm -rf ./resources
  git clone https://github.com/gary-archer/oauth.developmentcertificates ./resources
  if [ $? -ne 0 ]; then
    echo 'Problem encountered downloading development certificates'
    exit 1
  fi

  rm -rf certs
  mv ./resources/authsamples-dev ./certs
  rm -rf ./resources
fi
