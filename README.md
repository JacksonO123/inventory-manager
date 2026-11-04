# Inventory Manager

A web application for managing the loaning of items from multiple clubs and residence halls belonging to a university. 

## Installation & Setup

### Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| [Node.js](https://nodejs.org) | 26 | The version used in CI |
| [pnpm](https://pnpm.io) | 12 | Package manager |
| [Docker](https://www.docker.com) | Any recent | Runs the local PostgreSQL database. Docker Desktop must be running. |
| [Nx](https://nx.dev) (optional) | 23 | `pnpm i -g nx` lets you type `nx ...` instead of `pnpm nx ...` |
| Bash | Any | The setup scripts are Bash. On Windows, use Git Bash. |

You also need the development secrets file (`secrets.development.json`). It holds the database credentials and OAuth keys and is not committed to the repository. Ask the project maintainer (Jackson) for a copy and place it at:

```
packages/environments/src/secrets/secrets.development.json
```

### Quick setup

Run this script to perform every setup step:

```sh
chmod +x ./scripts/setup.sh
./scripts/setup.sh
```

### Manual setup

If you did not run the above script, or a step failed, follow these steps below.

1. **Install dependencies**

   ```sh
   pnpm i
   ```

2. **Generate the Nx project graph**

   ```sh
   pnpm nx sync
   ```

3. **Set the environment.** Create a `.env` file in the repository root containing:

   ```env
   ENVIRONMENT=development
   ```

   `.env.sample` lists the other accepted values (`staging`, `production`).

4. **Distribute secrets to each app.** This writes the environment variables each project needs into that project's own `.env` file.

   ```sh
   pnpm nx setup environments
   ```

5. **Create the local database.** This starts a PostgreSQL container named `inventory_db-dev` on port 5432 and applies all migrations.

   ```sh
   chmod +x ./scripts/create-local-db.sh
   ./scripts/create-local-db.sh
   ```

### Running the app

```sh
pnpm nx dev web
```

Then open <http://localhost:3000>. The development server reloads the page automatically when you save a file.

The database container does not start automatically after a reboot. If the app cannot connect to the database, start it again:

```sh
docker start inventory_db-dev
```

### Common development commands

```sh
pnpm nx dev web        # Start the development server
pnpm test              # Run all unit tests (Jest)
pnpm lint              # Lint all projects (oxlint)
pnpm tsc               # Type-check all projects
pnpm format            # Format all projects (oxfmt)
pnpm runall            # Lint, type-check, and test in one step

pnpm nx test web       # Run tests for a single project
pnpm nx graph          # Open an interactive graph of the projects
```

### Database migrations

The database schema is defined in [packages/inventory-db-utils/src/schema.ts](packages/inventory-db-utils/src/schema.ts). After changing it:

```sh
pnpm nx migrate:generate inventory-db-utils   # Create a migration file from the schema change
pnpm nx migrate:run inventory-db-utils        # Apply pending migrations to your database
```

Migrations are managed entirely by Drizzle. Do not write or edit migration SQL by hand. Run `migrate:run` after pulling changes that include new migrations.

## Tech Stack & Architecture

### Technologies

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| Frontend | [Next.js](https://nextjs.org) 16, [React](https://react.dev) 19 |
| UI components | [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com), [Tailwind CSS](https://tailwindcss.com) 4, [Lucide](https://lucide.dev) icons |
| Forms & client state | [TanStack Form](https://tanstack.com/form), [TanStack Query](https://tanstack.com/query), [Zustand](https://zustand.docs.pmnd.rs) |
| API | [ts-rest](https://ts-rest.com) contracts, served from Next.js API routes |
| Validation | [Zod](https://zod.dev) |
| Authentication | [Better Auth](https://www.better-auth.com) with Google OAuth |
| Database | [PostgreSQL](https://www.postgresql.org) with [Drizzle ORM](https://orm.drizzle.team) |
| Monorepo tooling | [Nx](https://nx.dev), [pnpm](https://pnpm.io) workspaces |
| Quality | [Jest](https://jestjs.io), [oxlint](https://oxc.rs), oxfmt, GitHub Actions CI |

### Repository structure

The repository is an Nx monorepo. Runnable applications live in `apps/`, and shared code lives in `packages/`.

```
inventory-manager/
├── apps/
│   └── web/                  Next.js application (frontend and API)
├── packages/
│   ├── api-contracts/        API definitions and shared Zod schemas
│   ├── environments/         Secret management and per-app .env generation
│   └── inventory-db-utils/   Database schema, migrations, and connection
├── scripts/                  Setup scripts
└── .github/workflows/        Continuous integration
```

## Contributing

- Run `pnpm runall` before opening a pull request.
- Generate database migrations with Drizzle. Do not write them by hand.