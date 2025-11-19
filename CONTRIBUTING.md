# Contributing to Dodo Sync
We highly value contributions. Here's a guide on how you can contribute.

## Contributing to an addition of a database
If you're trying to add a database, you should follow the below steps:  
1. Create a file `src/database-integrations/<your-database>/index.ts` (example: `src/database-integrations/mongodb/index.ts`)

2. Create the following functions in it:
    - AddSubscription\<DatabaseName\> (example: AddSubscriptionMongoDB). It should accept a parameter named `subscriptionData` with the type `DodoPayments.Subscriptions.SubscriptionListResponse` and this subscription data should then be added to the database.
    - AddPayment\<DatabaseName\> (example: AddPaymentMongoDB). It should accept a parameter named `paymentData` with the type `DodoPayments.Payments.PaymentListResponse` and this payment data should then be added to the database.
    - AddLicence\<DatabaseName\> (example: AddLicenceMongoDB). It should accept a parameter named `licenceData` with the type `DodoPayments.LicenseKeys.LicenseKey` and this licence data should then be added to the database.
    - AddCustomer\<DatabaseName\> (example: AddCustomerMongoDB). It should accept a parameter named `customerData` with the type `DodoPayments.Customers.Customer` and this customer data should then be added to the database.
3. Open the [src/index.ts](./src/index.ts) file and import the above created functions.
4. Inside the same [src/index.ts](./src/index.ts) file and below the init() function, you will see 4 private functions `addLicence`, `addSubscription`, `addPayment` and `addCustomer`. These functions handle the code writing to the database. Now, inside each of these functions, to add your database, do:
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
Check out the [MongoDB integration](./src/database-integrations/mongoose/index.ts) file for example.

If you have queries, you can ask about them in the #contributors channel of our [Discord server](https://discord.gg/S6kuPSW5Fm).