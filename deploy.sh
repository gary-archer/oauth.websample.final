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

#
# When connecting the SPA to a local API, deploy a token handler to run in Docker on the local development computer
#
if [ "$1" == 'LOCALAPI' ]; then

  ./localtokenhandler/deploy.sh
  if [ $? -ne 0 ]; then
    echo 'Problem encountered depoying the local token handler'
    exit
  fi
fi

#
# Ensure that the webhost is using the correct web configurations
#
if [ "$1" == 'LOCALAPI' ]; then

  cp spa/environments/localapi.config.json spa/dist/spa.config.json
  cp webhost/environments/dev.config.json webhost/webhost.config.json

else 

  cp spa/environments/dev.config.json spa/dist/spa.config.json
  cp webhost/environments/dev.config.json webhost/webhost.config.json
fi

#
# Run the web host to serve static content
#
if [ "$PLATFORM" == 'MACOS' ]; then

  open -a Terminal ./webhost/deploy.sh

elif [ "$PLATFORM" == 'WINDOWS' ]; then
  
  GIT_BASH="C:\Program Files\Git\git-bash.exe"
  "$GIT_BASH" -c ./webhost/deploy.sh &

elif [ "$PLATFORM" == 'LINUX' ]; then

  gnome-terminal -- ./webhost/deploy.sh
fi

#
# Wait for it to become available
#
echo 'Waiting for Web Host to become available ...'
while [ "$(curl -k -s -o /dev/null -w ''%{http_code}'' "$WEB_ORIGIN/spa/index.html")" != '200' ]; do
  sleep 2
done

#
# Run the SPA in the default browser, then sign in with these credentials:
# - guestuser@mycompany.com
# - Password1
#
if [ "$PLATFORM" == 'MACOS' ]; then

  open "$WEB_ORIGIN/spa"

elif [ "$PLATFORM" == 'WINDOWS' ]; then

  start "$WEB_ORIGIN/spa"

elif [ "$PLATFORM" == 'LINUX' ]; then

  xdg-open "$WEB_ORIGIN/spa"

fi
