require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');
const Rider = require('./src/models/Rider');
const Order = require('./src/models/Order');
const Offer = require('./src/models/Offer');
const Review = require('./src/models/Review');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB. Wiping existing data...');

        // Wipe all collections
        await User.deleteMany({});
        await Category.deleteMany({});
        await Restaurant.deleteMany({});
        await MenuItem.deleteMany({});
        await Rider.deleteMany({});
        await Order.deleteMany({});
        await Offer.deleteMany({});
        await Review.deleteMany({});

        console.log('Data wiped. Seeding...');

        // 1. Create Users (Super Admin, Restaurant Admin, Customer, Rider)
        const passwordHash = await bcrypt.hash('password123', 10);
        


        const restAdmin = await User.create({
            name: 'Restaurant Admin',
            email: 'vendor@foodora.com',
            password: passwordHash,
            phone: '11111111111',
            role: 'restaurant_admin'
        });

        const customer = await User.create({
            name: 'Test Customer',
            email: 'customer@foodora.com',
            password: passwordHash,
            phone: '22222222222',
            role: 'customer'
        });

        const riderUser = await User.create({
            name: 'Test Rider',
            email: 'rider@foodora.com',
            password: passwordHash,
            phone: '33333333333',
            role: 'rider'
        });

        // 2. Create Restaurants (Removed Foodora Gourmet)

// 3. Create Categories (Removed)

// 4. Create Menu Items (Removed)

// 5. Create Rider Profile
        const rider = await Rider.create({
            user: riderUser._id,
            name: riderUser.name,
            phone: riderUser.phone,
            vehicleDetails: 'Honda CD 70',
            status: 'Available',
            currentLocation: {
                type: 'Point',
                coordinates: [74.3587, 31.5204]
            }
        });

// 6. Create Offers (Removed)

// 7. Create Dummy Order (Removed)

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
};

seedDB();
