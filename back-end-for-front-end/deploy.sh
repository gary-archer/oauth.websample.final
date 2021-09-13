#!/bin/bash

#######################################################################
# Deploy the Curity Back End for Front End API and the Kong API Gateway
#######################################################################

rm -rf kong-bff-plugin
git clone https://github.com/curityio/kong-bff-plugin
if [ $? -ne 0 ]; then
  echo "Problem encountered downloading the BFF plugin"
  exit 1
fi

#
# Spin up all containers, using the Docker Compose file, which applies the deployed configuration
#
docker compose up --force-recreate
if [ $? -ne 0 ]; then
  echo "Problem encountered starting Docker components"
  exit 1
fi