FROM node:16.17.0-bullseye

# Copy web host files into our docker image and install dependencies
WORKDIR /usr/webhost
COPY webhost/dist           /usr/webhost/dist
COPY webhost/package*.json  /usr/webhost/
RUN npm install --production

# Copy SPA static content files onto the web host
COPY spa/dist/*.bundle.js   /usr/webhost/spa/
COPY spa/dist/*.css         /usr/webhost/spa/
COPY spa/dist/*.html        /usr/webhost/spa/
COPY spa/dist/*.ico         /usr/webhost/spa/

#  Run the Express app as a low privilege user
RUN adduser --disabled-password --home /home/webuser --gecos '' webuser
USER webuser
CMD ["npm", "run", "startRelease"]
