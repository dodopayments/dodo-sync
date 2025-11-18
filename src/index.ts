import DodoPayments, { type ClientOptions } from 'dodopayments';
import { AddCustomerMongoDB, AddLicenceMongoDB, AddPaymentMongoDB, AddSubscriptionMongoDB, ConnectMongoDB } from './database-integrations/mongoose';

type scopes = ('licences' | 'payments' | 'customers' | 'subscriptions')[];
class DodoSync {
    private interval: number;
    private database: 'mongodb';
    private databaseURI: string;
    private timer?: NodeJS.Timeout;
    private DodoPaymentsClient: DodoPayments;
    private scopes: scopes = [];
    private isInit: boolean = false;

    constructor({
        // Will default to 0 seconds which means it won't run automatically at intervals
        interval = 0,
        database,
        databaseURI,
        scopes,
        dodoPaymentsOptions
    }: {
        interval?: number,
        database: 'mongodb',
        databaseURI: string,
        scopes: scopes,
        dodoPaymentsOptions: ClientOptions
    }) {
        if (!database) {
            throw new Error("Missing required argument: database");
        }
        if (!databaseURI) {
            throw new Error("Missing required argument: databaseURI");
        }
        if (!scopes || scopes.length === 0) {
            throw new Error("Missing required argument: scopes");
        }

        this.interval = interval;
        this.database = database;
        this.databaseURI = databaseURI;
        this.scopes = scopes;
        this.DodoPaymentsClient = new DodoPayments(dodoPaymentsOptions);
    }


    // This is to connect the specified database
    async init() {
        if (this.database === 'mongodb') {
            await ConnectMongoDB(this.databaseURI);
            this.isInit = true;
        } else {
            throw new Error(`Database ${this.database} not supported yet.`);
        }
    }





    // These functions will add data to the database as per the specified database
    // This will add licence to the database
    private addLicence(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
        if (this.database === 'mongodb') {
            AddLicenceMongoDB(licenceData);
        }
    }

    // This will add payment to the database
    private addSubscription(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
        if (this.database === 'mongodb') {
            AddSubscriptionMongoDB(subscriptionData);
        }
    }

    // This will add payment to the database
    private addPayment(paymentData: DodoPayments.Payments.PaymentListResponse) {
        if (this.database === 'mongodb') {
            AddPaymentMongoDB(paymentData);
        }
    }

    // This will add customer to the database
    private addCustomer(customerData: DodoPayments.Customers.Customer) {
        if (this.database === 'mongodb') {
            AddCustomerMongoDB(customerData);
        }
    }





    // These functions will fetch data from Dodo Payments API recrisively and add to the database
    // Fetch licences
    private async fetchLicences(
        { page = 0 }: { page?: number } = {}
    ) {
        const licences = await this.DodoPaymentsClient.licenseKeys.list({
            page_number: page,
            page_size: 100
        });

        for (const licence of licences.items) {
            this.addLicence(licence);
        }

        if (licences.hasNextPage()) {
            this.fetchLicences({
                page: page + 1
            });
        }
    }

    // Fetch subscriptions
    private async fetchSubscriptions(
        { page = 0 }: { page?: number } = {}
    ) {
        const subscriptions = await this.DodoPaymentsClient.subscriptions.list({
            page_number: page,
            page_size: 100
        });


        for (const subscription of subscriptions.items) {
            this.addSubscription(subscription);
        }

        if (subscriptions.hasNextPage()) {
            this.fetchSubscriptions({
                page: page + 1
            });
        }
    }

    // Fetch payments
    private async fetchPayments(
        { page = 0 }: { page?: number } = {}
    ) {
        const payments = await this.DodoPaymentsClient.payments.list({
            page_number: page,
            page_size: 100
        });

        for (const payment of payments.items) {
            this.addPayment(payment);
        }

        if (payments.hasNextPage()) {
            this.fetchPayments({
                page: page + 1
            });
        }
    }

    // Fetch customers
    private async fetchCustomers(
        { page = 0 }: { page?: number } = {}
    ) {
        const customers = await this.DodoPaymentsClient.customers.list({
            page_number: page,
            page_size: 100
        });

        for (const customer of customers.items) {
            this.addCustomer(customer);
        }

        if (customers.hasNextPage()) {
            this.fetchCustomers({
                page: page + 1
            });
        }
    }





    // This function will run the sync process every specified interval
    // I have exposed it (not made it private) so that it can be called manually if needed
    async run() {
        if (this.scopes.includes('licences')) {
            this.fetchLicences();
        }

        if (this.scopes.includes('payments')) {
            this.fetchPayments();
        }

        if (this.scopes.includes('customers')) {
            this.fetchCustomers();
        }

        if (this.scopes.includes('subscriptions')) {
            this.fetchSubscriptions();
        }
    }






    // This function will start the sync process at specified intervals
    async start() {
        if (!this.isInit) {
            throw new Error("Client not initialized. Please call init() before starting the sync process.");
        }

        // Only run if interval is greater than 0 (i.e, it's specified). If the interval is not sepecified or is 0, the sync process will not run automatically. The user will have to call .run() manually to start the sync process.
        if (this.interval > 0) {
            this.run();
            this.timer = setInterval(() => this.run(), this.interval * 1000);
        }

    }

    // This function will stop the sync process
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}

export { DodoSync };