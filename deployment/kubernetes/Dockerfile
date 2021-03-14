#
# The docker image for the Web Host
# After building, files in the image can be viewed via the below commands
# - eval $(minikube docker-env --profile api)
# - docker run -it webhost:v1 sh
#

# Use the Node docker image for the lightweight Alpine Linux OS
FROM node:15.11.0-alpine

# Install tools for troubleshooting purposes
RUN apk --no-cache add curl
RUN apk --no-cache add openssl

# Set the target folder
WORKDIR /usr/webhost

# Copy SPA files into our docker image
COPY spa/index.html                         /usr/webhost/spa/
COPY spa/loggedout.html                     /usr/webhost/spa/
COPY spa/favicon.ico                        /usr/webhost/spa/
COPY spa/css                                /usr/webhost/spa/css/
COPY spa/dist/*.js                          /usr/webhost/spa/dist/
COPY deployment/kubernetes/spa.config.json  /usr/webhost/spa/

# Copy Web Host files into our docker image
COPY webhost/dist                           /usr/webhost/dist
COPY webhost/package*.json                  /usr/webhost/
COPY webhost/tsconfig.json                  /usr/webhost/
COPY deployment/kubernetes/host.config.json /usr/webhost/

# Create a low privilege user
RUN addgroup -g 1001 webgroup
RUN adduser -u 1001 -G webgroup -h /home/webuser -D webuser

# Install production dependencies
RUN npm install --production

# Configure the Linux OS to trust the Cluster root certificate, to enable calls inside the cluster
# An example is calling a Kubernetes deployed Authorization Server at https://login.mycompany.com
COPY certs/kubernetes/internal/svc.default.cluster.local.ca.pem /usr/local/share/ca-certificates/trusted.ca.pem
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/trusted.ca.pem

# Run the Express app as the low privilege user
USER webuser
CMD ["npm", "run", "startRelease"]
