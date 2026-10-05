# Inventory manager

The inventory manager repo.

## Rules

- AI is ok for frontend, dont make it bad
- AI is ok for debugging
- AI is not recommended for backend, get good + learn something
- AI is not recommended for architecture, get good + learn something
- AI is great for tests, use it to generate tests
- AI is ok if you are ayush (prs will be reviewed more critically)
- If you generate something with ai and it does something sometimes (not ui), make ai generate a test for it

## How it works

It is an nx mono repo. Learn more generally about that here [nx](https://nx.dev/).

### Setup

Run this to get your repo setup

```sh
pnpm i
nx sync
nx setup environments
```

Run this to create local postgres db with docker. You must already have docker daemon, or docker desktop installed.

```sh
chmod +x ./create_local_db.sh
./create_local_db.sh
```

After this you are more or less good to go.

### Structure

This repo is split into two main sections: `apps`, and `packages`.

`packages` are for common utilities, shared things, or things that belong in packages.

Things as of writing this readme:

#### api-contracts

Defines `ts-rest` contracts for api shapes and validators. Invalidates tons of bugs, makes backend easy etc.

#### environments

The util for handling all secrets and distributing them to the correct projects. If you are interested in it def talk to me about it.

This is the home for the actual secret files that contain things like db urls/passwords, server urls, tokens, etc. the root `.env` is for project environment things such as configuring `development`, `staging`, `production` environment locally, things like that.

`environments` package has configuration for what secrets belong to what projects, its all typesafe and zod validated. You have already seen the env var distributing script:

```
nx setup environments
```

This setup script writes the env vars that specific project needs into its own local `.env`. Projects like `web` are sensitive and could leak secrets since they are client facing, so having nextjs only deal with the `.env` contents that we specifically want is safest. Then within the `web` project, this is then made more strict, but on to that later.

Projects that are not sensitive to owning secrets can import them from the correct module location in `environments`, there are no projects like that to point to as an example at the time of writing this readme, so just imagine something importing secrets idk.

This package also has a util for protecting secrets for nextjs. This is roughly how that works:

- you define the schema of which secrets belong on client or server
- you provide a combined object that sets the values of all of the secrets from the process.env that nextjs already parsed together
- client secrets are accessible on server, server secrets are NOT accessible on client and throw an error when trying to access
- see example in `apps/web/src/env.ts`

#### inventory-db-utils

Where db schemas, migrations, connection utils etc are stored.

### DB

This project uses a postgres db. See above for creating a local one.

I recommend you use some program for inspecting databases. Personally I use `pgAdmin`. `DBeaver` is another popular one. Up to you. Super useful.

DB migrations are handled completely by drizzle, do not go off and do manual migrations, create migration files yourself etc.

To create a custom migration, read the docs its something like `pnpx drizzle-kit generate --custom --name=seed-initial-users`. This should not be common. Your migrations should be pretty simple most of the time.

Sql migration files are tracked in `packages/inventory-db-utils/migrations/`. Schema is defined in `packages/inventory-db-utils/src/schema.ts`.

### Important to note

This section has some things that are good too know, may solve problems you can have.

1. To build the web app, you must have an active dev environment for it with `nx dev web`. The reason is because nextjs pre renders data that it fetches in server components, and the api it relies on is its own server. So it must be running in order to build it. Kinda funny, good to know
