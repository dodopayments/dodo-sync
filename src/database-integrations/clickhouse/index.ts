import { createClient, ClickHouseClient } from '@clickhouse/client';
import DodoPayments from 'dodopayments';

let clickhouseClient: ClickHouseClient | null = null;

/**
 * Connects to ClickHouse database and initializes required tables
 * @param uri - ClickHouse connection URI (e.g., http://localhost:8123)
 */
const ConnectClickHouse = async (uri: string) => {
    try {
        clickhouseClient = createClient({
            url: uri
        });
        await initTables();
        console.log('Connected to ClickHouse successfully');
    } catch (error) {
        console.error('Error connecting to ClickHouse:', error);
        throw error;
    }
}

const DisconnectClickHouse = async () => {
    if (clickhouseClient) {
        await clickhouseClient.close();
        clickhouseClient = null;
    }
}

// Initializes all required tables in ClickHouse

const initTables = async () => {
    const tableQueries = [
        `CREATE TABLE IF NOT EXISTS Subscriptions (
            id String,
            data String,
            updated_at DateTime DEFAULT now()
        ) ENGINE = ReplacingMergeTree(updated_at)
        ORDER BY id;`,

        `CREATE TABLE IF NOT EXISTS Payments (
            id String,
            data String,
            updated_at DateTime DEFAULT now()
        ) ENGINE = ReplacingMergeTree(updated_at)
        ORDER BY id;`,

        `CREATE TABLE IF NOT EXISTS Licenses (
            id String,
            data String,
            updated_at DateTime DEFAULT now()
        ) ENGINE = ReplacingMergeTree(updated_at)
        ORDER BY id;`,

        `CREATE TABLE IF NOT EXISTS Customers (
            id String,
            data String,
            updated_at DateTime DEFAULT now()
        ) ENGINE = ReplacingMergeTree(updated_at)
        ORDER BY id;`
    ];

    for (const query of tableQueries) {
        try {
            if (!clickhouseClient) throw new Error('ClickHouse client is not connected');
            await clickhouseClient.exec({ query });
        } catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
    }
}

async function AddSubscriptionsClickHouse(subscriptions: DodoPayments.Subscriptions.SubscriptionListResponse[]) {
    if (!subscriptions.length) return;
    if (!clickhouseClient) throw new Error('ClickHouse client is not connected');

    try {
        await clickhouseClient.insert({
            table: 'Subscriptions',
            values: subscriptions.map((s) => ({
                id: s.subscription_id,
                data: JSON.stringify(s)
            })),
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.error('Error syncing subscriptions:', error);
        throw error;
    }
}

async function AddSubscriptionClickHouse(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
    await AddSubscriptionsClickHouse([subscriptionData]);
}

async function AddPaymentsClickHouse(payments: DodoPayments.Payments.PaymentListResponse[]) {
    if (!payments.length) return;
    if (!clickhouseClient) throw new Error('ClickHouse client is not connected');

    try {
        await clickhouseClient.insert({
            table: 'Payments',
            values: payments.map((p) => ({
                id: p.payment_id,
                data: JSON.stringify(p)
            })),
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.error('Error syncing payments:', error);
        throw error;
    }
}

async function AddPaymentClickHouse(paymentData: DodoPayments.Payments.PaymentListResponse) {
    await AddPaymentsClickHouse([paymentData]);
}

async function AddLicencesClickHouse(licences: DodoPayments.LicenseKeys.LicenseKey[]) {
    if (!licences.length) return;
    if (!clickhouseClient) throw new Error('ClickHouse client is not connected');

    try {
        await clickhouseClient.insert({
            table: 'Licenses',
            values: licences.map((l) => ({
                id: l.id,
                data: JSON.stringify(l)
            })),
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.error('Error syncing licenses:', error);
        throw error;
    }
}

async function AddLicenceClickHouse(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
    await AddLicencesClickHouse([licenceData]);
}

async function AddCustomersClickHouse(customers: DodoPayments.Customers.Customer[]) {
    if (!customers.length) return;
    if (!clickhouseClient) throw new Error('ClickHouse client is not connected');

    try {
        await clickhouseClient.insert({
            table: 'Customers',
            values: customers.map((c) => ({
                id: c.customer_id,
                data: JSON.stringify(c)
            })),
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.error('Error syncing customers:', error);
        throw error;
    }
}

async function AddCustomerClickHouse(customerData: DodoPayments.Customers.Customer) {
    await AddCustomersClickHouse([customerData]);
}

export {
    ConnectClickHouse,
    DisconnectClickHouse,
    AddSubscriptionClickHouse,
    AddSubscriptionsClickHouse,
    AddPaymentClickHouse,
    AddPaymentsClickHouse,
    AddLicenceClickHouse,
    AddLicencesClickHouse,
    AddCustomerClickHouse,
    AddCustomersClickHouse
};