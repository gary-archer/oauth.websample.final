#!/bin/bash

#############################################################
# Run the web host on the local computer in a terminal window
#############################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Run the web host locally
# On Linux first ensure that you have first granted Node.js permissions to listen on a port below 1024:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
npm run startRelease
if [ $? -ne 0 ]; then
  echo 'Problem encountered running the Web Host'
  read -n 1
  exit 1
fi
