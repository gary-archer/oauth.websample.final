#!/bin/bash

###################################################################################################
# Deploy the web host when using KIND locally, and expose static content endpoints from the cluster
###################################################################################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Get the timestamp based docker image tag
#
TAG=$(cat ./dockertag.txt)
export DOCKER_IMAGE="webhost:$TAG"

#
# Create a configmap for the SPA's JSON configuration file
#
kubectl -n applications delete configmap spa-config 2>/dev/null
kubectl -n applications create configmap spa-config --from-file=../environments/kubernetes-local/spa.config.json
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the SPA configmap'
  exit 1
fi

#
# Create a configmap for the Web Host's JSON configuration file
#
kubectl -n applications delete configmap webhost-config 2>/dev/null
kubectl -n applications create configmap webhost-config --from-file=../environments/kubernetes-local/webhost.config.json
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the Web Host configmap'
  exit 1
fi

#
# Produce the final YAML using the envsubst tool
#
envsubst < ./webhost-template.yaml > ./webhost.yaml
if [ $? -ne 0 ]; then
  echo '*** Problem encountered running envsubst to produce the final webhost.yaml file'
  exit 1
fi

#
# Trigger deployment of the web host to the Kubernetes cluster
#
kubectl -n applications delete -f webhost.yaml 2>/dev/null
kubectl -n applications apply  -f webhost.yaml
if [ $? -ne 0 ]; then
  echo '*** Web Host Kubernetes deployment problem encountered'
  exit 1
fi
