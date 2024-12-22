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
cd "$SECRETS_FOLDER"

#
# Point to the OpenSSL configuration file
#
case "$(uname -s)" in

  Darwin)
    export OPENSSL_CONF='/System/Library/OpenSSL/openssl.cnf'
 	;;

  MINGW64*)
    export OPENSSL_CONF='C:/Program Files/Git/usr/ssl/openssl.cnf';
    export MSYS_NO_PATHCONV=1;
	;;

  Linux*)
    export OPENSSL_CONF='/usr/lib/ssl/openssl.cnf';
	;;
esac

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
  echo '*** Problem encountered creating the Root CA key'
  exit 1
fi

openssl req \
    -x509 \
    -new \
    -key "$DOMAIN.ca.key" \
    -out "$DOMAIN.ca.crt" \
    -subj "/CN=Development CA for $DOMAIN.com" \
    -addext 'basicConstraints=critical,CA:TRUE' \
    -days 3650
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the Root CA'
  exit 1
fi

#
# Create the SSL key and certificate and export to a password protected file
#
openssl ecparam -name prime256v1 -genkey -noout -out "$DOMAIN.ssl.key"
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the SSL key'
  exit 1
fi

SUBJECT_ALT_NAMES="DNS:$DOMAIN.com,DNS:api.$DOMAIN.com,DNS:login.$DOMAIN.com,DNS:www.$DOMAIN.com,DNS:bfflocal.$DOMAIN.com,DNS:logs.$DOMAIN.com"
openssl req \
    -x509 \
    -new \
    -CA "$DOMAIN.ca.crt" \
    -CAkey "$DOMAIN.ca.key" \
    -key "$DOMAIN.ssl.key" \
    -out "$DOMAIN.ssl.crt" \
    -subj "/CN=*.$DOMAIN.com" \
    -days 365 \
    -addext 'basicConstraints=critical,CA:FALSE' \
    -addext 'extendedKeyUsage=serverAuth' \
    -addext "subjectAltName=$SUBJECT_ALT_NAMES"
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the SSL certificate'
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
  echo '*** Problem encountered creating the PKCS#12 file'
  exit 1
fi

chmod 644 ./*
echo 'All certificates created successfully'
