# Start with a base container of ubuntu 14.04 when this project is
# built it will download the base ubuntu image and apply all changes
# to that.
FROM ubuntu:14.04

# This simply identifies the maintainer of the container
MAINTAINER luz.costa@adops.com

# each `RUN` statement applies a change to the container by executing
# the command in the container. Here we first update the package manager
# Then install a few external dependencies (python, pip, git and the
# mock library).
RUN sudo apt-get update && apt-get install -y \
  curl \
  git-core \

# Install node.
RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
RUN apt-get install -y nodejs
RUN apt-get install -y npm

# Enables `node` to work, addressing how NodeJS is installed on Ubuntu.
RUN ln -s /usr/bin/nodejs /usr/bin/node

# This copies the project folder (from outside docker) into /app
# inside the container's filesystem
ADD package.json /app/package.json

# Run all commands from this folder. This is where the service will be
# located after the last step copies the files in.
WORKDIR /app

# Install dependencies.
# Note: Grunt requires installing grunt-cli globally and grunt locally.
RUN npm install -g grunt-cli
RUN npm install grunt
RUN npm install

# Prepare environment for Babel.
RUN npm install babel -g

# Adds project root to app folder.
ADD . /app

# Adds the Manifest to the container's root.
ADD Manifest /Manifest

# Make the application.
RUN npm build

# Builds the config file using env. vars and starts the server.
CMD grunt connect
