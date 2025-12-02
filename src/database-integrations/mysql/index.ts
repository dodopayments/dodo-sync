import mysql from 'mysql2/promise';
import DodoPayments from 'dodopayments';

let sqlClient: mysql.Connection
const ConnectMySQL = async (uri : string) => {
    try {
        sqlClient = await mysql.createConnection(uri);
        await initTables();
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
        throw error;
    }
}

const initTables = async () => {
    const tableQueries = [
        `CREATE TABLE IF NOT EXISTS Subscriptions (
            id VARCHAR(255) PRIMARY KEY,
            data JSON NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS Payments (
            id VARCHAR(255) PRIMARY KEY,
            data JSON NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS Licenses (
            id VARCHAR(255) PRIMARY KEY,
            data JSON NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS Customers (
            id VARCHAR(255) PRIMARY KEY,
            data JSON NOT NULL
        );`
    ];
    for (const query of tableQueries) {
        try {
            await sqlClient.execute(query);
        } catch (error) {
            throw error;
        }
    }
}

async function AddSubscriptionMySQL(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
    const query = `
        INSERT INTO Subscriptions (id, data)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data);
    `;

    const values = [
        subscriptionData.subscription_id,
        JSON.stringify(subscriptionData)
    ];

    try {
        await sqlClient.execute(query, values);
    } catch (error) {
        console.error(`Error syncing subscription ${subscriptionData.subscription_id}:`, error);
        throw error;
    }
}

async function AddPaymentMySQL(paymentData: DodoPayments.Payments.PaymentListResponse) {
    const query = `
        INSERT INTO Payments (id, data)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data);
    `;

    const values = [
        paymentData.payment_id,
        JSON.stringify(paymentData)
    ]
    try {
        await sqlClient.execute(query, values)
    } catch (error) {
        console.error(`Error syncing subscription ${paymentData.payment_id}:`, error);
        throw error;
    }
}

async function AddLicenceMySQL(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
    const query = `
        INSERT INTO Licenses (id, data)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data);
    `;
    const values = [
        licenceData.id,
        JSON.stringify(licenceData)
    ]
    try {
        await sqlClient.execute(query, values)
    } catch (error) {
        console.error(`Error syncing license ${licenceData.id}:`, error);
        throw error;
    }
}

async function AddCustomerMySQL(customerData: DodoPayments.Customers.Customer) {
    const query = `
        INSERT INTO Customers (id, data)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data);
    `;
    const values = [
        customerData.customer_id,
        JSON.stringify(customerData)
    ]
    try {
        await sqlClient.execute(query, values)
    } catch (error) {
        console.error(`Error syncing Customer ${customerData.customer_id}:`, error);
        throw error;
    }
}

export { ConnectMySQL, AddSubscriptionMySQL, AddPaymentMySQL, AddLicenceMySQL, AddCustomerMySQL };
