const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    gateway: {
        type: String,
        enum: ['stripe', 'easypaisa', 'jazzcash', 'cod'],
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
        default: 'PKR'
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
transactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
