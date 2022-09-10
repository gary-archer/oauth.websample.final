#!/bin/bash

###################################################################################################
# Deploy the web host when using KIND locally, and expose static content endpoints from the cluster
###################################################################################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Give configuration files the correct name
#
cp ../environments/spa/kubernetes-local.config.json     spa.config.json
cp ../environments/webhost/kubernetes-local.config.json webhost.config.json

#
# Create a configmap for the SPA's JSON configuration file
#
kubectl -n applications delete configmap spa-config 2>/dev/null
kubectl -n applications create configmap spa-config --from-file=spa.config.json
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the SPA configmap'
  exit 1
fi

#
# Create a configmap for the Web Host's JSON configuration file
#
kubectl -n applications delete configmap webhost-config 2>/dev/null
kubectl -n applications create configmap webhost-config --from-file=webhost.config.json
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the Web Host configmap'
  exit 1
fi

#
# Create a secret for the private key password of the certificate file cert-manager will create
#
kubectl -n applications delete secret webhost-pkcs12-password 2>/dev/null
kubectl -n applications create secret generic webhost-pkcs12-password --from-literal=password='Password1'
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the Web Host certificate secret'
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
