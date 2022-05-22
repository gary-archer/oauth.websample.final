#!/bin/bash

####################################################################################
# A script to deploy local token handler resources to a local Docker compose network
####################################################################################

#
# Set the current folder if this script is called from another script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Run the Docker compose network
#
docker compose --project-name localtokenhandler up --detach --force-recreate --remove-orphans
if [ $? -ne 0 ]; then
  echo "Problem encountered starting Docker components"
  exit 1
fi