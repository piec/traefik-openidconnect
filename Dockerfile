FROM node:14-alpine

WORKDIR /app

ADD package.json package-lock.json /app/
RUN npm install

ADD . /app
RUN cd node_modules && patch -p1 < ../my.patch

ENTRYPOINT []
CMD node index.js
