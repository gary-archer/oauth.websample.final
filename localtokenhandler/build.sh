#!/bin/bash

####################################################################################
# A script to deploy local token handler resources to a local Docker compose network
####################################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download SSL certificates used by the OAuth Agent and OAuth Proxy
#
rm -rf tmp
git clone https://github.com/gary-archer/oauth.developmentcertificates ./tmp
if [ $? -ne 0 ]; then
  echo 'Problem encountered downloading API certificates'
  exit 1
fi
rm -rf certs
mv ./tmp/authsamples-dev ./certs

#
# Download the Curity OAuth proxy plugin
#
rm -rf oauth-proxy-plugin
git clone https://github.com/curityio/nginx-lua-oauth-proxy-plugin ./oauth-proxy-plugin
if [ $? -ne 0 ]; then
  echo 'Problem encountered downloading the Curity OAuth proxy plugin'
  exit 1
fi

#
# Download the OAuth Agent API
#
rm -rf oauth-agent
git clone https://github.com/gary-archer/oauth.tokenhandler.docker oauth-agent
if [ $? -ne 0 ]; then
  echo 'Problem encountered downloading the OAuth Agent'
  exit 1
fi
cd oauth-agent

#
# When the OAuth Proxy calls an API on the host computer, this ensures that SSL trust works
# If also running a proxy tool such as Charles on the host, the proxy root CA may cause SSL trust problems
# To resolve this, set an environment variable that includes both the below CA and the proxy root CA
#
echo $TOKEN_HANDLER_CA_CERTS
if [[ -z "$TOKEN_HANDLER_CA_CERTS" ]]; then
  cp ../tmp/mycompany.ca.pem ./trusted.ca.pem
else
  cp $TOKEN_HANDLER_CA_CERTS ./trusted.ca.pem
fi

#
# Install OAuth Agent dependencies
#
rm -rf node_modules
npm install
if [ $? -ne 0 ]; then
  echo "Problem encountered installing the Token Handler API dependencies"
  exit 1
fi

#
# Build the OAuth Agent's API's code
#
npm run buildRelease
if [ $? -ne 0 ]; then
  echo "Problem encountered building the Token Handler API code"
  exit 1
fi

#
# Build the OAuth Agent's Docker container
#
docker build -f ./Dockerfile -t oauthagent:v1 .
if [ $? -ne 0 ]; then
  echo "Problem encountered building the OAuth Agent Docker container"
  exit 1
fi
