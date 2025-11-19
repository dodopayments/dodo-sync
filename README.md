# Dodo Payments Sync Engine

Sync your Dodo Payments data with your own database.

## Database support
We currently only support MongoDB. We are constantly working on expanding this support. If you're able to contribute a database, please make a PR (Pull Request).

## Usage
We provide 2 usage options
1. CLI
2. Code

### CLI usage
Installation:
```
npm install -g dodo-sync
```
OR
```
bun add -g dodo-sync
```

Using it:
We provide 2 options to run this. First is interactive mode in which all the information will be collected from you. And the second is CLI mode in which you have to pass all the information yourself.

Interactive mode:
```
dodo-sync
```
To run in interactive mode, simply run dodo-sync in the terminal after installation. If no arguments are provided, it will automatically switch to interactive mode.

CLI mode docs:
```
dodo-sync -i [interval] -d [database] -u [database url] --scopes [scopes] --api-key [Dodo Payments API key] --env [Dodo Payments environment]
```

Example:
```
dodo-sync -i 600 -d mongodb -u mongodb://mymongodb.url --scopes "licences,payments,customers,subscriptions" --api-key YOUR_DODO_PAYMENTS_API_KEY --env test_mode
```

Arguments:  
Command | Shorthand | Name | Type | Usage |
| ----- | --------- | ---- | ---- | ----- |
--interval | -i | Interval | number | Interval (in seconds).
--database | -d | Database | "mongodb" | Name of the database used.
--database-uri | -u | Database URI | string | The URI to connect the database.
--scopes | | Database URI | licences, payments, customers, subscriptions | The things you want to migrate. Separated by a comma with no space in between. Example: "payments,subscriptions".
--api-key | |  API Key | string | Your Dodo Payments API Key.
--env |  | Environment | "live_mode" or "test_mode" | The Dodo Payments you're targeting.


### Code usage
Installation:
```
npm install dodo-sync
```
OR
```
bun add dodo-sync
```

Example usage (automatic predefined interval based sync):
```ts
import { DodoSync } from 'dodo-sync';

const syncDodoPayments = new DodoSync({
    interval: 60
    database: 'mongodb',
    databaseURI: '<Your Database URI>',
    scopes: ['licences', 'payments', 'customers', 'subscriptions'],
    dodoPaymentsOptions: {
        bearerToken: '<Your Dodo Payments API Key>',
        environment: 'test_mode' // or 'live_mode' for production
    }
});

// This will run the intialization (example, connecting to database)
await syncDodoPayments.init();

// This will start syncing after every few intervals
syncDodoPayments.start();
```

Example usage (manual sync):
```ts
import { DodoSync } from 'dodo-sync';

const syncDodoPayments = new DodoSync({
    database: 'mongodb',
    databaseURI: '<Your Database URI>',
    scopes: ['licences', 'payments', 'customers', 'subscriptions'],
    dodoPaymentsOptions: {
        bearerToken: '<Your Dodo Payments API Key>',
        environment: 'test_mode' // or 'live_mode' for production
    }
});

// This will run the intialization (example, connecting to database)
await syncDodoPayments.init();

// This will start syncing after every few intervals
syncDodoPayments.start();

// Run the below line anytime you want to conduct the migration
syncDodoPayments.run();
```

DodoSync class constructor options:
| Name | Value | Usage | Required |
| ---- | ----- | ------| -------- |
| database | "mongodb" | Name of the database to be used. | ✅
| databaseURI  | string | Provide the URL to the database. | ✅
| scopes | ["licences", "payments", "customers", "subscriptions"] | An array of the things you want to sync with your database. | ✅
dodoPaymentsOptions | See types from [here](https://github.com/dodopayments/dodopayments-typescript/blob/31455c8dc30a7fe1ee073854f3db00272e552039/src/client.ts#L344) | The options will directly go into the Dodo Payments initializer. These parameters is required and accepts crucial Dodo Payments connection info like the API key and environment. | ✅ | 
| interval | number | Provide the time (in seconds). This is optional. If you don't include this, you will have to manually sync using .run() function. | ❌

## Important info
A database named `dodopayments_sync` will automatically be created in your database server. This will contain all your sync data. This cannot be changed.