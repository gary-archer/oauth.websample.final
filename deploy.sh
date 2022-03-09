#!/bin/bash

#################################################
# A script to run the SPA when developing locally
#################################################

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
esac

#
# If running against a local API, execute the local token handler in Docker
#
if [ "$1" == 'LOCALAPI' ]; then

    # Update some local configuration
    WEB_ORIGIN='https://web.authsamples-dev.com'
    OAUTH_AGENT_BASE_URL='https://localtokenhandler.authsamples-dev.com/oauth-agent'

    # Run the Docker deployment
    echo 'Deploying a local token handler to a Docker Compose network ...'
    ./resources/deploy.sh
    
    # Wait for endpoints to come up
    echo 'Waiting for the local token handler endpoints to become available ...'
    while [ "$(curl -k -s -X POST -H "origin:$WEB_ORIGIN" -o /dev/null -w ''%{http_code}'' "$OAUTH_AGENT_BASE_URL/login/start")" != "200" ]; do
        sleep 2
    done
fi

#
# Run the web host to serve static content
#
cd webhost
npm start

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
