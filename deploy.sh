#!/bin/bash

#################################################
# A script to run the SPA when developing locally
#################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

WEB_ORIGIN='https://web.authsamples-dev.com'
TOKEN_HANDLER_BASE_URL='https://localtokenhandler.authsamples-dev.com'

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
esac

#
# Run ./deploy.sh LOCALAPI to run a local token handler in Docker, to route to a locally running API
#
if [ "$1" == 'LOCALAPI' ]; then

    # Run the Docker deployment
    echo 'Deploying a local token handler to a Docker Compose network ...'
    ./resources/deploy.sh
    
    # Wait for endpoints to come up
    echo 'Waiting for the local token handler endpoints to come up ...'
    while [ "$(curl -k -s -X POST -H "origin:$WEB_ORIGIN" -o /dev/null -w ''%{http_code}'' "$TOKEN_HANDLER_BASE_URL/oauth-agent/login/start")" != "200" ]; do
        sleep 2
    done
fi

#
# Run the web host to serve static content
#
if [ "$PLATFORM" == 'MACOS' ]; then
    open -a Terminal ./webhost/deploy.sh
else
    GIT_BASH="C:\Program Files\Git\git-bash.exe"
    "$GIT_BASH" -c ./webhost/deploy.sh &
fi

#
# Wait for it to become available
#
echo "Waiting for Web Host to become available ..."
while [ "$(curl -k -s -o /dev/null -w ''%{http_code}'' "$WEB_ORIGIN/spa/index.html")" != "200" ]; do
    sleep 2
done

#
# Run the SPA in the default browser, then sign in with these credentials:
#  guestuser@mycompany.com
#  GuestPassword1
#
if [ "$PLATFORM" == 'MACOS' ]; then
    open "$WEB_ORIGIN/spa"
fi
if [ "$PLATFORM" == 'WINDOWS' ]; then
    start "$WEB_ORIGIN/spa"
fi
