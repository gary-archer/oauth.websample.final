#!/bin/bash

#################################
# Run the SPA in development mode
#################################

cd "$(dirname "${BASH_SOURCE[0]}")"

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
# Create SSL certificates if required
#
./certs/create.sh
if [ $? -ne 0 ]; then
  exit 1
fi

#
# When connecting the SPA to a local API, run token handler components in Docker
#
if [ "$LOCALAPI" == 'true' ]; then

  rm -rf localtokenhandler 2>/dev/null
  git clone https://github.com/gary-archer/oauth.tokenhandler.cloudnative localtokenhandler
  if [ $? -ne 0 ]; then
    echo ' Problem encountered downloading local token handler resources'
    exit 1
  fi

  echo 'Building local token handler components ...'
  ./localtokenhandler/docker/build.sh
  if [ $? -ne 0 ]; then
    exit 1
  fi

  ./localtokenhandler/docker/deploy.sh
  if [ $? -ne 0 ]; then
    exit 1
  fi
fi

#
# Prepare the output folder and copy in the correct configuration file
#
rm -rf dist 2>/dev/null
mkdir dist
mkdir dist/spa
if [ "$LOCALAPI" == 'true' ]; then
  cp ./deployment/environments/dev-localapi/spa.config.json dist/spa/spa.config.json

else 
  cp ./deployment/environments/dev/spa.config.json dist/spa/spa.config.json
fi

#
# Run webpack dev server to serve static content
# On Linux ensure that you have first granted Node.js permissions to listen on port 443:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
if [ "$PLATFORM" == 'MACOS' ]; then

  open -a Terminal ./spa/start.sh

elif [ "$PLATFORM" == 'WINDOWS' ]; then
  
  GIT_BASH="C:\Program Files\Git\git-bash.exe"
  "$GIT_BASH" -c ./spa/start.sh &

elif [ "$PLATFORM" == 'LINUX' ]; then

  gnome-terminal -- ./spa/start.sh
fi
