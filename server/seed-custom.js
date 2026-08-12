require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cloudinary = require('./src/config/cloudinary');
const User = require('./src/models/user.model');
const Category = require('./src/models/category.model');
const Restaurant = require('./src/models/restaurant.model');
const MenuItem = require('./src/models/menuItem.model');
const Rider = require('./src/models/rider.model');
const Order = require('./src/models/order.model');
const Offer = require('./src/models/offer.model');
const Review = require('./src/models/review.model');

const COLLECTION = 'C:\\Users\\gulr8\\Downloads\\Collection';

const IMG_PATH = {
  owner1: path.join(COLLECTION, 'Restaurant Owners', 'Restaurant_Owner_01.png'),
  owner2: path.join(COLLECTION, 'Restaurant Owners', 'Restaurant_Owner_02.png'),
  customer1: path.join(COLLECTION, 'Customers', 'Customer_01.png'),
  customer2: path.join(COLLECTION, 'Customers', 'Customer_02.png'),
  rider1: path.join(COLLECTION, 'Riders', 'Rider_01.png'),
  rider2: path.join(COLLECTION, 'Riders', 'Rider_02.png'),
  fb_cover: path.join(COLLECTION, 'FAST BITES', 'FAST BITES(Cover Page).png'),
  fb_logo: path.join(COLLECTION, 'FAST BITES', 'FastBitesLogo.png'),
  fb_zinger: path.join(COLLECTION, 'FAST BITES', 'Zinger_Burger.png'),
  fb_wrap: path.join(COLLECTION, 'FAST BITES', 'Chicken_Wrap.png'),
  fb_crispy: path.join(COLLECTION, 'FAST BITES', 'Fried_Chicken(Crispy).png'),
  fb_wings: path.join(COLLECTION, 'FAST BITES', 'Chicken_Wings(Spicy).png'),
  fb_club: path.join(COLLECTION, 'FAST BITES', 'Club_Sandwich.png'),
  fb_rings: path.join(COLLECTION, 'FAST BITES', 'Onion_Rings.png'),
  fb_pizza: path.join(COLLECTION, 'FAST BITES', 'Chicken_Fajita_Pizza.png'),
  fb_pasta: path.join(COLLECTION, 'FAST BITES', 'Cheese_Pasta.png'),
  fb_fries: path.join(COLLECTION, 'FAST BITES', 'French_Fries.png'),
  fb_lava: path.join(COLLECTION, 'FAST BITES', 'Chocolate_Lava_Cake.png'),
  sa_cover: path.join(COLLECTION, 'SPICY AVENUE', 'SPICE AVENUE(Cover Page).png'),
  sa_logo: path.join(COLLECTION, 'SPICY AVENUE', 'SpicyAvenueLogo.png'),
  sa_biryani: path.join(COLLECTION, 'SPICY AVENUE', 'Chicken_Biryani.png'),
  sa_pulao: path.join(COLLECTION, 'SPICY AVENUE', 'Mutton_Pulao.png'),
  sa_karahi: path.join(COLLECTION, 'SPICY AVENUE', 'Chicken_Karahi.png'),
  sa_haleem: path.join(COLLECTION, 'SPICY AVENUE', 'Haleem.png'),
  sa_tikka: path.join(COLLECTION, 'SPICY AVENUE', 'Chicken_Tikka.png'),
  sa_seekh: path.join(COLLECTION, 'SPICY AVENUE', 'Seekh_Kebabs.png'),
  sa_nihari: path.join(COLLECTION, 'SPICY AVENUE', 'Nihari.png'),
  sa_paratha: path.join(COLLECTION, 'SPICY AVENUE', 'Paratha_With_Butter.png'),
  sa_chaat: path.join(COLLECTION, 'SPICY AVENUE', 'Chana_Chaat.png'),
  sa_gulab: path.join(COLLECTION, 'SPICY AVENUE', 'Gulab_Jamun.png'),
};

const sharp = require('sharp');

const uploadToCloudinary = (filePath, folder) => new Promise(async (resolve, reject) => {
  try {
    let uploadPath = filePath;
    const stat = fs.statSync(filePath);
    let tempPath = null;
    
    // Compress if larger than 1MB to avoid Cloudinary timeouts on slow connections
    if (stat.size > 1 * 1024 * 1024) {
      console.log(`Compressing file: ${path.basename(filePath)} (${(stat.size / 1024 / 1024).toFixed(2)}MB)`);
      tempPath = path.join(__dirname, 'temp_' + path.basename(filePath));
      await sharp(filePath)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(tempPath);
      uploadPath = tempPath;
    }

    const result = await cloudinary.uploader.upload(uploadPath, {
      folder, 
      resource_type: 'image', 
      transformation: [{ width: 800, height: 800, crop: 'pad' }, { fetch_format: 'auto', quality: 'auto' }] 
    });

    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    
    resolve(result.secure_url);
  } catch (error) {
    reject(error);
  }
});

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Wipe all collections
    await Promise.all([
      User.deleteMany({}), Category.deleteMany({}), Restaurant.deleteMany({}),
      MenuItem.deleteMany({}), Rider.deleteMany({}), Order.deleteMany({}),
      Offer.deleteMany({}), Review.deleteMany({}),
    ]);
    console.log('All collections wiped');

    // 2. Upload all images to Cloudinary in parallel
    console.log('Uploading 28 images to Cloudinary (may take 1-2 minutes)...');
    const uploadTasks = [
      () => uploadToCloudinary(IMG_PATH.owner1, 'users'),
      () => uploadToCloudinary(IMG_PATH.owner2, 'users'),
      () => uploadToCloudinary(IMG_PATH.customer1, 'users'),
      () => uploadToCloudinary(IMG_PATH.customer2, 'users'),
      () => uploadToCloudinary(IMG_PATH.rider1, 'users'),
      () => uploadToCloudinary(IMG_PATH.rider2, 'users'),
      () => uploadToCloudinary(IMG_PATH.fb_cover, 'restaurants'),
      () => uploadToCloudinary(IMG_PATH.fb_logo, 'restaurants'),
      () => uploadToCloudinary(IMG_PATH.fb_zinger, 'menu'),
      () => uploadToCloudinary(IMG_PATH.fb_wrap, 'menu'),
      () => uploadToCloudinary(IMG_PATH.fb_crispy, 'menu'),
      () => uploadToCloudinary(IMG_PATH.fb_wings, 'menu'),
      () => uploadToCloudinary(IMG_PATH.fb_club, 'menu'),
      () => uploadToCloudinary(IMG_PATH.fb_rings, 'menu'),
      () => uploadToCloudinary(IMG_PATH.fb_pizza, 'menu'),
      () => uploadToCloudinary(IMG_PATH.fb_pasta, 'menu'),
      () => uploadToCloudinary(IMG_PATH.fb_fries, 'menu'),
      () => uploadToCloudinary(IMG_PATH.fb_lava, 'menu'),
      () => uploadToCloudinary(IMG_PATH.sa_cover, 'restaurants'),
      () => uploadToCloudinary(IMG_PATH.sa_logo, 'restaurants'),
      () => uploadToCloudinary(IMG_PATH.sa_biryani, 'menu'),
      () => uploadToCloudinary(IMG_PATH.sa_pulao, 'menu'),
      () => uploadToCloudinary(IMG_PATH.sa_karahi, 'menu'),
      () => uploadToCloudinary(IMG_PATH.sa_haleem, 'menu'),
      () => uploadToCloudinary(IMG_PATH.sa_tikka, 'menu'),
      () => uploadToCloudinary(IMG_PATH.sa_seekh, 'menu'),
      () => uploadToCloudinary(IMG_PATH.sa_nihari, 'menu'),
      () => uploadToCloudinary(IMG_PATH.sa_paratha, 'menu'),
      () => uploadToCloudinary(IMG_PATH.sa_chaat, 'menu'),
      () => uploadToCloudinary(IMG_PATH.sa_gulab, 'menu'),
    ];
    
    const results = [];
    for (let i = 0; i < uploadTasks.length; i++) {
        console.log(`Uploading image ${i + 1} of ${uploadTasks.length}...`);
        results.push(await uploadTasks[i]());
    }

    const [
      urlOwner1, urlOwner2, urlCustomer1, urlCustomer2, urlRider1, urlRider2,
      urlFbCover, urlFbLogo, urlFbZinger, urlFbWrap, urlFbCrispy, urlFbWings,
      urlFbClub, urlFbRings, urlFbPizza, urlFbPasta, urlFbFries, urlFbLava,
      urlSaCover, urlSaLogo, urlSaBiryani, urlSaPulao, urlSaKarahi, urlSaHaleem,
      urlSaTikka, urlSaSeekh, urlSaNihari, urlSaParatha, urlSaChaat, urlSaGulab,
    ] = results;
    console.log('All 28 images uploaded to Cloudinary');

    // 3. Create Users
    const PASS = 'password123';
    const owner1 = await User.create({ name: 'Ahmed Khan', email: 'owner1@fastbites.com', password: PASS, phone: '03001111111', role: 'restaurant_admin', avatar: urlOwner1 });
    const owner2 = await User.create({ name: 'Sara Ali', email: 'owner2@spicyavenue.com', password: PASS, phone: '03002222222', role: 'restaurant_admin', avatar: urlOwner2 });
    await User.create({ name: 'Usman Malik', email: 'customer1@mail.com', password: PASS, phone: '03003333333', role: 'customer', avatar: urlCustomer1 });
    await User.create({ name: 'Fatima Riaz', email: 'customer2@mail.com', password: PASS, phone: '03004444444', role: 'customer', avatar: urlCustomer2 });
    const riderUser1 = await User.create({ name: 'Bilal Ahmed', email: 'rider1@mail.com', password: PASS, phone: '03005555555', role: 'rider', avatar: urlRider1 });
    const riderUser2 = await User.create({ name: 'Hassan Raza', email: 'rider2@mail.com', password: PASS, phone: '03006666666', role: 'rider', avatar: urlRider2 });
    console.log('Users created (6)');

    // 4. Create Restaurants
    const fastBites = await Restaurant.create({
      owner: owner1._id,
      name: 'Fast Bites',
      description: 'Your go-to spot for crispy fried chicken, loaded burgers, cheesy pizzas, and indulgent desserts - all made fresh and served fast.',
      address: '23 Main Boulevard, Gulberg III',
      city: 'Lahore', state: 'Punjab', zipCode: '54660',
      phone: '042-111-3278', email: 'hello@fastbites.com',
      cuisine: ['American', 'Fast Food', 'Pizza', 'Burgers'],
      images: { logo: urlFbLogo, banner: urlFbCover, gallery: [urlFbZinger, urlFbCrispy, urlFbPizza] },
      location: { type: 'Point', coordinates: [74.3587, 31.5204] },
      rating: 4.6, numReviews: 214, estimatedDeliveryTime: '20-30 min',
      deliveryFee: 99, minOrder: 300, priceRange: '$$', isFeatured: true, status: 'Open',
    });

    const spicyAvenue = await Restaurant.create({
      owner: owner2._id,
      name: 'Spicy Avenue',
      description: 'Authentic Pakistani flavours - slow-cooked nihari, smoky BBQ tikka, hearty biryani, and traditional street food, all under one roof.',
      address: '7 DHA Phase 6, Main Khayaban-e-Ittehad',
      city: 'Lahore', state: 'Punjab', zipCode: '54792',
      phone: '042-111-7724', email: 'hello@spicyavenue.com',
      cuisine: ['Pakistani', 'Desi', 'BBQ', 'Street Food'],
      images: { logo: urlSaLogo, banner: urlSaCover, gallery: [urlSaBiryani, urlSaTikka, urlSaKarahi] },
      location: { type: 'Point', coordinates: [74.4099, 31.4697] },
      rating: 4.8, numReviews: 341, estimatedDeliveryTime: '30-45 min',
      deliveryFee: 79, minOrder: 400, priceRange: '$$', isFeatured: true, status: 'Open',
    });

    owner1.restaurantId = fastBites._id;
    await owner1.save();
    owner2.restaurantId = spicyAvenue._id;
    await owner2.save();
    console.log('Restaurants created (2)');

    // 5. Create Categories
    const mkCat = (restaurantId, names) =>
      Promise.all(names.map((name, i) => Category.create({ name, description: name + ' from our kitchen', order: i, isActive: true, restaurantId })));

    const [fbBurgers, fbChicken, fbSandwiches, fbPizzaPasta, fbSidesDesserts] =
      await mkCat(fastBites._id, ['Burgers & Wraps', 'Fried Chicken', 'Sandwiches & Snacks', 'Pizza & Pasta', 'Sides & Desserts']);

    const [saRice, saKarahiCat, saBBQ, saSlow, saChaat] =
      await mkCat(spicyAvenue._id, ['Rice Dishes', 'Karahi & Curries', 'BBQ & Tikka', 'Slow Cooked', 'Chaat & Desserts']);

    console.log('Categories created (10)');

    // 6. Create Menu Items (10 per restaurant, 2 per category)
    await MenuItem.insertMany([
      // -- FAST BITES --
      // Burgers & Wraps
      { name: 'Zinger Burger', description: 'Crispy golden chicken fillet, tangy coleslaw, jalapenos and our signature zinger sauce stacked in a toasted bun.', price: 750, category: fbBurgers._id, restaurant: fastBites._id, image: urlFbZinger, vegNonVeg: 'Non-Veg', orderCount: 420, sizes: [{ name: 'Regular', additionalPrice: 0 }, { name: 'Double', additionalPrice: 150 }], addOns: [{ name: 'Extra sauce', price: 50 }, { name: 'Add cheese slice', price: 80 }] },
      { name: 'Chicken Wrap', description: 'Grilled chicken strips, fresh lettuce, tomato, cucumber and garlic mayo wrapped in a soft flour tortilla.', price: 650, category: fbBurgers._id, restaurant: fastBites._id, image: urlFbWrap, vegNonVeg: 'Non-Veg', orderCount: 290, addOns: [{ name: 'Extra garlic mayo', price: 50 }] },
      // Fried Chicken
      { name: 'Fried Chicken (Crispy)', description: 'Southern-style crispy fried chicken pieces marinated overnight in a secret blend of 12 herbs and spices.', price: 850, category: fbChicken._id, restaurant: fastBites._id, image: urlFbCrispy, vegNonVeg: 'Non-Veg', orderCount: 510, sizes: [{ name: '2 Piece', additionalPrice: 0 }, { name: '4 Piece', additionalPrice: 400 }] },
      { name: 'Chicken Wings (Spicy)', description: 'Fiery buffalo-glazed wings tossed in our house hot sauce. Served with ranch dipping sauce.', price: 950, category: fbChicken._id, restaurant: fastBites._id, image: urlFbWings, vegNonVeg: 'Non-Veg', orderCount: 380, sizes: [{ name: '6 Piece', additionalPrice: 0 }, { name: '12 Piece', additionalPrice: 900 }], addOns: [{ name: 'Extra ranch', price: 60 }] },
      // Sandwiches & Snacks
      { name: 'Club Sandwich', description: 'Triple-decker toasted sandwich with grilled chicken, fresh tomato, lettuce and mayo.', price: 550, category: fbSandwiches._id, restaurant: fastBites._id, image: urlFbClub, vegNonVeg: 'Non-Veg', orderCount: 175 },
      { name: 'Onion Rings', description: 'Golden beer-battered onion rings, light and crispy on the outside, sweet and tender inside.', price: 350, category: fbSandwiches._id, restaurant: fastBites._id, image: urlFbRings, vegNonVeg: 'Veg', orderCount: 230, addOns: [{ name: 'Ketchup dip', price: 30 }] },
      // Pizza & Pasta
      { name: 'Chicken Fajita Pizza', description: 'Thin-crust pizza loaded with fajita-seasoned chicken, bell peppers, red onions and melted mozzarella.', price: 1100, category: fbPizzaPasta._id, restaurant: fastBites._id, image: urlFbPizza, vegNonVeg: 'Non-Veg', orderCount: 320, sizes: [{ name: 'Medium (9 inch)', additionalPrice: 0 }, { name: 'Large (12 inch)', additionalPrice: 300 }], addOns: [{ name: 'Extra mozzarella', price: 100 }] },
      { name: 'Cheese Pasta', description: 'Penne tossed in a rich four-cheese sauce - mozzarella, cheddar, parmesan and cream cheese - topped with fresh herbs.', price: 800, category: fbPizzaPasta._id, restaurant: fastBites._id, image: urlFbPasta, vegNonVeg: 'Veg', orderCount: 210, addOns: [{ name: 'Add grilled chicken', price: 200 }] },
      // Sides & Desserts
      { name: 'French Fries', description: 'Classic salted fries, double-fried for maximum crunch. Served with ketchup and mayo.', price: 300, category: fbSidesDesserts._id, restaurant: fastBites._id, image: urlFbFries, vegNonVeg: 'Veg', orderCount: 640, sizes: [{ name: 'Regular', additionalPrice: 0 }, { name: 'Large', additionalPrice: 100 }], addOns: [{ name: 'Cheese sauce', price: 80 }, { name: 'Jalapenos', price: 50 }] },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate sponge with a gooey molten centre, dusted with powdered sugar and served with a scoop of vanilla ice cream.', price: 450, category: fbSidesDesserts._id, restaurant: fastBites._id, image: urlFbLava, vegNonVeg: 'Veg', orderCount: 185, addOns: [{ name: 'Extra ice cream scoop', price: 100 }] },
      // -- SPICY AVENUE --
      // Rice Dishes
      { name: 'Chicken Biryani', description: 'Fragrant basmati rice slow-cooked with tender chicken pieces, whole spices, saffron and crispy fried onions.', price: 450, category: saRice._id, restaurant: spicyAvenue._id, image: urlSaBiryani, vegNonVeg: 'Non-Veg', orderCount: 590, sizes: [{ name: 'Half (1 person)', additionalPrice: 0 }, { name: 'Full (2 persons)', additionalPrice: 400 }], addOns: [{ name: 'Raita', price: 80 }, { name: 'Salad', price: 60 }] },
      { name: 'Mutton Pulao', description: 'Slow-simmered mutton broth absorbed into long-grain rice with cardamom, cloves and whole peppercorns.', price: 650, category: saRice._id, restaurant: spicyAvenue._id, image: urlSaPulao, vegNonVeg: 'Non-Veg', orderCount: 310, sizes: [{ name: 'Half (1 person)', additionalPrice: 0 }, { name: 'Full (2 persons)', additionalPrice: 600 }] },
      // Karahi & Curries
      { name: 'Chicken Karahi', description: 'Wok-tossed chicken in a bold tomato-ginger karahi masala, finished with fresh coriander and green chillies.', price: 850, category: saKarahiCat._id, restaurant: spicyAvenue._id, image: urlSaKarahi, vegNonVeg: 'Non-Veg', orderCount: 480, sizes: [{ name: 'Half kg', additionalPrice: 0 }, { name: 'Full kg', additionalPrice: 800 }], addOns: [{ name: 'Naan (2 pcs)', price: 80 }] },
      { name: 'Haleem', description: 'A hearty slow-cooked blend of wheat, lentils and tender beef, garnished with fried onions, ginger and lemon.', price: 400, category: saKarahiCat._id, restaurant: spicyAvenue._id, image: urlSaHaleem, vegNonVeg: 'Non-Veg', orderCount: 260, sizes: [{ name: 'Small', additionalPrice: 0 }, { name: 'Large', additionalPrice: 200 }] },
      // BBQ & Tikka
      { name: 'Chicken Tikka', description: 'Bone-in chicken marinated in yoghurt, tandoori spices and charcoal-grilled to smoky perfection.', price: 700, category: saBBQ._id, restaurant: spicyAvenue._id, image: urlSaTikka, vegNonVeg: 'Non-Veg', orderCount: 430, sizes: [{ name: '4 Pieces', additionalPrice: 0 }, { name: '8 Pieces', additionalPrice: 650 }], addOns: [{ name: 'Chutney', price: 50 }, { name: 'Naan', price: 40 }] },
      { name: 'Seekh Kebabs', description: 'Hand-minced beef mixed with herbs, green chillies and spices, shaped on skewers and grilled over charcoal.', price: 600, category: saBBQ._id, restaurant: spicyAvenue._id, image: urlSaSeekh, vegNonVeg: 'Non-Veg', orderCount: 370, sizes: [{ name: '4 Sticks', additionalPrice: 0 }, { name: '8 Sticks', additionalPrice: 550 }] },
      // Slow Cooked
      { name: 'Nihari', description: 'A royal Mughal-era slow-braised beef shank stew cooked overnight with aromatic spices. Served with naan.', price: 500, category: saSlow._id, restaurant: spicyAvenue._id, image: urlSaNihari, vegNonVeg: 'Non-Veg', orderCount: 295, addOns: [{ name: 'Marrow bone (nalli)', price: 150 }, { name: 'Extra naan (2 pcs)', price: 80 }] },
      { name: 'Paratha With Butter', description: 'Flaky layered whole-wheat paratha made on a hot tawa, served with a generous dollop of white butter.', price: 150, category: saSlow._id, restaurant: spicyAvenue._id, image: urlSaParatha, vegNonVeg: 'Veg', orderCount: 520, sizes: [{ name: '1 Piece', additionalPrice: 0 }, { name: '3 Pieces', additionalPrice: 250 }] },
      // Chaat & Desserts
      { name: 'Chana Chaat', description: 'Spiced boiled chickpeas tossed with diced onion, tomato, tamarind chutney, chaat masala and fresh coriander.', price: 250, category: saChaat._id, restaurant: spicyAvenue._id, image: urlSaChaat, vegNonVeg: 'Veg', orderCount: 340, addOns: [{ name: 'Extra tamarind chutney', price: 40 }] },
      { name: 'Gulab Jamun', description: 'Soft khoya milk dumplings soaked in a fragrant rose water and cardamom sugar syrup. Served warm.', price: 200, category: saChaat._id, restaurant: spicyAvenue._id, image: urlSaGulab, vegNonVeg: 'Veg', orderCount: 410, sizes: [{ name: '2 Pieces', additionalPrice: 0 }, { name: '4 Pieces', additionalPrice: 180 }] },
    ]);
    console.log('Menu items created (20 - 10 per restaurant)');

    // 6.5 Create Offers
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await Offer.insertMany([
      // FAST BITES Offers
      {
        restaurantId: fastBites._id,
        type: 'PERCENTAGE',
        title: '20% OFF on Fried Chicken',
        description: 'Get 20% off on all crispy fried chicken orders this week!',
        discountPercentage: 20,
        code: 'CRISPY20',
        validUntil: nextMonth,
        image: urlFbCrispy,
        isActive: true
      },
      {
        restaurantId: fastBites._id,
        type: 'BOGO',
        title: 'Buy 1 Get 1 Zinger Burger',
        description: 'Double the crunch! Order a Zinger Burger and get another one absolutely free.',
        code: 'ZINGERBOGO',
        validUntil: nextMonth,
        image: urlFbZinger,
        isActive: true
      },
      {
        restaurantId: fastBites._id,
        type: 'EXCLUSIVE',
        title: 'Free Fries with any Burger',
        description: 'Get a free regular serving of French Fries when you order any burger from our menu.',
        code: 'FREEFRIES',
        validUntil: nextMonth,
        image: urlFbFries,
        isActive: true
      },
      {
        restaurantId: fastBites._id,
        type: 'PERCENTAGE',
        title: '15% OFF on Pizzas',
        description: 'Enjoy 15% off on our mouth-watering Chicken Fajita Pizza this weekend.',
        discountPercentage: 15,
        code: 'PIZZA15',
        validUntil: nextMonth,
        image: urlFbPizza,
        isActive: true
      },
      // SPICY AVENUE Offers
      {
        restaurantId: spicyAvenue._id,
        type: 'PERCENTAGE',
        title: '15% OFF on BBQ',
        description: 'Enjoy a 15% discount on our smoky BBQ items including Tikka and Seekh Kebabs.',
        discountPercentage: 15,
        code: 'BBQ15',
        validUntil: nextMonth,
        image: urlSaTikka,
        isActive: true
      },
      {
        restaurantId: spicyAvenue._id,
        type: 'FLAT',
        title: 'Flat Rs. 200 OFF on Biryani',
        description: 'Craving Biryani? Get a flat Rs. 200 off on your next Biryani order.',
        code: 'BIRYANI200',
        validUntil: nextMonth,
        image: urlSaBiryani,
        isActive: true
      },
      {
        restaurantId: spicyAvenue._id,
        type: 'BOGO',
        title: 'Buy 1 Get 1 Paratha',
        description: 'Order one Paratha with Butter and get another one free!',
        code: 'PARATHABOGO',
        validUntil: nextMonth,
        image: urlSaParatha,
        isActive: true
      },
      {
        restaurantId: spicyAvenue._id,
        type: 'PERCENTAGE',
        title: '10% OFF on Curries',
        description: 'Warm up with our delicious Karahi and Haleem. Enjoy 10% off all slow-cooked and curry items.',
        discountPercentage: 10,
        code: 'CURRY10',
        validUntil: nextMonth,
        image: urlSaKarahi,
        isActive: true
      }
    ]);
    console.log('Offers created (8 - 4 per restaurant)');

    // 7. Create Rider Profiles
    await Rider.create({ user: riderUser1._id, name: riderUser1.name, phone: riderUser1.phone, vehicleDetails: 'Honda CD 70 - Plate: LHR-1234', status: 'Available', restaurant: fastBites._id, currentLocation: { type: 'Point', coordinates: [74.3587, 31.5204] } });
    await Rider.create({ user: riderUser2._id, name: riderUser2.name, phone: riderUser2.phone, vehicleDetails: 'Suzuki GS 150 - Plate: LHR-5678', status: 'Available', restaurant: spicyAvenue._id, currentLocation: { type: 'Point', coordinates: [74.4099, 31.4697] } });
    console.log('Rider profiles created (2)');

    // 8. Summary
    console.log('\n=====================================================');
    console.log('  Seeding completed successfully!');
    console.log('=====================================================');
    console.log('  Login accounts  (password: password123)');
    console.log('  owner1@fastbites.com      =>  Fast Bites admin    (Ahmed Khan)');
    console.log('  owner2@spicyavenue.com    =>  Spicy Avenue admin  (Sara Ali)');
    console.log('  customer1@mail.com        =>  Customer            (Usman Malik)');
    console.log('  customer2@mail.com        =>  Customer            (Fatima Riaz)');
    console.log('  rider1@mail.com           =>  Rider - Fast Bites  (Bilal Ahmed)');
    console.log('  rider2@mail.com           =>  Rider - Spicy Ave   (Hassan Raza)');
    console.log('=====================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
