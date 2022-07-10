#!/bin/bash

#######################################################
# Deploy the web host and expose it outside the cluster
#######################################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Create a configmap for the SPA's JSON configuration file
#
kubectl -n deployed delete configmap spa-config 2>/dev/null
kubectl -n deployed create configmap spa-config --from-file=../environments/spa/kubernetes-local.config.json


spa.config.json
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the SPA configmap'
  exit 1
fi

#
# Create a configmap for the Web Host's JSON configuration file
#
kubectl -n deployed delete configmap webhost-config 2>/dev/null
kubectl -n deployed create configmap webhost-config --from-file=../environments/webhost/kubernetes-local.config.json
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the Web Host configmap'
  exit 1
fi

#
# Create a secret for the private key password of the certificate file cert-manager will create
#
kubectl -n deployed delete secret webhost-pkcs12-password 2>/dev/null
kubectl -n deployed create secret generic webhost-pkcs12-password --from-literal=password='Password1'
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the Web Host certificate secret'
  exit 1
fi

#
# Trigger deployment of the web host to the Kubernetes cluster
#
kubectl -n deployed delete -f ../kubernetes/webhost.yaml 2>/dev/null
kubectl -n deployed apply  -f ../kubernetes/webhost.yaml
if [ $? -ne 0 ]; then
  echo '*** Web Host Kubernetes deployment problem encountered'
  exit 1
fi
