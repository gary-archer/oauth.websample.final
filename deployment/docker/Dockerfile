FROM node:24-trixie-slim

# Copy the web host application and install its dependencies
WORKDIR /usr/webhost
COPY --chown=10001:10000 deployment/docker/dist          /usr/webhost/dist
COPY --chown=10001:10000 deployment/docker/package*.json /usr/webhost/
RUN npm install --omit=dev

# Copy the SPA's static content files
COPY --chown=10001:10000 dist/favicon.ico /usr/webhost/
COPY --chown=10001:10000 dist/*.html      /usr/webhost/spa/
COPY --chown=10001:10000 dist/*.js        /usr/webhost/spa/
COPY --chown=10001:10000 dist/*.css       /usr/webhost/spa/

#  Run the web host as a low privilege user
RUN groupadd --gid 10000 webuser \
  && useradd --uid 10001 --gid webuser --shell /bin/bash --create-home webuser
USER 10001

CMD ["node", "dist/index.js"]
