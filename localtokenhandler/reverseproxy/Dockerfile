FROM kong:2.8.1-alpine

USER root
RUN git config --global url."https://".insteadOf git:// && \
    git config --global advice.detachedHead false && \
    luarocks install kong-oauth-proxy

USER kong
