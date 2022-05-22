#!/bin/bash

####################################################################
# A script to tear down local Docker Compose resources when required
####################################################################

#
# Set the current folder if this script is called from another script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Shut down the Docker compose network
#
docker compose --project-name localtokenhandler down