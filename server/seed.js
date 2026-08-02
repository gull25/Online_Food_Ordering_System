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

        // 2. Create Restaurants
        const restaurant = await Restaurant.create({
            name: 'Foodora Gourmet',
            description: 'The finest multi-cuisine restaurant in the city.',
            owner: restAdmin._id,
            cuisine: ['American', 'Italian'],
            address: '123 Food Street',
            city: 'Lahore',
            state: 'Punjab',
            zipCode: '54000',
            location: {
                type: 'Point',
                coordinates: [74.3587, 31.5204]
            },
            phone: '042-111-222-333',
            email: 'hello@gourmet.foodora.com',
            images: {
                logo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80',
                banner: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80',
                gallery: []
            },
            openingTime: '09:00 AM',
            closingTime: '11:00 PM',
            rating: 4.8,
            numReviews: 120,
            deliveryFee: 2.50,
            minOrder: 10,
            status: 'Open',
            isActive: true
        });

        // Link restaurant to its admin
        restAdmin.restaurantId = restaurant._id;
        await restAdmin.save();

        // 3. Create Categories
        const categories = await Category.insertMany([
            { name: 'Burgers', description: 'Juicy burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', isActive: true, restaurantId: restaurant._id },
            { name: 'Pizza', description: 'Wood-fired pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', isActive: true, restaurantId: restaurant._id },
            { name: 'Sushi', description: 'Fresh sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80', isActive: true, restaurantId: restaurant._id },
            { name: 'Desserts', description: 'Sweet treats', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80', isActive: true, restaurantId: restaurant._id },
        ]);

        // 4. Create Menu Items
        const menuItems = await MenuItem.insertMany([
            {
                restaurant: restaurant._id,
                category: categories[0]._id, // Burgers
                name: 'Classic Smash Burger',
                description: 'Double beef patty with melted cheese.',
                price: 8.99,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
                isAvailable: true,
                isVegetarian: false,
                isVegan: false,
                isGlutenFree: false,
                sizes: [
                    { name: 'Regular', additionalPrice: 0 },
                    { name: 'Large', additionalPrice: 2.50 }
                ],
                addOns: [
                    { name: 'Extra Cheese', price: 1.00 },
                    { name: 'Bacon', price: 1.50 }
                ]
            },
            {
                restaurant: restaurant._id,
                category: categories[1]._id, // Pizza
                name: 'Margherita Pizza',
                description: 'Classic cheese and tomato pizza.',
                price: 12.99,
                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
                isAvailable: true,
                isVegetarian: true,
                sizes: [
                    { name: 'Small', additionalPrice: 0 },
                    { name: 'Medium', additionalPrice: 3.00 },
                    { name: 'Large', additionalPrice: 5.00 }
                ]
            }
        ]);

        // 5. Create Rider Profile
        const rider = await Rider.create({
            user: riderUser._id,
            name: riderUser.name,
            phone: riderUser.phone,
            vehicleDetails: 'Honda CD 70',
            status: 'Available',
            restaurant: restaurant._id,
            currentLocation: {
                type: 'Point',
                coordinates: [74.3587, 31.5204]
            }
        });

        // 6. Create Offers
        await Offer.create({
            restaurantId: restaurant._id,
            title: 'Welcome Discount',
            code: 'WELCOME10',
            discountPercentage: 10,
            validFrom: new Date(),
            validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            isActive: true
        });

        // 7. Create Dummy Order
        await Order.create({
            user: customer._id,
            restaurant: restaurant._id,
            items: [
                {
                    menuItem: menuItems[0]._id,
                    name: menuItems[0].name,
                    quantity: 2,
                    price: menuItems[0].price
                }
            ],
            totalAmount: menuItems[0].price * 2 + 2.50, // includes delivery fee
            deliveryAddress: {
                firstName: 'Test',
                lastName: 'Customer',
                phone: '22222222222',
                city: 'Lahore',
                streetAddress: '456 Delivery Lane',
                lat: 31.5304,
                lng: 74.3487
            },
            paymentMethod: 'cod',
            paymentStatus: 'Unpaid',
            status: 'Pending',
            statusHistory: [{ status: 'Pending', timestamp: new Date() }]
        });

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
};

seedDB();
