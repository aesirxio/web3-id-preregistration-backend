# web3-id-preregistration-backend

## Excerpt

Backend for the pre-registration and share2earn of web3 id. Essentially it's a Node application built using [Express](https://expressjs) and [MongoDB](https://www.mongodb.com) which is also capable of operating with the [Concordium](https://concordium.com) network using a [JSON-RPC Proxy server](https://github.com/Concordium/concordium-json-rpc) to access the network.

## Prerrequisites

- [Docker](https://www.docker.com/get-started/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Setup

1. Clone the `.env.dist` file in the root folder fo this project as `.env` and customize your own environment. Typically the most important considerations are:

- **WEB_PORT**: so it doesn't conflict with port 80 or other port in your environment.
- **USER_ID** and **GROUP_ID**: so the node container matches your own user in case you're using Linux or Mac. In Mac, typically you want to use 0 (root) because that's how Docker Desktop works. In Linux it's better to match your own UID/GID.

1. In the `api` folder clone the `.env.dist` file into `.env` in the same folder. In addition to the essential DB information (which can be left without customization) you will also need information from the JSON-RPC server and the [Smart Contract](https://github.com/aesirxio/web3-demo-smart-contract) being used (which has to be deployed already), specifically:

- **CONCORDIUM_NODE**: You need a working URL of a JSON-RPC proxy server to a Concordium node (mainnet or testnet).
- **CONCORDIUM_PORT**: Specify the working port of the previous server.

1. In case the DB credentials were changed, specify them in the [init/mongo-init.js](init/mongo-init.js) file to reflect the changes.
1. Once you are done execute the `docker compose up -d` command to start the compose file.

# Troubleshoot

If for some reason the http port (specified as **WEB_PORT** in the first `.env` file) is not responding, it could be because the database was not initialized. In this case access the mongo instance (or connect remotely to the port 27017 of your localhost using mongosh) create the database and restart the docker compose by executing `docker compose down` and `docker compose up -d` again.
