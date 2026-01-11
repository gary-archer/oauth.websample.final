FROM node:24-bookworm-slim

# Copy the web host application and install its dependencies
WORKDIR /usr/webhost
COPY --chown=10001:10000 deployment/docker/webhost/dist          /usr/webhost/dist
COPY --chown=10001:10000 deployment/docker/webhost/package*.json /usr/webhost/
RUN npm install --omit=dev

# Copy the SPA's static content files
COPY --chown=10001:10000 spa/dist/favicon.ico /usr/webhost/
COPY --chown=10001:10000 spa/dist/spa/*.html  /usr/webhost/spa/
COPY --chown=10001:10000 spa/dist/spa/*.js    /usr/webhost/spa/
COPY --chown=10001:10000 spa/dist/spa/*.css   /usr/webhost/spa/

#  Run the web host as a low privilege user
RUN groupadd --gid 10000 webuser \
  && useradd --uid 10001 --gid webuser --shell /bin/bash --create-home webuser
USER 10001

CMD ["node", "dist/index.js"]
