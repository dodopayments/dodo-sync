# Dodo Payments Sync Engine

<p align="left">
  <a href="https://www.npmjs.com/package/dodo-sync">
    <img src="https://img.shields.io/npm/v/dodo-sync?color=cb3837&label=npm&logo=npm" alt="npm version" />
  </a>
  <a href="https://discord.gg/bYqAp4ayYh">
    <img src="https://img.shields.io/discord/1305511580854779984?label=Join%20Discord&logo=discord" alt="Join Discord" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-GPLv3-blue.svg" alt="License: GPLv3" />
  </a>
</p>

Seamlessly sync your Dodo Payments data with your own database.

## Database Support

We currently support **MongoDB** and **PostgreSQL**.

We are actively working on expanding support for:
- **Databases**: Clickhouse, Snowflake, and others.
- **Pipelines**: ETL pipelines, Realtime sync.

If you'd like to contribute a new database integration, please submit a Pull Request (PR).

## Usage

You can use `dodo-sync` via the **CLI** or programmatically in your **Code**.

### 1. CLI Usage

#### Installation

```bash
npm install -g dodo-sync
# OR
bun add -g dodo-sync
```

#### Running the CLI

**Interactive Mode:**
Simply run the command without arguments to start the interactive setup wizard.
```bash
dodo-sync
```

**Manual Mode:**
Pass arguments directly to skip the wizard.
```bash
dodo-sync -i [interval] -d [database] -u [database_uri] --scopes [scopes] --api-key [api_key] --env [environment]
```

**Examples:**
```bash
# MongoDB
dodo-sync -i 600 -d mongodb -u mongodb://mymongodb.url --scopes "licences,payments,customers,subscriptions" --api-key YOUR_API_KEY --env test_mode

# PostgreSQL
dodo-sync -i 600 -d postgres -u postgresql://user:password@localhost:5432/mydb --scopes "licences,payments,customers,subscriptions" --api-key YOUR_API_KEY --env test_mode
```

#### Arguments

| Argument | Shorthand | Description | Type | Required | Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--interval` | `-i` | Sync interval in seconds. | `number` | No | `600` |
| `--database` | `-d` | Database type. | `"mongodb"` \| `"postgres"` | Yes | `mongodb` |
| `--database-uri` | `-u` | Connection URI for the database. | `string` | Yes | `mongodb://...` |
| `--scopes` | | Data entities to sync (comma-separated). | `string` | Yes | `payments,customers` |
| `--api-key` | | Your Dodo Payments API Key. | `string` | Yes | `dp_live_...` |
| `--env` | | Environment target. | `"live_mode"` \| `"test_mode"` | Yes | `test_mode` |
| `--rate-limit` | `--rl` | Rate limit in requests per second. | `number` | No | `10` |

---

### 2. Code Usage

#### Installation

```bash
npm install dodo-sync
# OR
bun add dodo-sync
```

#### Example: Automatic Sync (Interval-based)

```ts
import { DodoSync } from 'dodo-sync';

const syncDodoPayments = new DodoSync({
    interval: 60, // Sync every 60 seconds
    database: 'mongodb',
    databaseURI: process.env.MONGODB_URI, // e.g., 'mongodb://localhost:27017'
    scopes: ['licences', 'payments', 'customers', 'subscriptions'],
    dodoPaymentsOptions: {
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: 'test_mode' // or 'live_mode'
    }
});

// Initialize connection
await syncDodoPayments.init();

// Start the sync loop
syncDodoPayments.start();
```

#### Example: Manual Sync

```ts
import { DodoSync } from 'dodo-sync';

const syncDodoPayments = new DodoSync({
    database: 'mongodb',
    databaseURI: process.env.MONGODB_URI,
    scopes: ['licences', 'payments', 'customers', 'subscriptions'],
    dodoPaymentsOptions: {
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: 'test_mode'
    }
});

// Initialize connection
await syncDodoPayments.init();

// Trigger a single sync operation
await syncDodoPayments.run();
```

#### Example: PostgreSQL

```ts
import { DodoSync } from 'dodo-sync';

const syncDodoPayments = new DodoSync({
    interval: 60,
    database: 'postgres',
    databaseURI: process.env.POSTGRES_URI, // e.g., 'postgresql://user:password@localhost:5432/mydb'
    scopes: ['licences', 'payments', 'customers', 'subscriptions'],
    dodoPaymentsOptions: {
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: 'test_mode'
    }
});

await syncDodoPayments.init();
syncDodoPayments.start();
```

#### Constructor Options

| Option | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| `database` | `"mongodb"` \| `"postgres"` | Name of the database to use. | ✅ |
| `databaseURI` | `string` | Connection string for the database. | ✅ |
| `scopes` | `string[]` | Array of entities to sync (e.g., `["payments", "customers"]`). | ✅ |
| `dodoPaymentsOptions` | `object` | Dodo Payments SDK options (API key, environment). See [types](https://github.com/dodopayments/dodopayments-typescript/blob/main/src/client.ts). | ✅ |
| `interval` | `number` | Time in seconds between automatic syncs. Required for `.start()`, optional for `.run()`. | ❌ |
| `rateLimit` | `number` | Number of requests per second. | ❌ |

## Important Info

> [!IMPORTANT]
> **MongoDB**: A database named `dodopayments_sync` will be automatically created on your database server. All sync data will be stored there. This database name is currently fixed and cannot be changed.
>
> **PostgreSQL**: Tables (`Subscriptions`, `Payments`, `Licenses`, `Customers`) will be created in the database specified in your connection URI. Data is stored as JSONB.