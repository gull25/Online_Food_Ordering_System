const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters']
        },
        slug: {
            type: String,
            unique: true,
            sparse: true
        },
        email: {
            type: String,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        phone: {
            type: String,
            maxlength: [20, 'Phone number cannot be longer than 20 characters']
        },
        website: {
            type: String,
            match: [
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                'Please use a valid URL with HTTP or HTTPS'
            ]
        },
        address: {
            type: String,
            required: [true, 'Please add an address']
        },
        city: {
            type: String,
            required: [true, 'Please add a city']
        },
        state: {
            type: String,
            required: [true, 'Please add a state']
        },
        zipCode: {
            type: String,
            required: [true, 'Please add a zip code']
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0] // [longitude, latitude]
            }
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description cannot be more than 500 characters']
        },
        cuisine: {
            type: [String],
            required: true,
        },
        images: {
            logo: { type: String, default: 'no-photo.jpg' },
            banner: { type: String, default: 'no-photo.jpg' },
            gallery: { type: [String], default: [] }
        },
        openingTime: {
            type: String,
            default: '09:00 AM'
        },
        closingTime: {
            type: String,
            default: '10:00 PM'
        },
        status: {
            type: String,
            enum: ['Open', 'Closed'],
            default: 'Open'
        },
        socialMedia: {
            facebook: { type: String, default: '' },
            instagram: { type: String, default: '' },
            tiktok: { type: String, default: '' },
            whatsapp: { type: String, default: '' }
        },
        policies: {
            refund: { type: String, default: '' },
            delivery: { type: String, default: '' },
            privacy: { type: String, default: '' }
        },
        rating: {
            type: Number,
            min: [0, 'Rating must be at least 0'],
            max: [5, 'Rating cannot be more than 5'],
            default: 0
        },
        numReviews: {
            type: Number,
            default: 0
        },
        estimatedDeliveryTime: {
            type: String,
            default: '25-35 min'
        },
        deliveryFee: {
            type: Number,
            default: 0
        },
        priceRange: {
            type: String,
            enum: ['$', '$$', '$$$', '$$$$'],
            default: '$$'
        },
        deliveryRadius: {
            type: Number,
            default: 5
        },
        minOrder: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        },

        stripeAccountId: {
            type: String,
            default: ''
        },
        stripeOnboardingComplete: {
            type: Boolean,
            default: false
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        owner: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Restaurant must have an owner (restaurant_admin)']
        }
    },
    {
        timestamps: true,
    }
);

// ---------------------------------------------------------------------------
// Indexes.
//
// Only the 2dsphere index existed, so the home page's "open restaurants sorted
// by rating" -- the most-requested query in the app -- was a full collection
// scan plus an in-memory sort on every anonymous page load.
// ---------------------------------------------------------------------------
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ status: 1, rating: -1 });
restaurantSchema.index({ status: 1, isFeatured: 1 });
// `findOne({ owner })` runs on every authenticated restaurant-admin request.
restaurantSchema.index({ owner: 1 }, { unique: true, sparse: true });
// Backs the name/cuisine search box.
restaurantSchema.index({ name: 'text', cuisine: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
