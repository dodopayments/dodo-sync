import { Client } from 'pg'
import DodoPayments from 'dodopayments';

let pgClient: Client | null = null;

const ConnectPostgres = async (uri: string) => {
    try {
        pgClient = new Client({
            connectionString: uri
        });
        await pgClient.connect();
        await initTables();
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
        throw error;
    }
}

const DisconnectPostgres = async () => {
    if (pgClient) {
        await pgClient.end();
        pgClient = null;
    }
}

const initTables = async () => {
    // I have used JSONB to store the data
    const tableQueries = [
        `CREATE TABLE IF NOT EXISTS Subscriptions (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS Payments (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS Licenses (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS Customers (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );`
    ];
    for (const query of tableQueries) {
        try {
            if (!pgClient) throw new Error('PostgreSQL client is not connected');
            await pgClient.query(query);
        } catch (error) {
            throw error;
        }
    }
}

// Serialises rows for jsonb_array_elements, de-duplicating by id (last one wins)
// so ON CONFLICT DO UPDATE never touches the same row twice in one statement.
function toPayload<T>(items: T[], getId: (item: T) => string): string {
    const byId = new Map<string, T>();
    for (const item of items) byId.set(getId(item), item);
    return JSON.stringify(Array.from(byId, ([k, v]) => ({ k, v })));
}

async function AddSubscriptionsPostgres(subscriptions: DodoPayments.Subscriptions.SubscriptionListResponse[]) {
    if (!subscriptions.length) return;
    if (!pgClient) throw new Error('PostgreSQL client is not connected');

    const query = `
        INSERT INTO Subscriptions (id, data)
        SELECT x->>'k', x->'v'
        FROM jsonb_array_elements($1::jsonb) x
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
    `;
    const payload = toPayload(subscriptions, (s) => s.subscription_id);

    try {
        await pgClient.query(query, [payload]);
    } catch (error) {
        console.error('Error syncing subscriptions:', error);
        throw error;
    }
}

async function AddSubscriptionPostgres(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
    await AddSubscriptionsPostgres([subscriptionData]);
}

async function AddPaymentsPostgres(payments: DodoPayments.Payments.PaymentListResponse[]) {
    if (!payments.length) return;
    if (!pgClient) throw new Error('PostgreSQL client is not connected');

    const query = `
        INSERT INTO Payments (id, data)
        SELECT x->>'k', x->'v'
        FROM jsonb_array_elements($1::jsonb) x
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
    `;
    const payload = toPayload(payments, (p) => p.payment_id);

    try {
        await pgClient.query(query, [payload]);
    } catch (error) {
        console.error('Error syncing payments:', error);
        throw error;
    }
}

async function AddPaymentPostgres(paymentData: DodoPayments.Payments.PaymentListResponse) {
    await AddPaymentsPostgres([paymentData]);
}

async function AddLicencesPostgres(licences: DodoPayments.LicenseKeys.LicenseKey[]) {
    if (!licences.length) return;
    if (!pgClient) throw new Error('PostgreSQL client is not connected');

    const query = `
        INSERT INTO Licenses (id, data)
        SELECT x->>'k', x->'v'
        FROM jsonb_array_elements($1::jsonb) x
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
    `;
    const payload = toPayload(licences, (l) => l.id);

    try {
        await pgClient.query(query, [payload]);
    } catch (error) {
        console.error('Error syncing licenses:', error);
        throw error;
    }
}

async function AddLicencePostgres(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
    await AddLicencesPostgres([licenceData]);
}

async function AddCustomersPostgres(customers: DodoPayments.Customers.Customer[]) {
    if (!customers.length) return;
    if (!pgClient) throw new Error('PostgreSQL client is not connected');

    const query = `
        INSERT INTO Customers (id, data)
        SELECT x->>'k', x->'v'
        FROM jsonb_array_elements($1::jsonb) x
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
    `;
    const payload = toPayload(customers, (c) => c.customer_id);

    try {
        await pgClient.query(query, [payload]);
    } catch (error) {
        console.error('Error syncing customers:', error);
        throw error;
    }
}

async function AddCustomerPostgres(customerData: DodoPayments.Customers.Customer) {
    await AddCustomersPostgres([customerData]);
}

export {
    ConnectPostgres,
    DisconnectPostgres,
    AddSubscriptionPostgres,
    AddSubscriptionsPostgres,
    AddPaymentPostgres,
    AddPaymentsPostgres,
    AddLicencePostgres,
    AddLicencesPostgres,
    AddCustomerPostgres,
    AddCustomersPostgres
};
