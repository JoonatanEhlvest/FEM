## Hardware requirements

-   At least 1 GB of RAM
-   At least 1 vCPU
-   At least 25 GB of storage

## Installation

Before installing the application, Node.js version >=16.14.0 should be installed together with a package manager. Yarn is recommended as it was used during development. In addition, a MySQL database connection credentials are required.

Steps to setup the application:

-   Create a **.env** file in the server folder. (Required fields are in **.env.example**)
-   Install node packages in **fem-viewer** and **fem-viewer/server** using:

```console
$ yarn install
```

The following steps should be done in the **fem-viewer/server** directory.

-   Generate a database client

```console
$ yarn prisma generate
```

-   Run migrations

```console
$ yarn prisma migrate reset
```

## Starting the application

To start a **production build** run:

```console
$ yarn start
```

in the **fem-viewer** directory

To start a **development build** run:

```console
$ yarn start:dev
```

in both the **fem-viewer** and **fem-viewer/server** directories

Link to user manual: https://github.com/siimlangel/FEM/tree/master/fem-viewer
