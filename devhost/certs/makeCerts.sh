#!/bin/bash

#**************************************************************************************
# A script to use OpenSSL to create self signed certificates in a cross platform manner
# Run in a MacOS terminal or in Git Bash on Windows
#**************************************************************************************

#
# Fail on first error
#
set -e

#
# Point to the OpenSsl configuration file for the platform
#
case "$(uname -s)" in

  # Mac OS
  Darwin)
    export OPENSSL_CONF='/System/Library/OpenSSL/openssl.cnf'
 	;;

  # Windows with Git Bash
  MINGW64*)
    export OPENSSL_CONF='C:/Program Files/Git/usr/ssl/openssl.cnf';
    export MSYS_NO_PATHCONV=1;
	;;
esac

#
# Root certificate parameters
#
ROOT_CERT_FILE_PREFIX='mycompany.ca'
ROOT_CERT_DESCRIPTION='My Company Root Certification Authority'

#
# SSL certificate parameters
#
SSL_CERT_FILE_PREFIX='mycompany.ssl'
SSL_CERT_PASSWORD='SslPassword1'
WILDCARD_DOMAIN_NAME='*.mycompany.com'

#
# Create the root certificate public + private key protected by a passphrase
#
openssl genrsa -out $ROOT_CERT_FILE_PREFIX.key 2048
echo '*** Successfully created Root CA key'

#
# Create the public key root certificate file
#
openssl req -x509 \
            -new \
			-nodes \
   			-key $ROOT_CERT_FILE_PREFIX.key \
			-out $ROOT_CERT_FILE_PREFIX.pem \
			-subj "/CN=$ROOT_CERT_DESCRIPTION" \
			-reqexts v3_req \
			-extensions v3_ca \
			-sha256 \
			-days 365
echo '*** Successfully created Root CA'

#
# Create the SSL key
#
openssl genrsa -out $SSL_CERT_FILE_PREFIX.key 2048
echo '*** Successfully created SSL key'

#
# Create the certificate signing request file
#
openssl req \
            -new \
			-key $SSL_CERT_FILE_PREFIX.key \
			-out $SSL_CERT_FILE_PREFIX.csr \
			-subj "/CN=$WILDCARD_DOMAIN_NAME"
echo '*** Successfully created SSL certificate signing request'

#
# Create the SSL certificate and private key
#
openssl x509 -req \
			-in $SSL_CERT_FILE_PREFIX.csr \
			-CA $ROOT_CERT_FILE_PREFIX.pem \
			-CAkey $ROOT_CERT_FILE_PREFIX.key \
			-CAcreateserial \
			-out $SSL_CERT_FILE_PREFIX.pem \
			-sha256 \
			-days 365 \
			-extfile extended/server.ext
echo '*** Successfully created SSL certificate'

#
# Export it to a deployable PKCS#12 file that is password protected
#
openssl pkcs12 \
			-export -inkey $SSL_CERT_FILE_PREFIX.key \
			-in $SSL_CERT_FILE_PREFIX.pem \
			-name $WILDCARD_DOMAIN_NAME \
			-out $SSL_CERT_FILE_PREFIX.p12 \
			-passout pass:$SSL_CERT_PASSWORD
echo '*** Successfully exported SSL certificate to a PKCS#12 file'
