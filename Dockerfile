FROM node:20-bookworm-slim

# Copy the web host application and install its dependencies
WORKDIR /usr/webhost
COPY webhost/dist               /usr/webhost/dist
COPY webhost/package*.json      /usr/webhost/
RUN npm install --production

# Copy the SPA's static content files
COPY favicon.ico        /usr/webhost/
COPY dist/*.html        /usr/webhost/spa/
COPY dist/*.bundle.js   /usr/webhost/spa/
COPY dist/*.css         /usr/webhost/spa/

#  Run the web host as a low privilege user
RUN groupadd --gid 10000 webuser \
  && useradd --uid 10001 --gid webuser --shell /bin/bash --create-home webuser
USER 10001
CMD ["node", "dist/app.js"]
