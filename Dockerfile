FROM node:16-alpine
WORKDIR app
COPY packages/manager/dist .
COPY packages/manager/package.json .
COPY yarn.lock .
COPY packages/dashboard/build ./static
RUN yarn install --frozen-lockfile
CMD node main
