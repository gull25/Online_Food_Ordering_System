require('dotenv').config();
const mongoose = require('mongoose');
const Rider = require('./src/models/Rider');
const Restaurant = require('./src/models/Restaurant');
const User = require('./src/models/User');

const seedRider = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('Connected to MongoDB');

        // Find any restaurant to attach the rider to
        const restaurant = await Restaurant.findOne();
        
        if (!restaurant) {
            console.log('No restaurants found. Please create a restaurant first.');
            process.exit(1);
        }

        // Check if user already exists
        let user = await User.findOne({ email: 'rider@foodora.com' });
        if (!user) {
            user = await User.create({
                name: 'Ali (Test Rider)',
                email: 'rider@foodora.com',
                password: 'password123',
                phone: '03001234567',
                role: 'rider'
            });
            console.log('Created rider user account');
        }

        // Delete existing rider profile for this user if any
        await Rider.deleteOne({ user: user._id });

        const newRider = await Rider.create({
            user: user._id,
            name: user.name,
            phone: user.phone,
            vehicleDetails: 'Honda CD 70',
            status: 'Available',
            restaurant: restaurant._id,
            currentLocation: {
                type: 'Point',
                coordinates: [74.3587, 31.5204] // Lahore coordinates
            }
        });

        console.log(`Successfully created test rider: ${newRider.name} for restaurant: ${restaurant.name}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding rider:', error);
        process.exit(1);
    }
};

seedRider();
