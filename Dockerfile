FROM node:22.9.0 as build
WORKDIR /workspace/app

COPY * .
COPY public public
COPY src src
RUN npm install
RUN npm run build-only


FROM nginx:latest
ARG DEPENDENCY=/workspace/app/dist
CMD mkdir /app
COPY --from=build ${DEPENDENCY}/ /app
COPY nginx.conf /etc/nginx/conf.d/default.conf
