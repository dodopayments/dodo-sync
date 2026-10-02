import mongoose from 'mongoose';
import DodoPayments from 'dodopayments';

const ConnectMongoDB = async (uri: string) => {
    try {
        // Extract database name from URI if present, fallback to 'dodopayments_sync'
        const pathPart = uri.replace(/^mongodb(?:\+srv)?:\/\/[^\/]+/, '');
        const match = pathPart.match(/^\/([^?\/]+)/);
        const dbNameFromUri = match && match[1]?.trim() ? decodeURIComponent(match[1].trim()) : undefined;

        await mongoose.connect(uri, {
            // Create database with this name if the database name doesn't exist in connection url
            dbName: dbNameFromUri || 'dodopayments_sync'
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

// Database Models
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', new mongoose.Schema({ _id: String }, { strict: false }));
const Payment = mongoose.models.Payment || mongoose.model('Payment', new mongoose.Schema({ _id: String }, { strict: false }));
const Licence = mongoose.models.Licence || mongoose.model('Licence', new mongoose.Schema({ _id: String }, { strict: false }));
const Customer = mongoose.models.Customer || mongoose.model('Customer', new mongoose.Schema({ _id: String }, { strict: false }));

const DisconnectMongoDB = async () => {
    try {
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
};

async function AddSubscriptionsMongoDB(subscriptions: DodoPayments.Subscriptions.SubscriptionListResponse[]) {
    if (!subscriptions.length) return;
    const ops = subscriptions.map((s) => ({
        updateOne: {
            filter: { _id: s.subscription_id },
            update: { $set: s },
            upsert: true
        }
    }));
    await Subscription.bulkWrite(ops);
}

async function AddSubscriptionMongoDB(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
    await AddSubscriptionsMongoDB([subscriptionData]);
}

async function AddPaymentsMongoDB(payments: DodoPayments.Payments.PaymentListResponse[]) {
    if (!payments.length) return;
    const ops = payments.map((p) => ({
        updateOne: {
            filter: { _id: p.payment_id },
            update: { $set: p },
            upsert: true
        }
    }));
    await Payment.bulkWrite(ops);
}

async function AddPaymentMongoDB(paymentData: DodoPayments.Payments.PaymentListResponse) {
    await AddPaymentsMongoDB([paymentData]);
}

async function AddLicencesMongoDB(licences: DodoPayments.LicenseKeys.LicenseKey[]) {
    if (!licences.length) return;
    const ops = licences.map((l) => ({
        updateOne: {
            filter: { _id: l.id || l.subscription_id },
            update: { $set: l },
            upsert: true
        }
    }));
    await Licence.bulkWrite(ops);
}

async function AddLicenceMongoDB(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
    await AddLicencesMongoDB([licenceData]);
}

async function AddCustomersMongoDB(customers: DodoPayments.Customers.Customer[]) {
    if (!customers.length) return;
    const ops = customers.map((c) => ({
        updateOne: {
            filter: { _id: c.customer_id },
            update: { $set: c },
            upsert: true
        }
    }));
    await Customer.bulkWrite(ops);
}

async function AddCustomerMongoDB(customerData: DodoPayments.Customers.Customer) {
    await AddCustomersMongoDB([customerData]);
}

export {
    ConnectMongoDB,
    DisconnectMongoDB,
    AddSubscriptionMongoDB,
    AddSubscriptionsMongoDB,
    AddPaymentMongoDB,
    AddPaymentsMongoDB,
    AddLicenceMongoDB,
    AddLicencesMongoDB,
    AddCustomerMongoDB,
    AddCustomersMongoDB
};
