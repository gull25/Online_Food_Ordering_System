require('dotenv').config();
const mongoose = require('mongoose');
const Rider = require('./src/models/Rider');
const Restaurant = require('./src/models/Restaurant');

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

        const newRider = await Rider.create({
            name: 'Ali (Test Rider)',
            phone: '03001234567',
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
