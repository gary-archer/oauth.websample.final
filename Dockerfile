FROM node:22-bookworm-slim

# Copy the web host application and install its dependencies
WORKDIR /usr/webhost
COPY deployment/docker/webhost/dist          /usr/webhost/dist
COPY deployment/docker/webhost/package*.json /usr/webhost/
RUN npm install --omit=dev

# Copy the SPA's static content files
COPY dist/favicon.ico       /usr/webhost/
COPY dist/spa/*.html        /usr/webhost/spa/
COPY dist/spa/*.bundle.js   /usr/webhost/spa/
COPY dist/spa/*.css         /usr/webhost/spa/

#  Run the web host as a low privilege user
RUN groupadd --gid 10000 webuser \
  && useradd --uid 10001 --gid webuser --shell /bin/bash --create-home webuser
USER 10001
CMD ["node", "dist/app.js"]
