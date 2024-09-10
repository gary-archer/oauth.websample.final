#!/bin/bash

################################################################
# A script to tear down Docker resources once finished with them
################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ "$(docker ps | grep oauthagent)" != '' ]; then
  ./localtokenhandler/deployment/docker-local/teardown.sh
fi
