FROM nginx:alpine

COPY . /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Optional: docker build --build-arg ASSET_BUILD_ID="$(date +%s)" ... to bust caches even when sources are unchanged.
ARG ASSET_BUILD_ID=

RUN apk add --no-cache --virtual .asset-build-deps perl \
    && ASSET_BUILD_ID="${ASSET_BUILD_ID}" perl docker/hash-site-assets.pl \
    && apk del .asset-build-deps \
    && rm -rf /var/cache/apk/*

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
