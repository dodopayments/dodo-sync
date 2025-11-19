import mongoose from 'mongoose';
import DodoPayments from 'dodopayments';

const ConnectMongoDB = async (uri: string) => {
    try {
        await mongoose.connect(uri, {
            // Create the database with this name
            dbName: 'dodopayments_sync'
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

// Database Models
const Subscription = mongoose.model('Subscription', new mongoose.Schema({ _id: String }, { strict: false }));
const Payment = mongoose.model('Payment', new mongoose.Schema({ _id: String }, { strict: false }));
const Licence = mongoose.model('Licence', new mongoose.Schema({ _id: String }, { strict: false }));
const Customer = mongoose.model('Customer', new mongoose.Schema({ _id: String }, { strict: false }));


async function AddSubscriptionMongoDB(subscriptionData: DodoPayments.Subscriptions.SubscriptionListResponse) {
    await Subscription.findByIdAndUpdate(
        subscriptionData.subscription_id,
        subscriptionData,
        { upsert: true }
    );
}

async function AddPaymentMongoDB(paymentData: DodoPayments.Payments.PaymentListResponse) {
    await Payment.findByIdAndUpdate(
        paymentData.payment_id,
        paymentData,
        { upsert: true }
    );
}

async function AddLicenceMongoDB(licenceData: DodoPayments.LicenseKeys.LicenseKey) {
    await Licence.findByIdAndUpdate(
        licenceData.subscription_id,
        licenceData,
        { upsert: true }
    );
}

async function AddCustomerMongoDB(customerData: DodoPayments.Customers.Customer) {
    await Customer.findByIdAndUpdate(
        customerData.customer_id,
        customerData,
        { upsert: true }
    );
}

export { ConnectMongoDB, AddSubscriptionMongoDB, AddPaymentMongoDB, AddLicenceMongoDB, AddCustomerMongoDB };