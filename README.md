# FEM Viewer

A web application for viewing Fractal Enterprise Models (FEM).

## Project Structure

This project uses a monorepo structure with the following packages:

- **packages/types**: Core domain model type definitions shared between frontend and backend
- **packages/parser**: XML parsing functionality for FEM models
- **packages/client**: Frontend React application
- **packages/server**: Backend Express server

## Hardware requirements

- At least 1 GB of RAM
- At least 1 vCPU
- At least 25 GB of storage

## Installation

Before installing the application, Node.js version >=22.0.0 should be installed together with a package manager. Yarn is recommended as it was used during development. In addition, a MySQL database connection credentials are required.

Steps to setup the application:

- Create a **.env** file in the **fem-viewer/packages/server** folder. (Required fields are in **.env.example**)
- Install node packages in the **fem-viewer** directory:

```console
$ yarn install
```

The following steps should be done in the **fem-viewer/packages/server** directory.

- Generate a database client

```console
$ yarn prisma generate
```

- Run migrations

```console
$ yarn prisma migrate reset
```

## Starting the application

To start a **production build** run:

```console
$ yarn build
$ yarn start
```

in the **fem-viewer** directory.

**Warning**: The production build requires HTTPS for cookies. For running the production build without requiring HTTPS, set ALLOW_HTTP to true in the server .env file.

To start a **development build** run:

```console
# Start frontend and backend together
$ yarn start:dev:all

# Or start them separately
$ cd packages/client && yarn start:dev
$ cd packages/server && yarn start:dev
```

## Running a docker database

In the **fem-viewer** directory:

```console
$ yarn db:start
```

## Creating an initial user

To create an initial admin user, in the **fem-viewer/packages/server** directory run:

```console
$ yarn user:create -u [username] -p [password] -r ADMIN
```

## Development Workflow

```bash
# Build all packages
yarn build

# Build specific packages
yarn build:types
yarn build:parser
yarn build:client
yarn build:server
```

## License

MIT

Link to user manual: https://github.com/JoonatanEhlvest/FEM/blob/master/fem-viewer/docs/user_manual.md
