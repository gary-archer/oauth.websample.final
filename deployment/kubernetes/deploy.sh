#!/bin/bash

###################################################################################################
# Deploy the web host when using KIND locally, and expose static content endpoints from the cluster
###################################################################################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Create a configmap for the shell app's JSON configuration file
#
kubectl -n applications delete configmap shellapp-config 2>/dev/null
kubectl -n applications create configmap shellapp-config --from-file=../environments/kubernetes-local/shellapp.config.json
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the shell app configmap'
  exit 1
fi

#
# Create a configmap for the demo app's JSON configuration file
#
kubectl -n applications delete configmap demoapp-config 2>/dev/null
kubectl -n applications create configmap demoapp-config --from-file=../environments/kubernetes-local/demoapp.config.json
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the demo app configmap'
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
# Use a timestamp based docker image tag
#
TAG=$(cat ./dockertag.txt)
export DOCKER_IMAGE="webhost:$TAG"

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
