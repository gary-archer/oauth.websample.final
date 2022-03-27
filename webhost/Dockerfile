#
# The docker image for the Web Host
# After building, files in the image can be viewed via the below command:
# - docker run -it webhost:v1 sh
#

# Use the Node docker image for the lightweight Alpine Linux OS
FROM node:16.6.0-alpine

# Set the target folder
WORKDIR /usr/webhost

# Copy SPA and Web Host files into our docker image
COPY spa/dist/*             /usr/webhost/spa/
COPY webhost/dist           /usr/webhost/dist
COPY webhost/package*.json  /usr/webhost/

# Install production dependencies
RUN npm install --production

# Configure the Linux OS to trust the root certificate
COPY webhost/trusted.ca.pem /usr/local/share/ca-certificates/trusted.ca.pem
RUN apk --no-cache add ca-certificates
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/trusted.ca.pem

#  Run the Express app as a low privilege user
RUN addgroup -g 1001 webgroup
RUN adduser -u 1001 -G webgroup -h /home/webuser -D webuser
USER webuser
CMD ["npm", "run", "startRelease"]
