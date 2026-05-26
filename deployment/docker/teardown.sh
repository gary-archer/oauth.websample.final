#!/bin/bash

###################################################
# A script to tear down the local Docker deployment
###################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Run the docker deployment
#
docker compose --project-name webhost down
