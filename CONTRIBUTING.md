# Contributing
We welcome contributors to this repository. We will give out swags to those who provide many valuable contributions.

## Basic information
Folder structure:
```
src/
    index.ts ⬅ Main entrypoint File
    database-integrations/
        [database] ⬅ database name (eg, mongodb, postgres, etc)
            index.ts ⬅ Entrypoint for the integration
            [...other files] ⬅ Put the other files containing the code, etc that don't belong into the entrypoint src/database-integrations/[database]/index.ts file
```

Example folder structure:
```
src/
    index.ts
    database-integrations/
        mongodb/
            index.ts
```
Keep arguments optional. Do not force the user to enter arguments. Instead, add input if arguments are missing.

Prevent using compilers/runtimes other than NodeJS/Bun. This is to make sure it's easy to contribute for all future contributors.

Please add comments where appropriate to make it easier for further contributors to contribute.

## High Level Flow:
1. User runs the command with or without arguments.
2. If user doesn't use arguments, ask them for input.
3. Fetch the required data from Dodo Payments.
4. Sync the data to the user's database.

## Contributing to an addition of a database
If you're trying to add a database, you should follow the below steps:  
1. Create a file `src/database-integrations/<your-database>/index.ts` (example: `src/database-integrations/mongodb/index.ts`)

2. Create the following functions in it:
    - AddSubscription\<DatabaseName\> (example: AddSubscriptionMongoDB). It should accept a parameter named `subscriptionData` with the type `DodoPayments.Subscriptions.SubscriptionListResponse` and this subscription data should then be added to the database.
    - AddPayment\<DatabaseName\> (example: AddPaymentMongoDB). It should accept a parameter named `paymentData` with the type `DodoPayments.Payments.PaymentListResponse` and this payment data should then be added to the database.
    - AddLicence\<DatabaseName\> (example: AddLicenceMongoDB). It should accept a parameter named `licenceData` with the type `DodoPayments.LicenseKeys.LicenseKey` and this licence data should then be added to the database.
    - AddCustomer\<DatabaseName\> (example: AddCustomerMongoDB). It should accept a parameter named `customerData` with the type `DodoPayments.Customers.Customer` and this customer data should then be added to the database.
3. Open the [src/index.ts](https://github.com/dodopayments/dodo-sync/blob/main/src/index.ts) file and import the above created functions.
4. Inside the same [src/index.ts](https://github.com/dodopayments/dodo-sync/blob/main/src/index.ts) file below the init() function, you will see 4 private functions `addLicence`, `addSubscription`, `addPayment` and `addCustomer`. These functions handle the code writing to the database. Now, inside each of these functions, to add your database, do:
```ts
if (this.database === '<your-database-name>'){
    Add<scope><db>(data);
}
```

Example:
```ts
private addLicence(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
    if (this.database === 'mongodb') {
        AddLicenceMongoDB(licenceData);
    }
}
```

The above code will try to match if the database if mongodb and after that it will add it to the database using the AddLicenceMongoDB function.

You need to this for all the 4 functions (`addLicence`, `addSubscription`, `addPayment` and `addCustomer`).

Still stuck?
Check out the [MongoDB integration](https://github.com/dodopayments/dodo-sync/blob/main/src/database-integrations/mongodb/index.ts) file for example.

If you have queries, you can ask about them in the #contributors channel of our [Discord server](https://discord.gg/S6kuPSW5Fm).

## Libraries:  
Currently used libraries:  
- [yargs](https://github.com/yargs/yargs) - for parsing command line arguments in nodejs.
- [inquirer](https://github.com/SBoudrias/Inquirer.js) - for taking user input.
- [dodopayments](https://github.com/dodopayments/dodopayments-typescript) - Dodo Payments SDK.

Please prevent using additional libraries if not majorly required. This is to ensure this project doesn't get overcluttered with less used dependencies.