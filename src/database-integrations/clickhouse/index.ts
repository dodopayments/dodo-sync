import { createClient, ClickHouseClient } from '@clickhouse/client';
import DodoPayments from 'dodopayments';

let clickhouseClient: ClickHouseClient;

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
            await clickhouseClient.exec({ query });
        } catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
    }
}

/**
 * Adds or updates a subscription in ClickHouse
 * @param subscriptionData - Subscription data from Dodo Payments API
 */
async function AddSubscriptionClickHouse(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
    try {
        const id = subscriptionData.subscription_id;
        const dataStr = JSON.stringify(subscriptionData);

        await clickhouseClient.insert({
            table: 'Subscriptions',
            values: [{
                id: id,
                data: dataStr
            }],
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.error(`Error syncing subscription ${subscriptionData.subscription_id}:`, error);
        throw error;
    }
}

/**
 * Adds or updates a payment in ClickHouse
 * @param paymentData - Payment data from Dodo Payments API
 */
async function AddPaymentClickHouse(paymentData: DodoPayments.Payments.PaymentListResponse) {
    try {
        const id = paymentData.payment_id;
        const dataStr = JSON.stringify(paymentData);

        await clickhouseClient.insert({
            table: 'Payments',
            values: [{
                id: id,
                data: dataStr
            }],
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.error(`Error syncing payment ${paymentData.payment_id}:`, error);
        throw error;
    }
}

/**
 * Adds or updates a license in ClickHouse
 * @param licenceData - License data from Dodo Payments API
 */
async function AddLicenceClickHouse(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
    try {
        const id = licenceData.id;
        const dataStr = JSON.stringify(licenceData);

        await clickhouseClient.insert({
            table: 'Licenses',
            values: [{
                id: id,
                data: dataStr
            }],
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.error(`Error syncing license ${licenceData.id}:`, error);
        throw error;
    }
}

/**
 * Adds or updates a customer in ClickHouse
 * @param customerData - Customer data from Dodo Payments API
 */
async function AddCustomerClickHouse(customerData: DodoPayments.Customers.Customer) {
    try {
        const id = customerData.customer_id;
        const dataStr = JSON.stringify(customerData);

        await clickhouseClient.insert({
            table: 'Customers',
            values: [{
                id: id,
                data: dataStr
            }],
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.error(`Error syncing customer ${customerData.customer_id}:`, error);
        throw error;
    }
}

export { ConnectClickHouse, AddSubscriptionClickHouse, AddPaymentClickHouse, AddLicenceClickHouse, AddCustomerClickHouse };