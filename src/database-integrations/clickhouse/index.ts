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
        await clickhouseClient.insert({
            table: 'Subscriptions',
            values: [{
                id: subscriptionData.subscription_id,
                data: JSON.stringify(subscriptionData)
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
        await clickhouseClient.insert({
            table: 'Payments',
            values: [{
                id: paymentData.payment_id,
                data: JSON.stringify(paymentData)
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
        await clickhouseClient.insert({
            table: 'Licenses',
            values: [{
                id: licenceData.id,
                data: JSON.stringify(licenceData)
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
        await clickhouseClient.insert({
            table: 'Customers',
            values: [{
                id: customerData.customer_id,
                data: JSON.stringify(customerData)
            }],
            format: 'JSONEachRow'
        });
    } catch (error) {
        console.error(`Error syncing customer ${customerData.customer_id}:`, error);
        throw error;
    }
}

export { ConnectClickHouse, AddSubscriptionClickHouse, AddPaymentClickHouse, AddLicenceClickHouse, AddCustomerClickHouse };