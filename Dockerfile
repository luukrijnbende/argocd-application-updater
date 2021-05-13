# Use the Alpine image as base.
FROM node:14-alpine
# Install Git.
RUN apk --no-cache add git
# Change the working directory.
WORKDIR /home/node
# Bundle the application.
COPY node_modules ./node_modules
COPY dist ./dist
COPY package*.json ./
# Link the application to make the command available globally.
RUN npm link
# Use a non-root user, in this case node.
USER node
