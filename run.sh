#!/bin/bash

#################################################
# A script to run the SPA when developing locally
#################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
WEB_ORIGIN='https://web.authsamples-dev.com'

#
# Get the platform
#
case "$(uname -s)" in

  Darwin)
    PLATFORM="MACOS"
 	;;

  MINGW64*)
    PLATFORM="WINDOWS"
	;;

  Linux)
    PLATFORM="LINUX"
	;;
esac

if [ "$1" == 'LOCALAPI' ]; then

  #
  # When connecting the SPA to a local API, deploy local token handler components in Docker
  #
  ./localtokenhandler/deployment/docker-local/deploy.sh
  if [ $? -ne 0 ]; then
    echo 'Problem encountered deploying the local token handler'
    exit
  fi
fi

#
# Ensure that web components point to the correct API components
#
if [ "$1" == 'LOCALAPI' ]; then

  cp deployment/environments/dev-localapi/spa.config.json  spa/dist/spa.config.json
  cp deployment/environments/dev-localapi/webhost.config.json  webhost/webhost.config.json

else 

  cp deployment/environments/dev/spa.config.json spa/dist/spa.config.json
  cp deployment/environments/dev/webhost.config.json webhost/webhost.config.json
fi

#
# Run the web host to serve static content
# On Linux first ensure that you have first granted Node.js permissions to listen on port 443:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
if [ "$PLATFORM" == 'MACOS' ]; then

  open -a Terminal ./webhost/run.sh

elif [ "$PLATFORM" == 'WINDOWS' ]; then
  
  GIT_BASH="C:\Program Files\Git\git-bash.exe"
  "$GIT_BASH" -c ./webhost/run.sh &

elif [ "$PLATFORM" == 'LINUX' ]; then

  gnome-terminal -- ./webhost/run.sh
fi

#
# Wait for it to become available
#
echo 'Waiting for Web Host to become available ...'
while [ "$(curl -k -s -o /dev/null -w ''%{http_code}'' "$WEB_ORIGIN/spa/index.html")" != '200' ]; do
  sleep 2
done

#
# Restore the default web host configuration once it is running
#
cp deployment/environments/dev/webhost.config.json webhost/webhost.config.json

#
# Run the SPA in the default browser, then sign in with these credentials:
# - guestuser@mycompany.com
# - Password1
#
if [ "$PLATFORM" == 'MACOS' ]; then

  open "$WEB_ORIGIN/"

elif [ "$PLATFORM" == 'WINDOWS' ]; then

  start "$WEB_ORIGIN/"

elif [ "$PLATFORM" == 'LINUX' ]; then

  xdg-open "$WEB_ORIGIN/"

fi
