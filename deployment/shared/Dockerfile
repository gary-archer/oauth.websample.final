FROM node:18.15.0-bullseye

# Copy the web host application and install its dependencies
WORKDIR /usr/webhost
COPY webhost/dist               /usr/webhost/dist
COPY webhost/package*.json      /usr/webhost/
RUN npm install --production

# Copy the shell app's static content files
COPY spa/shellapp/dist/*.html       /usr/webhost/shellapp/
COPY spa/shellapp/dist/*.bundle.js  /usr/webhost/shellapp/
COPY spa/shellapp/dist/*.css        /usr/webhost/shellapp/
COPY spa/shellapp/dist/*.ico        /usr/webhost/shellapp/

# Copy the demo app's static content files
COPY spa/demoapp/dist/*.html        /usr/webhost/demoapp/
COPY spa/demoapp/dist/*.bundle.js   /usr/webhost/demoapp/
COPY spa/demoapp/dist/*.css         /usr/webhost/demoapp/

#  Run the web host as a low privilege user
RUN groupadd --gid 10000 webuser \
  && useradd --uid 10001 --gid webuser --shell /bin/bash --create-home webuser
USER 10001
CMD ["node", "dist/app.js"]
