#!/bin/bash

#######################################################################
# Deploy the Curity Back End for Front End API and the Kong API Gateway
#######################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Clean up if required
#
docker compose down

#
# Spin up Docker compose components
#
docker compose up --force-recreate --remove-orphans
if [ $? -ne 0 ]; then
  echo "Problem encountered starting Docker components"
  exit 1
fi
