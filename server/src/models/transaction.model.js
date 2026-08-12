const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    gateway: {
        type: String,
        enum: ['stripe', 'easypaisa', 'jazzcash', 'cod', 'meezan', 'ubl'],
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        // Every amount in the system is priced and charged in USD (the Stripe
        // PaymentIntent is created with `currency: 'usd'`), so a PKR default
        // mislabelled the ledger for every transaction that did not set it.
        default: 'USD'
    },
    status: {
        type: String,
        enum: ['Success', 'Failed', 'Pending'],
        required: true
    },
    rawResponse: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

transactionSchema.index({ orderId: 1 });
// Unique per gateway: a webhook redelivery for a payment already recorded now
// fails the write instead of adding a duplicate ledger row for one payment.
transactionSchema.index({ gateway: 1, transactionId: 1 }, { unique: true });

module.exports = mongoose.model('Transaction', transactionSchema);
