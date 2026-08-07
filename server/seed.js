require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Demo data seeder.
 *
 * Two things previously made this script unusable:
 *
 *  1. It required './src/models/User', './src/models/Restaurant', … but the
 *     files on disk are lowercase `*.model.js`, so it crashed on the first
 *     require and never ran at all.
 *  2. It hashed the password with bcrypt before calling `User.create()`, while
 *     the User schema's pre-save hook hashes again — so the stored hash was of
 *     a hash and nobody could ever log in with the documented password.
 *
 * It also seeded no restaurants, categories, menu items or offers (all had been
 * commented out), leaving the app with empty listings everywhere. This version
 * produces a complete, browsable dataset.
 */
const User = require('./src/models/user.model');
const Category = require('./src/models/category.model');
const Restaurant = require('./src/models/restaurant.model');
const MenuItem = require('./src/models/menuItem.model');
const Rider = require('./src/models/rider.model');
const Order = require('./src/models/order.model');
const Offer = require('./src/models/offer.model');
const Review = require('./src/models/review.model');

const DEMO_PASSWORD = 'password123';

const IMG = {
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80',
  salad: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80',
  ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  taco: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  storefront: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  interior: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
};

const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Wiping existing data...');

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Restaurant.deleteMany({}),
      MenuItem.deleteMany({}),
      Rider.deleteMany({}),
      Order.deleteMany({}),
      Offer.deleteMany({}),
      Review.deleteMany({}),
    ]);

    console.log('Data wiped. Seeding...');

    // ── 1. Users ────────────────────────────────────────────────────────────
    // Plain password: the schema's pre-save hook does the hashing.
    const restAdmin = await User.create({
      name: 'Restaurant Admin',
      email: 'vendor@foodora.com',
      password: DEMO_PASSWORD,
      phone: '11111111111',
      role: 'restaurant_admin',
    });

    const secondAdmin = await User.create({
      name: 'Sakura Owner',
      email: 'vendor2@foodora.com',
      password: DEMO_PASSWORD,
      phone: '44444444444',
      role: 'restaurant_admin',
    });

    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@foodora.com',
      password: DEMO_PASSWORD,
      phone: '22222222222',
      role: 'customer',
    });

    const riderUser = await User.create({
      name: 'Test Rider',
      email: 'rider@foodora.com',
      password: DEMO_PASSWORD,
      phone: '33333333333',
      role: 'rider',
    });

    // ── 2. Restaurants ──────────────────────────────────────────────────────
    const bellaCucina = await Restaurant.create({
      owner: restAdmin._id,
      name: 'Bella Cucina',
      description:
        'Wood-fired Neapolitan pizza and handmade pasta, built on a family recipe book three generations deep.',
      address: '12 Gulberg Boulevard',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      phone: '042-111-2233',
      email: 'hello@bellacucina.com',
      cuisine: ['Italian', 'Pizza', 'Pasta'],
      images: { logo: IMG.pizza, banner: IMG.interior, gallery: [IMG.pasta, IMG.pizza] },
      location: { type: 'Point', coordinates: [74.3587, 31.5204] },
      rating: 4.7,
      numReviews: 128,
      estimatedDeliveryTime: '25-35 min',
      deliveryFee: 2.99,
      minOrder: 10,
      priceRange: '$$',
      isFeatured: true,
      status: 'Open',
    });

    const sakura = await Restaurant.create({
      owner: secondAdmin._id,
      name: 'Sakura Sushi House',
      description:
        'Omakase-style sushi, hand-pressed nigiri and slow-simmered ramen broths made fresh every morning.',
      address: '48 MM Alam Road',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54660',
      phone: '042-111-4455',
      email: 'hello@sakurasushi.com',
      cuisine: ['Japanese', 'Sushi', 'Ramen'],
      images: { logo: IMG.sushi, banner: IMG.cafe, gallery: [IMG.sushi, IMG.ramen] },
      location: { type: 'Point', coordinates: [74.3499, 31.5165] },
      rating: 4.5,
      numReviews: 86,
      estimatedDeliveryTime: '30-40 min',
      deliveryFee: 0,
      minOrder: 15,
      priceRange: '$$$',
      isFeatured: true,
      status: 'Open',
    });

    const elFuego = await Restaurant.create({
      owner: restAdmin._id,
      name: 'El Fuego Cantina',
      description:
        'Street-style tacos, mesquite-grilled meats and salsas ground fresh on volcanic stone.',
      address: '9 DHA Phase 5',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54792',
      phone: '042-111-6677',
      email: 'hello@elfuegocantina.com',
      cuisine: ['Mexican', 'Tacos', 'Grill'],
      images: { logo: IMG.taco, banner: IMG.storefront, gallery: [IMG.taco] },
      location: { type: 'Point', coordinates: [74.4000, 31.4700] },
      rating: 4.3,
      numReviews: 54,
      estimatedDeliveryTime: '20-30 min',
      deliveryFee: 1.99,
      minOrder: 8,
      priceRange: '$$',
      isFeatured: true,
      status: 'Open',
    });

    // The demo admin logs in expecting to manage Bella Cucina.
    restAdmin.restaurantId = bellaCucina._id;
    await restAdmin.save();
    secondAdmin.restaurantId = sakura._id;
    await secondAdmin.save();

    // ── 3. Categories ───────────────────────────────────────────────────────
    const makeCategories = async (restaurantId, names) =>
      Promise.all(
        names.map((name, index) =>
          Category.create({
            name,
            description: `${name} from our kitchen`,
            order: index,
            isActive: true,
            restaurantId,
          })
        )
      );

    const [bcPizza, bcPasta, bcSalad, bcDessert] = await makeCategories(bellaCucina._id, [
      'Pizza',
      'Pasta',
      'Salads',
      'Desserts',
    ]);
    const [skSushi, skRamen] = await makeCategories(sakura._id, ['Sushi', 'Ramen']);
    const [efTacos, efGrill] = await makeCategories(elFuego._id, ['Tacos', 'From the Grill']);

    // ── 4. Menu items ───────────────────────────────────────────────────────
    const menuItems = [
      // Bella Cucina — Pizza
      {
        name: 'Margherita',
        description: 'San Marzano tomato, fior di latte, fresh basil, cold-pressed olive oil.',
        price: 11.5,
        category: bcPizza._id,
        restaurant: bellaCucina._id,
        image: IMG.pizza,
        vegNonVeg: 'Veg',
        orderCount: 240,
        sizes: [
          { name: 'Regular', additionalPrice: 0 },
          { name: 'Large', additionalPrice: 4 },
        ],
        addOns: [
          { name: 'Extra mozzarella', price: 1.75 },
          { name: 'Truffle oil', price: 2.5 },
        ],
      },
      {
        name: 'Diavola',
        description: 'Spicy salami, chilli flakes, mozzarella and a honey drizzle.',
        price: 14.0,
        category: bcPizza._id,
        restaurant: bellaCucina._id,
        image: IMG.pizza,
        vegNonVeg: 'Non-Veg',
        orderCount: 180,
        sizes: [
          { name: 'Regular', additionalPrice: 0 },
          { name: 'Large', additionalPrice: 4.5 },
        ],
      },
      // Bella Cucina — Pasta
      {
        name: 'Tagliatelle al Ragù',
        description: 'Eight-hour beef ragù, hand-cut tagliatelle, aged parmesan.',
        price: 15.75,
        category: bcPasta._id,
        restaurant: bellaCucina._id,
        image: IMG.pasta,
        vegNonVeg: 'Non-Veg',
        orderCount: 210,
      },
      {
        name: 'Cacio e Pepe',
        description: 'Pecorino romano, cracked black pepper, silky emulsion. Four ingredients, no shortcuts.',
        price: 13.25,
        category: bcPasta._id,
        restaurant: bellaCucina._id,
        image: IMG.pasta,
        vegNonVeg: 'Veg',
        orderCount: 150,
      },
      // Bella Cucina — Salads & Desserts
      {
        name: 'Burrata & Heirloom Tomato',
        description: 'Creamy burrata, heirloom tomatoes, aged balsamic, torn basil.',
        price: 10.5,
        category: bcSalad._id,
        restaurant: bellaCucina._id,
        image: IMG.salad,
        vegNonVeg: 'Veg',
        orderCount: 95,
      },
      {
        name: 'Tiramisù',
        description: 'Espresso-soaked savoiardi, mascarpone cream, bitter cocoa.',
        price: 7.5,
        category: bcDessert._id,
        restaurant: bellaCucina._id,
        image: IMG.dessert,
        vegNonVeg: 'Veg',
        orderCount: 130,
      },
      // Sakura
      {
        name: 'Omakase Nigiri Set',
        description: "Twelve pieces chosen by the chef from the morning's best fish.",
        price: 28.0,
        category: skSushi._id,
        restaurant: sakura._id,
        image: IMG.sushi,
        vegNonVeg: 'Non-Veg',
        orderCount: 175,
      },
      {
        name: 'Salmon Avocado Roll',
        description: 'Scottish salmon, ripe avocado, toasted sesame.',
        price: 12.0,
        category: skSushi._id,
        restaurant: sakura._id,
        image: IMG.sushi,
        vegNonVeg: 'Non-Veg',
        orderCount: 220,
        addOns: [{ name: 'Extra wasabi', price: 0.5 }],
      },
      {
        name: 'Tonkotsu Ramen',
        description: 'Eighteen-hour pork bone broth, chashu, ajitama egg, spring onion.',
        price: 16.5,
        category: skRamen._id,
        restaurant: sakura._id,
        image: IMG.ramen,
        vegNonVeg: 'Non-Veg',
        orderCount: 265,
        addOns: [
          { name: 'Extra chashu', price: 3.5 },
          { name: 'Extra noodles', price: 2 },
        ],
      },
      // El Fuego
      {
        name: 'Al Pastor Tacos (3)',
        description: 'Spit-roasted pork, charred pineapple, onion, coriander.',
        price: 9.75,
        category: efTacos._id,
        restaurant: elFuego._id,
        image: IMG.taco,
        vegNonVeg: 'Non-Veg',
        orderCount: 310,
      },
      {
        name: 'Grilled Chicken Burrito',
        description: 'Mesquite-grilled chicken, black beans, lime rice, chipotle crema.',
        price: 12.5,
        category: efGrill._id,
        restaurant: elFuego._id,
        image: IMG.burger,
        vegNonVeg: 'Non-Veg',
        orderCount: 145,
      },
      {
        name: 'Charred Corn Salad',
        description: 'Fire-roasted corn, cotija, chilli-lime dressing.',
        price: 8.0,
        category: efGrill._id,
        restaurant: elFuego._id,
        image: IMG.salad,
        vegNonVeg: 'Veg',
        orderCount: 70,
      },
    ];

    const createdItems = await MenuItem.insertMany(menuItems);

    // ── 5. Rider profile ────────────────────────────────────────────────────
    await Rider.create({
      user: riderUser._id,
      name: riderUser.name,
      phone: riderUser.phone,
      vehicleDetails: 'Honda CD 70',
      status: 'Available',
      restaurant: bellaCucina._id,
      currentLocation: { type: 'Point', coordinates: [74.3587, 31.5204] },
    });

    // ── 6. Offers ───────────────────────────────────────────────────────────
    await Offer.insertMany([
      {
        restaurantId: bellaCucina._id,
        type: 'PERCENTAGE',
        title: '20% off your first pizza',
        description: 'Applies to any pizza on the menu. One use per customer.',
        discountPercentage: 20,
        code: 'PIZZA20',
        validUntil: daysFromNow(30),
        image: IMG.pizza,
        isActive: true,
      },
      {
        restaurantId: bellaCucina._id,
        type: 'EXCLUSIVE',
        title: 'Pasta night — 15% off',
        description: 'Every order from the pasta menu, all week long.',
        discountPercentage: 15,
        code: 'PASTA15',
        validUntil: daysFromNow(14),
        image: IMG.pasta,
        isActive: true,
      },
      {
        restaurantId: sakura._id,
        type: 'PERCENTAGE',
        title: '10% off sushi sets',
        description: 'Save on every omakase and nigiri set.',
        discountPercentage: 10,
        code: 'SUSHI10',
        validUntil: daysFromNow(21),
        image: IMG.sushi,
        isActive: true,
      },
      {
        restaurantId: elFuego._id,
        type: 'PERCENTAGE',
        title: 'Taco Tuesday — 25% off',
        description: 'A quarter off every taco plate.',
        discountPercentage: 25,
        code: 'TACO25',
        validUntil: daysFromNow(10),
        image: IMG.taco,
        isActive: true,
      },
    ]);

    // ── 7. A delivered order, so history/analytics aren't empty ─────────────
    const margherita = createdItems.find((i) => i.name === 'Margherita');
    const tiramisu = createdItems.find((i) => i.name === 'Tiramisù');

    const subtotal = margherita.price * 2 + tiramisu.price;
    const tax = subtotal * 0.087;
    const serviceFee = 2.5;
    const deliveryFee = bellaCucina.deliveryFee;
    const totalAmount = Math.round((subtotal + tax + serviceFee + deliveryFee) * 100) / 100;

    await Order.create({
      user: customer._id,
      restaurant: bellaCucina._id,
      items: [
        { menuItem: margherita._id, name: margherita.name, quantity: 2, price: margherita.price },
        { menuItem: tiramisu._id, name: tiramisu.name, quantity: 1, price: tiramisu.price },
      ],
      subtotal,
      tax,
      serviceFee,
      deliveryFee,
      discountAmount: 0,
      totalAmount,
      riderEarning: Math.round(totalAmount * 0.1 * 100) / 100,
      status: 'DELIVERED',
      paymentMethod: 'cash',
      paymentGateway: 'cod',
      paymentStatus: 'COD_PAID',
      deliveryAddress: {
        firstName: 'Test',
        lastName: 'Customer',
        phone: '22222222222',
        city: 'Lahore',
        streetAddress: '5 Model Town',
        lat: 31.4805,
        lng: 74.3239,
      },
      statusHistory: [
        { status: 'PLACED', timestamp: daysFromNow(-2) },
        { status: 'ACCEPTED', timestamp: daysFromNow(-2) },
        { status: 'PREPARING', timestamp: daysFromNow(-2) },
        { status: 'OUT_FOR_DELIVERY', timestamp: daysFromNow(-2) },
        { status: 'DELIVERED', timestamp: daysFromNow(-2) },
      ],
    });

    console.log('\nSeeding completed successfully!');
    console.log('─────────────────────────────────────────');
    console.log(`Restaurants : 3   Menu items : ${createdItems.length}   Offers : 4`);
    console.log('Login accounts (all use password: %s)', DEMO_PASSWORD);
    console.log('  customer@foodora.com  → customer');
    console.log('  vendor@foodora.com    → restaurant admin (Bella Cucina)');
    console.log('  vendor2@foodora.com   → restaurant admin (Sakura)');
    console.log('  rider@foodora.com     → rider');
    console.log('─────────────────────────────────────────');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
