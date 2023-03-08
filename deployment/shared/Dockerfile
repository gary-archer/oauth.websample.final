FROM node:18.1.0-bullseye

# Configure trusted root certificate authorities
ARG TRUSTED_CA_CERTS
COPY $TRUSTED_CA_CERTS /usr/local/share/certificates/trusted.ca.crt
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS='/usr/local/share/certificates/trusted.ca.crt'

# Copy web host files into our docker image and install dependencies
WORKDIR /usr/webhost
COPY webhost/dist           /usr/webhost/dist
COPY webhost/package*.json  /usr/webhost/
RUN npm install --production

# Copy the shell app's static content files onto the web host
COPY dist/shellapp/*.html       /usr/webhost/shellapp/
COPY dist/shellapp/*.js         /usr/webhost/shellapp/
COPY dist/shellapp/*.ico        /usr/webhost/shellapp/

# Copy the demo app's static content files onto the web host
COPY dist/demoapp/*.html        /usr/webhost/demoapp/
COPY dist/demoapp/*.bundle.js   /usr/webhost/demoapp/
COPY dist/demoapp/*.css         /usr/webhost/demoapp/

#  Run the Express app as a low privilege user
RUN adduser --disabled-password --home /home/webuser --gecos '' webuser
USER webuser

# Work around openssl and node.js compatibility in some setups
# https://github.com/nodejs/node/issues/40672
CMD ["node", "--openssl-legacy-provider", "dist/app.js"]
