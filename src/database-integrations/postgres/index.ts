import { Client } from 'pg'
import DodoPayments from 'dodopayments';

let pgClient : Client

const ConnectPostgres = async (uri : string) => {
    try {
        pgClient = new Client({
            connectionString : uri
        });
        await pgClient.connect();
        await initTables();
    } catch (error){
        console.error('Error connecting to PostgreSQL:', error);
        throw error;
    }
}

const initTables = async () => {
    // I have used JSONB to store the data
    const tableQueries = [
        `CREATE TABLE IF NOT EXISTS Subscription (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS Payment (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS License (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS Customer (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );`
    ];
    for (const query of tableQueries) {
        try{
            await pgClient.query(query);
        }catch(error){
            throw error;
        }
    }
}

async function AddSubscriptionPostgres(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
    const query = `
        INSERT INTO Subscription (id, data)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data;
    `;

    const values = [
        subscriptionData.subscription_id,
        JSON.stringify(subscriptionData)
    ];

    try {
        await pgClient.query(query, values);
    } catch (error) {
        console.error(`Error syncing subscription ${subscriptionData.subscription_id}:`, error);
        throw error;
    }
}

async function AddPaymentPostgres(paymentData: DodoPayments.Payments.PaymentListResponse){
    const query = `
        INSERT INTO Payment (id, data)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data;
    `;

    const values = [
        paymentData.payment_id,
        JSON.stringify(paymentData)
    ]
    try{
        await pgClient.query(query,values)
    }catch(error){
        console.error(`Error syncing subscription ${paymentData.payment_id}:`, error);
        throw error;
    }
}

async function AddLicencePostgres(licenceData: DodoPayments.LicenseKeys.LicenseKey){
    const query = `
        INSERT INTO License (id, data)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data;
    `;
    const values = [
        licenceData.subscription_id,
        JSON.stringify(licenceData)
    ]
    try{
        await pgClient.query(query,values)
    }catch(error){
        console.error(`Error syncing license ${licenceData.subscription_id}:`, error);
        throw error;
    }
}

async function AddCustomerPostgres(customerData: DodoPayments.Customers.Customer){
    const query = `
        INSERT INTO Customer (id, data)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data;
    `;
    const values = [
        customerData.customer_id,
        JSON.stringify(customerData)
    ]
    try{
        await pgClient.query(query,values)
    }catch(error){
        console.error(`Error syncing Customer ${customerData.customer_id}:`, error);
        throw error;
    }
}

export { ConnectPostgres, AddSubscriptionPostgres, AddPaymentPostgres, AddLicencePostgres, AddCustomerPostgres };
