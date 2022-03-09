#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Point to the OpenSSL configuration file for the platform
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
ROOT_CERT_FILE_PREFIX='../mycompany.ca'

#
# SSL certificate parameters
#
SSL_CERT_NAME='webauthsamples-dev'
SSL_DOMAIN_NAME="$SSL_CERT_NAME.com"
SSL_CERT_FILE_PREFIX="$SSL_CERT_NAME.ssl"
SSL_CERT_PASSWORD='Password1'

#
# Create the SSL keypair
#
openssl genrsa -out $SSL_CERT_FILE_PREFIX.key 2048
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the SSL key'
  exit 1
fi

#
# Create the certificate signing request for a wildcard certificate
#
openssl req \
    -new \
    -key $SSL_CERT_FILE_PREFIX.key \
    -out $SSL_CERT_FILE_PREFIX.csr \
    -subj "/CN=$WILDCARD_DOMAIN_NAME"
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the SSL certificate signing request'
  exit 1
fi

#
# Create the SSL certificate, which must have a limited lifetime
#
openssl x509 -req \
    -in $SSL_CERT_FILE_PREFIX.csr \
    -CA $ROOT_CERT_FILE_PREFIX.pem \
    -CAkey $ROOT_CERT_FILE_PREFIX.key \
    -CAcreateserial \
    -out $SSL_CERT_FILE_PREFIX.pem \
    -sha256 \
    -days 365 \
    -extfile server.ext
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the SSL certificate'
  exit 1
fi

#
# Export it to a deployable PKCS#12 file that is password protected
#
openssl pkcs12 \
    -export -inkey $SSL_CERT_FILE_PREFIX.key \
    -in $SSL_CERT_FILE_PREFIX.pem \
    -name $SSL_DOMAIN_NAME \
    -out $SSL_CERT_FILE_PREFIX.p12 \
    -passout pass:$SSL_CERT_PASSWORD
if [ $? -ne 0 ]; then
  echo '*** Problem encountered creating the PKCS#12 file'
  exit 1
fi

#
# Delete files no longer needed
#
rm "$SSL_CERT_NAME.ssl.csr"
echo 'All certificates created successfully'
