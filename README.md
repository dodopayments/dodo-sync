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

We currently support **MongoDB**, **PostgreSQL**, **MySQL** (≥ 8.0.20), and **ClickHouse**.

We are actively working on expanding support for:
- **Databases**: Snowflake and others.
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

# MySQL
dodo-sync -i 600 -d mysql -u mysql://user:password@localhost:3306/mydb --scopes "licences,payments,customers,subscriptions" --api-key YOUR_API_KEY --env test_mode

# ClickHouse
dodo-sync -i 600 -d clickhouse -u http://localhost:8123 --scopes "licences,payments,customers,subscriptions" --api-key YOUR_API_KEY --env test_mode
```

#### Arguments

| Argument | Shorthand | Description | Type | Required | Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--interval` | `-i` | Sync interval in seconds. | `number` | No | `600` |
| `--database` | `-d` | Database type. | `"mongodb"` \| `"postgres"` \| `"mysql"` \| `"clickhouse"` | Yes | `mongodb` |
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

#### Example: Manual Sync (Serverless / On-Demand)

```ts
import { DodoSync } from 'dodo-sync';

const syncDodoPayments = new DodoSync({
    database: 'postgres',
    databaseURI: process.env.POSTGRES_URI,
    scopes: ['licences', 'payments', 'customers', 'subscriptions'],
    dodoPaymentsOptions: {
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: 'live_mode'
    }
});

try {
    // Initialize connection
    await syncDodoPayments.init();

    // Trigger a single sync operation (batch inserts are awaited)
    await syncDodoPayments.run();
} finally {
    // Cleanly close the database connection
    await syncDodoPayments.disconnect();
}
```

#### Serverless (Vercel / AWS Lambda) Tips

When running on-demand syncs in serverless functions (e.g. Next.js App Router):
- **Set function timeout**: Syncing large datasets can take longer than the 15-second default timeout. Add `export const maxDuration = 60;` (or up to 300 on Vercel Pro).
- **Use Node.js runtime**: Ensure `export const runtime = 'nodejs';` is set (Edge runtime lacks native TCP socket support for databases).
- **Scope granularity**: For faster invocations, sync scopes individually (e.g. `scopes: ['payments']`).
- **Clean teardown**: Always call `await syncDodoPayments.disconnect()` in a `finally` block to prevent lingering database connections across container cold/warm starts.


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

#### Example: MySQL

```ts
import { DodoSync } from 'dodo-sync';

const syncDodoPayments = new DodoSync({
    interval: 60,
    database: 'mysql',
    databaseURI: process.env.MYSQL_URI, // e.g., 'mysql://user:password@localhost:3306/mydb'
    scopes: ['licences', 'payments', 'customers', 'subscriptions'],
    dodoPaymentsOptions: {
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: 'test_mode'
    }
});

await syncDodoPayments.init();
syncDodoPayments.start();
```

#### Example: ClickHouse

```ts
import { DodoSync } from 'dodo-sync';

const syncDodoPayments = new DodoSync({
    interval: 60,
    database: 'clickhouse',
    databaseURI: process.env.CLICKHOUSE_URI, // e.g., 'http://localhost:8123'
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
| `database` | `"mongodb"` \| `"postgres"` \| `"mysql"` \| `"clickhouse"` | Name of the database to use. | ✅ |
| `databaseURI` | `string` | Connection string for the database. | ✅ |
| `scopes` | `string[]` | Array of entities to sync (e.g., `["payments", "customers"]`). | ✅ |
| `dodoPaymentsOptions` | `object` | Dodo Payments SDK options (API key, environment). See [types](https://github.com/dodopayments/dodopayments-typescript/blob/main/src/client.ts). | ✅ |
| `interval` | `number` | Time in seconds between automatic syncs. Required for `.start()`, optional for `.run()`. | ❌ |
| `rateLimit` | `number` | Number of requests per second. | ❌ |

## Important Info

> [!IMPORTANT]
> **MongoDB**: Collections (`subscriptions`, `payments`, `licences`, `customers`) will be created in the database specified in your connection URI. If no database is specified in the URI, it defaults to `dodopayments_sync`.
>
> **PostgreSQL**: Tables (`Subscriptions`, `Payments`, `Licenses`, `Customers`) will be created in the database specified in your connection URI. Data is stored as JSONB.
>
> **MySQL**: Requires **MySQL ≥ 8.0.20** (uses modern row alias syntax for upserts, fully compatible with MySQL 9.0+). Tables (`Subscriptions`, `Payments`, `Licenses`, `Customers`) will be created in the database specified in your connection URI. Data is stored as JSON.
>
> **ClickHouse**: Tables (`Subscriptions`, `Payments`, `Licenses`, `Customers`) will be created using the ReplacingMergeTree engine. When querying, use the `FINAL` keyword to ensure deduplicated results.

---

## Breaking Changes

> [!WARNING]
> If you are upgrading from `v0.x` to `v1.x` and above:
>
> 1. **MongoDB Database Name from URI**:
>    The database name is now dynamically extracted from your MongoDB connection URI (e.g. `mongodb://host:port/my_database`). If no database is specified in the URI path, it defaults to `dodopayments_sync`. Previously, it was hardcoded to `dodopayments_sync` regardless of the URI path.
>
> 2. **MongoDB Licence Primary Key Standardized**:
>    Licence documents in MongoDB are now keyed by their license `id` (`_id: licence.id`), matching PostgreSQL, MySQL, and ClickHouse (previously, they were keyed by `subscription_id`).
>    * **Upgrade Action**: If upgrading from `v0.x`, drop your existing `Licence` collection (or clear the old `dodopayments_sync` database). Re-running the sync will cleanly re-populate all records with the standardized primary key format.
>
> 3. **MySQL Version Requirement**:
>    * **Requirement**: Minimum **MySQL version 8.0.20** is required for the sync engine to function correctly.
>    * **Reason**: The sync ngine uses an updated method in its UPSERT operations, which is not supported in older MySQL versions and has been deprecated in newer MySQL versions.