#!/bin/bash

###########################################################################################
# Use OpenSSL to create a wildcard SSL certificate for the blog's local code sample domains
###########################################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Initialize
#
DOMAIN="authsamples-dev"
PRIVATE_KEY_PASSWORD='Password1'
EXTFILE="$(readlink -f extensions.cnf)"
cd "$SECRETS_FOLDER"

#
# Handle Git bash on Windows
#
if [[ "$(uname -s)" == MINGW64* ]]; then
  export MSYS_NO_PATHCONV=1
fi

#
# Require OpenSSL 3 so that up to date syntax can be used
#
OPENSSL_VERSION_3="$(openssl version | grep 'OpenSSL 3')"
if [ "$OPENSSL_VERSION_3" == '' ]; then
  echo 'Please install openssl version 3 or higher before running this script'
  exit 1
fi

#
# Create the root private key and certificate file
#
openssl ecparam -name prime256v1 -genkey -noout -out "$DOMAIN.ca.key"
if [ $? -ne 0 ]; then
  echo 'Problem encountered creating the Root CA key'
  exit 1
fi

openssl req \
    -x509 \
    -new \
    -key "$DOMAIN.ca.key" \
    -out "$DOMAIN.ca.crt" \
    -subj "/CN=Development CA for $DOMAIN.com" \
    -days 3650
if [ $? -ne 0 ]; then
  echo 'Problem encountered creating the Root CA'
  exit 1
fi

#
# Create the SSL key and certificate and export to a password protected file
#
openssl ecparam -name prime256v1 -genkey -noout -out "$DOMAIN.ssl.key"
if [ $? -ne 0 ]; then
  echo 'Problem encountered creating the SSL key'
  exit 1
fi

openssl req \
    -new \
    -key $DOMAIN.ssl.key \
    -out $DOMAIN.ssl.csr \
    -subj "/CN=*.$DOMAIN.com"
if [ $? -ne 0 ]; then
  echo 'Problem encountered creating the certificate signing request'
  exit 1
fi

openssl x509 -req \
    -in "$DOMAIN.ssl.csr" \
    -CA "$DOMAIN.ca.crt" \
    -CAkey "$DOMAIN.ca.key" \
    -out "$DOMAIN.ssl.crt" \
    -sha256 \
    -days 365 \
    -extfile "$EXTFILE" \
    -extensions server_ext
if [ $? -ne 0 ]; then
  echo 'Problem encountered creating the SSL certificate'
  exit 1
fi

openssl pkcs12 \
    -export \
    -inkey "$DOMAIN.ssl.key" \
    -in "$DOMAIN.ssl.crt" \
    -name "*.$DOMAIN.com" \
    -out "$DOMAIN.ssl.p12" \
    -passout "pass:$PRIVATE_KEY_PASSWORD"
if [ $? -ne 0 ]; then
  echo 'Problem encountered creating the PKCS#12 file'
  exit 1
fi

rm ./*.csr
chmod 644 ./*
echo 'All certificates created successfully'
