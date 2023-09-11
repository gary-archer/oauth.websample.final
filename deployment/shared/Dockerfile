FROM node:18.15.0-bullseye

# Copy the web host application and install its dependencies
WORKDIR /usr/webhost
COPY webhost/dist               /usr/webhost/dist
COPY webhost/package*.json      /usr/webhost/
RUN npm install --production

# Copy the shell application's static content files
COPY shell/dist/*.html  /usr/webhost/shell/
COPY shell/dist/*.mjs   /usr/webhost/shell/
COPY shell/dist/*.css   /usr/webhost/shell/
COPY shell/dist/*.ico   /usr/webhost/shell/

# Copy the SPA's static content files
COPY spa/dist/*.html        /usr/webhost/spa/
COPY spa/dist/*.bundle.js   /usr/webhost/spa/
COPY spa/dist/*.css         /usr/webhost/spa/

#  Run the web host as a low privilege user
RUN groupadd --gid 10000 webuser \
  && useradd --uid 10001 --gid webuser --shell /bin/bash --create-home webuser
USER 10001
CMD ["node", "dist/app.js"]
