const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Please add a phone number']
        },
        vehicleDetails: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['Available', 'Busy', 'Offline'],
            default: 'Offline'
        },
        restaurant: {
            type: mongoose.Schema.ObjectId,
            ref: 'Restaurant',
            required: [true, 'Rider must be associated with a restaurant']
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Rider', riderSchema);
