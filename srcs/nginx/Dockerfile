# FROM owasp/modsecurity:nginx-alpine

# #Active ModSecurity (charge le fichier recommandé depuis GitHub)
# RUN wget -O /etc/modsecurity.d/modsecurity.conf \
#     https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/modsecurity.conf-recommended && \
#     sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/' /etc/modsecurity.d/modsecurity.conf

# #Copie les règles OWASP CRS
# RUN mkdir -p /etc/modsecurity.d/owasp-crs && \
#     cd /etc/modsecurity.d/owasp-crs && \
#     wget https://github.com/coreruleset/coreruleset/archive/refs/heads/v3.3/dev.tar.gz -O - | \
#     tar -xz --strip-components=1 && \
#     cp crs-setup.conf.example crs-setup.conf

# #Inclut les règles CRS dans la config principale
# RUN echo 'Include "/etc/modsecurity.d/owasp-crs/crs-setup.conf"' >> /etc/modsecurity.d/modsecurity.conf && \
#     echo 'Include "/etc/modsecurity.d/owasp-crs/rules/*.conf"' >> /etc/modsecurity.d/modsecurity.conf
# RUN rm -rf /etc/nginx/conf.d/default.conf


# #COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf
# COPY ./config/default.conf /etc/nginx/conf.d/default.conf

# #Expose le port web
# EXPOSE 8080
# EXPOSE 8443
# EXPOSE 8000
# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]

FROM alpine:3.18

# Installer outils nécessaires pour compilation
RUN apk add --no-cache \
    build-base \
    curl \
    git \
    pcre2-dev \
    pcre2 \
    openssl-dev \
    zlib-dev \
    libxml2-dev \
    yajl-dev \
    bash \
    libtool \
    automake \
    autoconf \
    linux-headers \
    curl-dev \
    cmake \
    nginx


WORKDIR /tmp

# 1) Installer ModSecurity v3 (libmodsecurity)
RUN git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity \
    && cd ModSecurity \
    && git submodule init \
    && git submodule update \
    && ./build.sh \
    && ./configure \
    && make \
    && make install

# 2) Télécharger ModSecurity-nginx connector
RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

# 3) Télécharger et compiler Nginx avec ModSecurity module
ENV NGINX_VERSION=1.25.2

RUN curl -LO https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
    && tar zxvf nginx-${NGINX_VERSION}.tar.gz

RUN cd nginx-${NGINX_VERSION} \
    && ./configure --prefix=/etc/nginx \
        --sbin-path=/usr/sbin/nginx \
        --conf-path=/etc/nginx/nginx.conf \
        --error-log-path=/var/log/nginx/error.log \
        --http-log-path=/var/log/nginx/access.log \
        --pid-path=/var/run/nginx.pid \
        --lock-path=/var/run/nginx.lock \
        --with-http_ssl_module \
        --with-http_v2_module \
        --with-http_realip_module \
        --with-http_stub_status_module \
        --with-http_auth_request_module \
        --with-threads \
        --with-stream \
        --with-stream_ssl_module \
        --add-module=/tmp/ModSecurity-nginx \
    && make \
    && make install

# Nettoyer les sources
RUN rm -rf /tmp/*

# Copier configuration ModSecurity et CRS
RUN mkdir -p /etc/nginx/modsec /etc/nginx/crs

COPY config/modsecurity.conf /etc/nginx/modsec/modsecurity.conf

# Cloner CRS (Core Rule Set)
RUN git clone --depth 1 https://github.com/coreruleset/coreruleset.git /etc/nginx/crs

# Copier fichier rules.conf CRS de base
RUN cp /etc/nginx/crs/crs-setup.conf.example /etc/nginx/crs/crs-setup.conf

# Copier config Nginx
COPY config/nginx.conf /etc/nginx/nginx.conf

# Exposer port HTTP
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
