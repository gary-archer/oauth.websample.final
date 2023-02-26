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

# Copy SPA static content files onto the web host
COPY spa/dist/*.bundle.js   /usr/webhost/demoapp/
COPY spa/dist/*.css         /usr/webhost/demoapp/
COPY spa/dist/*.html        /usr/webhost/demoapp/
COPY spa/dist/*.ico         /usr/webhost/demoapp/

#  Run the Express app as a low privilege user
RUN adduser --disabled-password --home /home/webuser --gecos '' webuser
USER webuser
CMD ["node", "dist/app.js"]
