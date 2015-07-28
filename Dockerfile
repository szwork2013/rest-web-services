# This image will be based on the oficial nodejs docker image
FROM node:latest

# Set in what directory commands will run
WORKDIR /home/api

ADD package.json /home/api/package.json

RUN npm install

ADD . /home/api

# Tell Docker we are going to use this port
EXPOSE 443

# The command to run our app when the container is run
CMD ["node bin/main"]

