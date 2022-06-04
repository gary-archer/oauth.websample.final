FROM node:16.15.0-alpine

# Copy files into our docker image and install dependencies
WORKDIR /usr/webhost
COPY spa/dist/*             /usr/webhost/spa/
COPY webhost/dist           /usr/webhost/dist
COPY webhost/package*.json  /usr/webhost/
RUN npm install --production

#  Run the Express app as a low privilege user
RUN addgroup -g 1001 webgroup
RUN adduser -u 1001 -G webgroup -h /home/webuser -D webuser
USER webuser
CMD ["npm", "run", "startRelease"]
