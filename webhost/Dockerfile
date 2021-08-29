#
# The docker image for the Web Host
# After building, files in the image can be viewed via the below commands
# - docker run -it webhost:1.0.0 sh
#

# Use the Node docker image for the lightweight Alpine Linux OS
FROM node:16.6.0-alpine

# Install tools for troubleshooting purposes
RUN apk --no-cache add curl
# RUN apk --no-cache add openssl

# Set the target folder
WORKDIR /usr/webhost

# Copy SPA files into our docker image
COPY oauth.websample.final/spa/index.html              /usr/webhost/spa/
COPY oauth.websample.final/spa/loggedout.html          /usr/webhost/spa/
COPY oauth.websample.final/spa/favicon.ico             /usr/webhost/spa/
COPY oauth.websample.final/spa/css                     /usr/webhost/spa/css/
COPY oauth.websample.final/spa/dist/*.js               /usr/webhost/spa/dist/

# Copy Web Host files into our docker image
COPY oauth.websample.final/webhost/dist                /usr/webhost/dist
COPY oauth.websample.final/webhost/package*.json       /usr/webhost/

# Install production dependencies
RUN npm install --production

# Configure the Linux OS to trust the root certificate, to enable HTTPS calls inside the cluster if required
COPY certs/docker-internal/mycompany.internal.ca.pem /usr/local/share/ca-certificates/trusted.ca.pem
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/trusted.ca.pem

#  Run the Express app as a low privilege user
RUN addgroup -g 1001 webgroup
RUN adduser -u 1001 -G webgroup -h /home/webuser -D webuser
USER webuser
CMD ["npm", "run", "startRelease"]
