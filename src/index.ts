import DodoPayments, { type ClientOptions } from 'dodopayments';
import {
    AddCustomerMongoDB,
    AddCustomersMongoDB,
    AddLicenceMongoDB,
    AddLicencesMongoDB,
    AddPaymentMongoDB,
    AddPaymentsMongoDB,
    AddSubscriptionMongoDB,
    AddSubscriptionsMongoDB,
    ConnectMongoDB,
    DisconnectMongoDB
} from './database-integrations/mongodb';
import {
    AddCustomerPostgres,
    AddCustomersPostgres,
    AddLicencePostgres,
    AddLicencesPostgres,
    AddPaymentPostgres,
    AddPaymentsPostgres,
    AddSubscriptionPostgres,
    AddSubscriptionsPostgres,
    ConnectPostgres,
    DisconnectPostgres
} from './database-integrations/postgres';
import {
    AddCustomerClickHouse,
    AddCustomersClickHouse,
    AddLicenceClickHouse,
    AddLicencesClickHouse,
    AddPaymentClickHouse,
    AddPaymentsClickHouse,
    AddSubscriptionClickHouse,
    AddSubscriptionsClickHouse,
    ConnectClickHouse,
    DisconnectClickHouse
} from './database-integrations/clickhouse';
import {
    AddCustomerMySQL,
    AddCustomersMySQL,
    AddLicenceMySQL,
    AddLicencesMySQL,
    AddPaymentMySQL,
    AddPaymentsMySQL,
    AddSubscriptionMySQL,
    AddSubscriptionsMySQL,
    ConnectMySQL,
    DisconnectMySQL
} from './database-integrations/mysql';

type scopes = ('licences' | 'payments' | 'customers' | 'subscriptions')[];

class DodoSync {
    private interval: number;
    private database: 'mongodb' | 'postgres' | 'mysql' | 'clickhouse';
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
        database: 'mongodb' | 'postgres' | 'mysql' | 'clickhouse',
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
        else if (this.database === 'clickhouse') {
            await ConnectClickHouse(this.databaseURI);
            this.isInit = true;
        }
        else if (this.database === 'mysql') {
            await ConnectMySQL(this.databaseURI);
            this.isInit = true;
        }
        else {
            throw new Error(`Database ${this.database} not supported yet.`);
        }
    }

    // Disconnect from the database (essential for serverless environments)
    async disconnect() {
        this.stop();
        if (this.database === 'mongodb') {
            await DisconnectMongoDB();
        } else if (this.database === 'postgres') {
            await DisconnectPostgres();
        } else if (this.database === 'clickhouse') {
            await DisconnectClickHouse();
        } else if (this.database === 'mysql') {
            await DisconnectMySQL();
        }
        this.isInit = false;
    }

    // Alias for disconnect()
    async close() {
        await this.disconnect();
    }

    // Batch database write functions (awaited)
    private async addLicences(licencesData: DodoPayments.LicenseKeys.LicenseKey[]) {
        if (!licencesData.length) return;
        if (this.database === 'mongodb') {
            await AddLicencesMongoDB(licencesData);
        }
        else if (this.database === 'postgres') {
            await AddLicencesPostgres(licencesData);
        }
        else if (this.database === 'clickhouse') {
            await AddLicencesClickHouse(licencesData);
        }
        else if (this.database === 'mysql') {
            await AddLicencesMySQL(licencesData);
        }
    }

    private async addSubscriptions(subscriptionsData: DodoPayments.Subscriptions.SubscriptionListResponse[]) {
        if (!subscriptionsData.length) return;
        if (this.database === 'mongodb') {
            await AddSubscriptionsMongoDB(subscriptionsData);
        }
        else if (this.database === 'postgres') {
            await AddSubscriptionsPostgres(subscriptionsData);
        }
        else if (this.database === 'clickhouse') {
            await AddSubscriptionsClickHouse(subscriptionsData);
        }
        else if (this.database === 'mysql') {
            await AddSubscriptionsMySQL(subscriptionsData);
        }
    }

    private async addPayments(paymentsData: DodoPayments.Payments.PaymentListResponse[]) {
        if (!paymentsData.length) return;
        if (this.database === 'mongodb') {
            await AddPaymentsMongoDB(paymentsData);
        }
        else if (this.database === 'postgres') {
            await AddPaymentsPostgres(paymentsData);
        }
        else if (this.database === 'clickhouse') {
            await AddPaymentsClickHouse(paymentsData);
        }
        else if (this.database === 'mysql') {
            await AddPaymentsMySQL(paymentsData);
        }
    }

    private async addCustomers(customersData: DodoPayments.Customers.Customer[]) {
        if (!customersData.length) return;
        if (this.database === 'mongodb') {
            await AddCustomersMongoDB(customersData);
        }
        else if (this.database === 'postgres') {
            await AddCustomersPostgres(customersData);
        }
        else if (this.database === 'clickhouse') {
            await AddCustomersClickHouse(customersData);
        }
        else if (this.database === 'mysql') {
            await AddCustomersMySQL(customersData);
        }
    }

    // Single item helper methods for internal/backward compatibility
    private async addLicence(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
        await this.addLicences([licenceData]);
    }

    private async addSubscription(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
        await this.addSubscriptions([subscriptionData]);
    }

    private async addPayment(paymentData: DodoPayments.Payments.PaymentListResponse) {
        await this.addPayments([paymentData]);
    }

    private async addCustomer(customerData: DodoPayments.Customers.Customer) {
        await this.addCustomers([customerData]);
    }

    // Iterative pagination and sync methods
    private async fetchLicences() {
        for (let page = 0, more = true; more; page++) {
            await this.throttle();
            const licences = await this.DodoPaymentsClient.licenseKeys.list({
                page_number: page,
                page_size: 100
            });

            if (licences.items && licences.items.length > 0) {
                await this.addLicences(licences.items);
            }

            more = licences.hasNextPage();
        }
    }

    private async fetchSubscriptions() {
        for (let page = 0, more = true; more; page++) {
            await this.throttle();
            const subscriptions = await this.DodoPaymentsClient.subscriptions.list({
                page_number: page,
                page_size: 100
            });

            if (subscriptions.items && subscriptions.items.length > 0) {
                await this.addSubscriptions(subscriptions.items);
            }

            more = subscriptions.hasNextPage();
        }
    }

    private async fetchPayments() {
        for (let page = 0, more = true; more; page++) {
            await this.throttle();
            const payments = await this.DodoPaymentsClient.payments.list({
                page_number: page,
                page_size: 100
            });

            if (payments.items && payments.items.length > 0) {
                await this.addPayments(payments.items);
            }

            more = payments.hasNextPage();
        }
    }

    private async fetchCustomers() {
        for (let page = 0, more = true; more; page++) {
            await this.throttle();
            const customers = await this.DodoPaymentsClient.customers.list({
                page_number: page,
                page_size: 100
            });

            if (customers.items && customers.items.length > 0) {
                await this.addCustomers(customers.items);
            }

            more = customers.hasNextPage();
        }
    }

    // Runs a single pass of the sync process for all configured scopes
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

    private isSyncing: boolean = false;

    private async executeSync() {
        if (this.isSyncing) {
            console.warn("DodoSync: A sync operation is already in progress, skipping this interval tick.");
            return;
        }
        this.isSyncing = true;
        try {
            await this.run();
        } catch (error) {
            console.error("DodoSync: Error during sync run:", error);
        } finally {
            this.isSyncing = false;
        }
    }

    // Starts the sync process at specified intervals
    async start() {
        if (!this.isInit) {
            throw new Error("Client not initialized. Please call init() before starting the sync process.");
        }

        if (this.interval > 0) {
            // Set the interval timer first so scheduled syncing always continues even if the initial sync fails
            this.timer = setInterval(() => {
                this.executeSync();
            }, this.interval * 1000);

            // Execute the initial sync immediately; errors are handled inside executeSync so the timer remains active
            await this.executeSync();
        }
    }

    // Stops the recurring sync timer
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
}

export { DodoSync };
