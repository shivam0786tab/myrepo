<<<<<<< HEAD
FROM node:20
=======
FROM node:latest
>>>>>>> 8f7dd89 (ec2-docker-app-with-mysql')

WORKDIR /myapp

COPY . .

RUN npm install

EXPOSE 3000

<<<<<<< HEAD
CMD [ "npm" , "start" ]
=======
CMD ["node" , "server.js"]
>>>>>>> 8f7dd89 (ec2-docker-app-with-mysql')
