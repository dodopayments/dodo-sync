import DodoPayments, { type ClientOptions } from 'dodopayments';
import { AddCustomerMongoDB, AddLicenceMongoDB, AddPaymentMongoDB, AddSubscriptionMongoDB, ConnectMongoDB } from './database-integrations/mongodb';
import { AddCustomerPostgres, AddLicencePostgres, AddPaymentPostgres, AddSubscriptionPostgres, ConnectPostgres } from './database-integrations/postgres';
import { AddCustomerMySQL, AddLicenceMySQL , AddPaymentMySQL ,AddSubscriptionMySQL , ConnectMySQL } from './database-integrations/mysql';
type scopes = ('licences' | 'payments' | 'customers' | 'subscriptions')[];
class DodoSync {
    private interval: number;
    private database: 'mongodb' | 'postgres' | 'mysql';
    private databaseURI: string;
    private timer?: NodeJS.Timeout;
    private DodoPaymentsClient: DodoPayments;
    private scopes: scopes = [];
    private isInit: boolean = false;
    private rateLimit: number;
    private nextRequestTime: number = 0;

    constructor({
        // Will default to 0 seconds which means it won't run automatically at intervals
        interval = 0,
        database,
        databaseURI,
        scopes,
        dodoPaymentsOptions,
        // Default rate limit is 10 requests per second
        rateLimit = 10
    }: {
        interval?: number,
        database: 'mongodb' | 'postgres' | 'mysql',
        databaseURI: string,
        scopes: scopes,
        dodoPaymentsOptions: ClientOptions,
        rateLimit?: number
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
        this.scopes = scopes;
        this.rateLimit = rateLimit;
        this.DodoPaymentsClient = new DodoPayments(dodoPaymentsOptions);
    }

    private async throttle() {
        // Disable rate limiting if rateLimit is greater than or equal to 100 since it won't make any difference at this point
        if (this.rateLimit >= 100) return;
        const now = Date.now();
        const allocatedTime = Math.max(now, this.nextRequestTime);
        this.nextRequestTime = allocatedTime + (1000 / this.rateLimit);

        const delay = allocatedTime - now;
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }


    // This is to connect the specified database
    async init() {
        if (this.database === 'mongodb') {
            await ConnectMongoDB(this.databaseURI);
            this.isInit = true;
        }
        else if (this.database === 'postgres') {
            await ConnectPostgres(this.databaseURI);
            this.isInit = true;
        }
        else if (this.database === 'mysql') {
            await ConnectMySQL(this.databaseURI);
            this.isInit = true;
        } else {
            throw new Error(`Database ${this.database} not supported yet.`);
        }
    }





    // These functions will add data to the database as per the specified database
    // This will add licence to the database
    private addLicence(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
        if (this.database === 'mongodb') {
            return AddLicenceMongoDB(licenceData);
        }
        else if (this.database === 'postgres') {
            return AddLicencePostgres(licenceData);
        }
        else if (this.database === 'mysql') {
            return AddLicenceMySQL(licenceData);
        }
        // Return a resolved promise if no DB matches
        return Promise.resolve();
    }

    // This will add payment to the database
    private addSubscription(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
        if (this.database === 'mongodb') {
            return AddSubscriptionMongoDB(subscriptionData);
        }
        else if (this.database === 'postgres') {
            return AddSubscriptionPostgres(subscriptionData);
        }
        else if (this.database === 'mysql') {
            return AddSubscriptionMySQL(subscriptionData);
        }
        // Return a resolved promise if no DB matches
        return Promise.resolve();
    }

    // This will add payment to the database
    private addPayment(paymentData: DodoPayments.Payments.PaymentListResponse) {
        if (this.database === 'mongodb') {
            return AddPaymentMongoDB(paymentData);
        }
        else if (this.database === 'postgres') {
            return AddPaymentPostgres(paymentData);
        }
        else if (this.database === 'mysql') {
            return AddPaymentMySQL(paymentData);
        }
        // Return a resolved promise if no DB matches
        return Promise.resolve();
    }

    // This will add customer to the database
    private addCustomer(customerData: DodoPayments.Customers.Customer) {
        if (this.database === 'mongodb') {
            return AddCustomerMongoDB(customerData);
        }
        else if (this.database === 'postgres') {
            return AddCustomerPostgres(customerData);
        }
        else if (this.database === 'mysql') {
            return AddCustomerMySQL(customerData);
        }
        // Return a resolved promise if no DB matches
        return Promise.resolve();
    }





    // These functions will fetch data from Dodo Payments API recrisively and add to the database
    // Fetch licences
    private async fetchLicences(
        { page = 0 }: { page?: number } = {}
    ) {
        await this.throttle();
        const licences = await this.DodoPaymentsClient.licenseKeys.list({
            page_number: page,
            page_size: 100
        });

       const savePromises = licences.items.map(licence => this.addLicence(licence));

       await Promise.allSettled(savePromises);

        if (licences.hasNextPage()) {
            await this.fetchLicences({
                page: page + 1
            });
        }
    }

    // Fetch subscriptions
    private async fetchSubscriptions(
        { page = 0 }: { page?: number } = {}
    ) {
        await this.throttle();
        const subscriptions = await this.DodoPaymentsClient.subscriptions.list({
            page_number: page,
            page_size: 100
        });


        const savePromises = subscriptions.items.map(subscription => this.addSubscription(subscription));

        await Promise.allSettled(savePromises);

        if (subscriptions.hasNextPage()) {
            await this.fetchSubscriptions({
                page: page + 1
            });
        }
    }

    // Fetch payments
    private async fetchPayments(
        { page = 0 }: { page?: number } = {}
    ) {
        await this.throttle();
        const payments = await this.DodoPaymentsClient.payments.list({
            page_number: page,
            page_size: 100
        });

        const savePromises = payments.items.map(payment => this.addPayment(payment));

        await Promise.allSettled(savePromises);

        if (payments.hasNextPage()) {
            await this.fetchPayments({
                page: page + 1
            });
        }
    }

    // Fetch customers
    private async fetchCustomers(
        { page = 0 }: { page?: number } = {}
    ) {
        await this.throttle();
        const customers = await this.DodoPaymentsClient.customers.list({
            page_number: page,
            page_size: 100
        });

        const savePromises = customers.items.map(customer => this.addCustomer(customer));

        await Promise.allSettled(savePromises);

        if (customers.hasNextPage()) {
            await this.fetchCustomers({
                page: page + 1
            });
        }
    }





    // This function will run the sync process every specified interval
    // I have exposed it (not made it private) so that it can be called manually if needed
    async run() {
        if (this.scopes.includes('licences')) {
            await this.fetchLicences();
        }

        if (this.scopes.includes('payments')) {
            await this.fetchPayments();
        }

        if (this.scopes.includes('customers')) {
            await this.fetchCustomers();
        }

        if (this.scopes.includes('subscriptions')) {
            await this.fetchSubscriptions();
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
