#!/bin/bash
set -e

#**************************************************************************************
# A script to use OpenSSL to create self signed certificates in a cross platform manner
# Use chmod makeCerts.sh to make it executable if required
#**************************************************************************************

#
# Open SSL configuration
#
export OPENSSL_CONF='/System/Library/OpenSSL/openssl.cnf'

#
# Root certificate parameters
#
ROOT_CERT_DESCRIPTION='My Company Root Certification Authority'
ROOT_CERT_DOMAIN_NAME='mycompany.ca'
ROOT_CERT_PASSWORD=RootPassword1

#
# SSL certificate parameters
#
SSL_CERT_FILE_NAME='mycompany.ssl'
SSL_CERT_PASSWORD='SslPassword1'
WILDCARD_DOMAIN_NAME='*.mycompany.com'

#
# Create the root certificate public + private key protected by a passphrase
#
echo 'START'
openssl genrsa -out $ROOT_CERT_DOMAIN_NAME.key 2048 -passout pass:$ROOT_CERT_PASSWORD
echo '*** Successfully created Root CA key'

#
# Create the public key root certificate file
#
openssl req -x509 \
            -new \
			-nodes \
  			-key $ROOT_CERT_DOMAIN_NAME.key \
			-out $ROOT_CERT_DOMAIN_NAME.crt \
			-subj "/CN=$ROOT_CERT_DESCRIPTION" \
			-reqexts v3_req \
			-extensions v3_ca \
			-sha256 \
			-days 365
echo '*** Successfully created Root CA'

#
# Create the certificate public + private key
#
openssl genrsa -out $SSL_CERT_FILE_NAME.key 2048 -passout pass:$SSL_CERT_PASSWORD
echo '*** Successfully created SSL key'

#
# Create the certificate signing request file
#
openssl req \
            -new \
			-key $SSL_CERT_FILE_NAME.key \
			-out $SSL_CERT_FILE_NAME.csr \
			-subj "/CN=$WILDCARD_DOMAIN_NAME"
echo '*** Successfully created SSL certificate signing request'

#
# Create the SSL certificate
#
openssl x509 -req \
			-in $SSL_CERT_FILE_NAME.csr \
			-CA $ROOT_CERT_DOMAIN_NAME.crt \
			-CAkey $ROOT_CERT_DOMAIN_NAME.key \
			-CAcreateserial \
			-out $SSL_CERT_FILE_NAME.crt \
			-sha256 \
			-days 365 \
			-extfile extended/server.ext
echo '*** Successfully created SSL certificate'

#
# Export it to a PFX file if required
#
openssl pkcs12 \
			-export -inkey $SSL_CERT_FILE_NAME.key \
			-in $SSL_CERT_FILE_NAME.crt \
			-name $WILDCARD_DOMAIN_NAME \
			-out $SSL_CERT_FILE_NAME.pfx \
			-passout pass:$SSL_CERT_PASSWORD
echo '*** Successfully exported SSL certificate'