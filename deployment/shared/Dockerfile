FROM node:18.1.0-bullseye

# Configure trusted root certificate authorities
ARG TRUSTED_CA_CERTS
COPY $TRUSTED_CA_CERTS /usr/local/share/certificates/trusted.ca.crt
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS='/usr/local/share/certificates/trusted.ca.crt'

# Copy the web host application and install its dependencies
WORKDIR /usr/webhost
COPY webhost/dist               /usr/webhost/dist
COPY webhost/package*.json      /usr/webhost/
RUN npm install --production

# Copy the shell app's static content files
COPY shellapp/dist/*.html       /usr/webhost/shellapp/
COPY shellapp/dist/*.js         /usr/webhost/shellapp/
COPY shellapp/dist/*.css        /usr/webhost/shellapp/
COPY shellapp/dist/*.ico        /usr/webhost/shellapp/

# Copy the demo app's static content files
COPY demoapp/dist/*.html        /usr/webhost/demoapp/
COPY demoapp/dist/*.bundle.js   /usr/webhost/demoapp/
COPY demoapp/dist/*.css         /usr/webhost/demoapp/

#  Run the web host as a low privilege user
RUN adduser --disabled-password --home /home/webuser --gecos '' webuser
USER webuser

# Work around openssl and node.js compatibility in some setups
# https://github.com/nodejs/node/issues/40672
CMD ["node", "--openssl-legacy-provider", "dist/app.js"]
