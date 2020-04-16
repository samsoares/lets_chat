# Let's Chat
Sam's a bitch

Based service based off [**this example**](https://socket.io/get-started/chat/?fbclid=IwAR0ijrdz1Gp-EoBGZetkxaLEZvV0kkgCm5k0G8HHaC_Z3jNLwUXEBtDvdjw)

Dockerization based off [**this**](https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/)

## Run local installation instructions
1. npm i
2. nodemon (or node server.js)

## Docker

Based off [**this example**](https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/)

### Docker setup
Install docker, fucking figure it out
When you're done this should work
```
docker --version
```

### Running locally
Build the image
```
docker build -t <put something here>/node-web-app .
```

Run the image
```
docker run -p 49160:8080 -d <your username>/node-web-app
```

And you're up and running

To shut down container find name of container using
```
docker ps
```

Then run
```
docker stop <container name>
docker rm <container name>
```

### hOw Do I dOcKeR?
Get logs of container
```
docker logs <container id>
```

Get inside of container
```
docker exec -it <container id> /bin/bash
```

