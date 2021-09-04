#!/bin/bash

#
# Download SSL certificates from a central repo if needed
#
if [ ! -d '.certs' ]; then
    git clone https://github.com/gary-archer/oauth.developmentcertificates ./.certs
fi

#
# Install dependencies if needed
#
if [ ! -d 'node_modules' ]; then
    npm install
fi

#
# Then start listening
#
npm start