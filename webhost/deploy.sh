#!/bin/bash

########################################
# Run the web host on the local computer
########################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Run the web host locally
#
npm start
if [ $? -ne 0 ]; then
  echo 'Problem encountered running the Web Host'
  exit 1
fi

#
# Prevent automatic terminal closure on Linux
#
if [ "$(uname -s)" == 'Linux' ]; then
  read -n 1
fi