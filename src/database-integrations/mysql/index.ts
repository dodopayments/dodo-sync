import mysql from 'mysql2/promise';
import DodoPayments from 'dodopayments';

let sqlClient: mysql.Connection | null = null;

const ConnectMySQL = async (uri : string) => {
    try {
        sqlClient = await mysql.createConnection(uri);
        await initTables();
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
        throw error;
    }
}

const DisconnectMySQL = async () => {
    if (sqlClient) {
        await sqlClient.end();
        sqlClient = null;
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
            if (!sqlClient) throw new Error('MySQL client is not connected');
            await sqlClient.execute(query);
        } catch (error) {
            throw error;
        }
    }
}

async function AddSubscriptionsMySQL(subscriptions: DodoPayments.Subscriptions.SubscriptionListResponse[]) {
    if (!subscriptions.length) return;
    if (!sqlClient) throw new Error('MySQL client is not connected');

    const placeholders = subscriptions.map(() => '(?, ?)').join(', ');
    const query = `
        INSERT INTO Subscriptions (id, data)
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE data = VALUES(data);
    `;
    const values: any[] = [];
    for (const sub of subscriptions) {
        values.push(sub.subscription_id, JSON.stringify(sub));
    }

    try {
        await sqlClient.execute(query, values);
    } catch (error) {
        console.error('Error syncing subscriptions:', error);
        throw error;
    }
}

async function AddSubscriptionMySQL(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
    await AddSubscriptionsMySQL([subscriptionData]);
}

async function AddPaymentsMySQL(payments: DodoPayments.Payments.PaymentListResponse[]) {
    if (!payments.length) return;
    if (!sqlClient) throw new Error('MySQL client is not connected');

    const placeholders = payments.map(() => '(?, ?)').join(', ');
    const query = `
        INSERT INTO Payments (id, data)
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE data = VALUES(data);
    `;
    const values: any[] = [];
    for (const payment of payments) {
        values.push(payment.payment_id, JSON.stringify(payment));
    }

    try {
        await sqlClient.execute(query, values);
    } catch (error) {
        console.error('Error syncing payments:', error);
        throw error;
    }
}

async function AddPaymentMySQL(paymentData: DodoPayments.Payments.PaymentListResponse) {
    await AddPaymentsMySQL([paymentData]);
}

async function AddLicencesMySQL(licences: DodoPayments.LicenseKeys.LicenseKey[]) {
    if (!licences.length) return;
    if (!sqlClient) throw new Error('MySQL client is not connected');

    const placeholders = licences.map(() => '(?, ?)').join(', ');
    const query = `
        INSERT INTO Licenses (id, data)
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE data = VALUES(data);
    `;
    const values: any[] = [];
    for (const licence of licences) {
        values.push(licence.id, JSON.stringify(licence));
    }

    try {
        await sqlClient.execute(query, values);
    } catch (error) {
        console.error('Error syncing licenses:', error);
        throw error;
    }
}

async function AddLicenceMySQL(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
    await AddLicencesMySQL([licenceData]);
}

async function AddCustomersMySQL(customers: DodoPayments.Customers.Customer[]) {
    if (!customers.length) return;
    if (!sqlClient) throw new Error('MySQL client is not connected');

    const placeholders = customers.map(() => '(?, ?)').join(', ');
    const query = `
        INSERT INTO Customers (id, data)
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE data = VALUES(data);
    `;
    const values: any[] = [];
    for (const customer of customers) {
        values.push(customer.customer_id, JSON.stringify(customer));
    }

    try {
        await sqlClient.execute(query, values);
    } catch (error) {
        console.error('Error syncing customers:', error);
        throw error;
    }
}

async function AddCustomerMySQL(customerData: DodoPayments.Customers.Customer) {
    await AddCustomersMySQL([customerData]);
}

export {
    ConnectMySQL,
    DisconnectMySQL,
    AddSubscriptionMySQL,
    AddSubscriptionsMySQL,
    AddPaymentMySQL,
    AddPaymentsMySQL,
    AddLicenceMySQL,
    AddLicencesMySQL,
    AddCustomerMySQL,
    AddCustomersMySQL
};
