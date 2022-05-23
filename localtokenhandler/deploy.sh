#!/bin/bash

####################################################################################
# A script to deploy local token handler resources to a local Docker compose network
####################################################################################

#
# Set the current folder if this script is called from another script
#
cd "$(dirname "${BASH_SOURCE[0]}")"
cd ..

#
# Run the token handler components in a Docker compose network
#
docker compose --file localtokenhandler/docker-compose.yml --project-name localtokenhandler up --force-recreate --remove-orphans --detach
if [ $? -ne 0 ]; then
  echo "Problem encountered starting Docker components"
  exit 1
fi

#
# Wait for token handler endpoints to come up
#
echo 'Waiting for Token Handler endpoints to become available ...'
WEB_ORIGIN='https://web.authsamples-dev.com'
TOKEN_HANDLER_BASE_URL='https://localtokenhandler.authsamples-dev.com:444'
while [ "$(curl -k -s -X POST -H "origin:$WEB_ORIGIN" -o /dev/null -w ''%{http_code}'' "$TOKEN_HANDLER_BASE_URL/oauth-agent/login/start")" != '200' ]; do
  sleep 2
done
