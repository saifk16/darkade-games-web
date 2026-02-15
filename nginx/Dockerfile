FROM nginx:alpine

COPY ./nginx.conf.template /etc/nginx/templates/default.conf.template

# https://www.reddit.com/r/docker/comments/j4g61h/comment/g7o7fwo/
COPY ./certs/nginx.crt /etc/ssl/nginx.crt
COPY ./certs/nginx.key /etc/ssl/nginx.key

# COPY ./nginx.conf /etc/nginx/nginx.conf

# https://serverfault.com/a/1115466
# COPY ./nginx.template /etc/nginx/templates/10-variables.conf.template