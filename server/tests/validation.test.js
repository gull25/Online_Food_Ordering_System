/* Replays the exact payload shapes the client forms produce through the server schemas. */
const path = require('path');
const SERVER = path.resolve(__dirname, '..');
require(path.join(SERVER, 'src/config/env'));

const r = (p) => require(path.join(SERVER, 'src/validations', p));
const { createRestaurantSchema, createMenuItemSchema, listRestaurantsSchema } = r('restaurant.validation');
const { createOrderSchema, updateStatusSchema, listOrdersSchema } = r('order.validation');
const { registerSchema, loginSchema } = r('auth.validation');
const { createOfferSchema, createCategorySchema, createReviewSchema, updateProfileSchema } = r('catalog.validation');

let pass = 0;
let fail = 0;

const check = (name, schema, input, { expect = 'ok', assert } = {}) => {
  const result = schema.safeParse(input);
  const ok = expect === 'ok' ? result.success : !result.success;
  const extra = ok && assert && result.success ? assert(result.data) : true;

  if (ok && extra) {
    pass += 1;
    console.log(`  PASS  ${name}`);
  } else {
    fail += 1;
    const detail = result.success
      ? JSON.stringify(result.data)
      : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    console.log(`  FAIL  ${name} — ${detail}`);
  }
};

console.log('\n── Registration (AuthForm) ──');
check('customer signup', registerSchema, {
  name: 'Ada Lovelace', email: 'Ada@Example.COM', password: 'Password123', role: 'customer',
}, { assert: (d) => d.email === 'ada@example.com' });
check('rider signup with phone', registerSchema, {
  name: 'Rider One', email: 'r@x.co', password: 'Password123', phone: '+1 555 000 1111', role: 'rider',
});
check('role omitted defaults to customer', registerSchema, {
  name: 'No Role', email: 'n@x.co', password: 'Password123',
}, { assert: (d) => d.role === 'customer' });
check('role "admin" rejected', registerSchema, {
  name: 'Mallory', email: 'm@x.co', password: 'Password123', role: 'admin',
}, { expect: 'fail' });
check('weak password rejected', registerSchema, {
  name: 'Weak', email: 'w@x.co', password: 'password',
}, { expect: 'fail' });
check('unknown key stripped', registerSchema, {
  name: 'Strip Me', email: 's@x.co', password: 'Password123', isAdmin: true, favorites: ['x'],
}, { assert: (d) => !('isAdmin' in d) && !('favorites' in d) });

console.log('\n── Login ──');
check('normal login', loginSchema, { email: 'a@b.co', password: 'anything' });
check('legacy short password still accepted', loginSchema, { email: 'a@b.co', password: '123' });

console.log('\n── Checkout order (CheckoutScreen payload) ──');
const order = {
  restaurant: '507f1f77bcf86cd799439011',
  items: [
    { menuItem: '507f1f77bcf86cd799439012', quantity: 2, selectedSize: { name: 'Large' }, selectedAddOns: [{ name: 'Cheese' }] },
    { menuItem: '507f1f77bcf86cd799439012', quantity: 1, selectedAddOns: [] },
  ],
  deliveryAddress: {
    firstName: 'Ada', lastName: 'Lovelace', phone: '+1 555 000 1111',
    city: 'Lahore', streetAddress: '12 Analytical Engine Road', instructions: '',
  },
  paymentMethod: 'cod',
  idempotencyKey: 'b7f3c2e1-1111-2222-3333-444455556666',
};
check('cash-on-delivery order (client sends "cod")', createOrderSchema, order);
check('stripe order', createOrderSchema, { ...order, paymentMethod: 'stripe' });
check('bank transfer (meezan)', createOrderSchema, { ...order, paymentMethod: 'meezan' });
check('same item twice with different sizes', createOrderSchema, order, {
  assert: (d) => d.items.length === 2,
});
check('client-supplied price/total stripped', createOrderSchema, {
  ...order,
  totalAmount: 0.01,
  items: [{ menuItem: '507f1f77bcf86cd799439012', quantity: 1, price: 0.01, name: 'Free lunch' }],
}, { assert: (d) => !('totalAmount' in d) && !('price' in d.items[0]) && !('name' in d.items[0]) });
check('client-supplied status/rider stripped', createOrderSchema, {
  ...order, status: 'DELIVERED', paymentStatus: 'PAID', rider: '507f1f77bcf86cd799439013', riderEarning: 999,
}, { assert: (d) => !('status' in d) && !('paymentStatus' in d) && !('rider' in d) });
check('empty cart rejected', createOrderSchema, { ...order, items: [] }, { expect: 'fail' });
check('quantity 0 rejected', createOrderSchema, {
  ...order, items: [{ menuItem: '507f1f77bcf86cd799439012', quantity: 0 }],
}, { expect: 'fail' });
check('negative quantity rejected', createOrderSchema, {
  ...order, items: [{ menuItem: '507f1f77bcf86cd799439012', quantity: -5 }],
}, { expect: 'fail' });
check('bad restaurant id rejected', createOrderSchema, { ...order, restaurant: 'not-an-id' }, { expect: 'fail' });
check('operator object as id rejected', createOrderSchema, { ...order, restaurant: { $ne: null } }, { expect: 'fail' });

console.log('\n── Order status update ──');
check('restaurant accepts', updateStatusSchema.body, { status: 'ACCEPTED' });
check('customer cancels', updateStatusSchema.body, { status: 'CANCELLED' });
check('PAID is not a status', updateStatusSchema.body, { status: 'PAID' }, { expect: 'fail' });
check('cancelledBy stripped', updateStatusSchema.body, { status: 'CANCELLED', cancelledBy: 'system' }, {
  assert: (d) => !('cancelledBy' in d),
});

console.log('\n── Restaurant onboarding (multipart, append-field shapes) ──');
const onboarding = {
  name: 'Fast Bites', description: 'Great burgers and wraps, fast.', address: '12 Main Street',
  city: 'Lahore', state: 'Punjab', zipCode: '54000',
  cuisine: ['Fast Food'],
  phone: '', email: '', website: '',
  openingTime: '09:00 AM', closingTime: '10:00 PM',
  deliveryFee: '0', minOrder: '10', estimatedDeliveryTime: '30 min', status: 'Open',
  socialMedia: { facebook: '', instagram: '', tiktok: '', whatsapp: '' },
  policies: { refund: '', delivery: '', privacy: '' },
};
check('blank optional fields accepted', createRestaurantSchema, onboarding, {
  assert: (d) => d.email === undefined && d.phone === undefined && d.deliveryFee === 0,
});
check('platform fields stripped', createRestaurantSchema, {
  ...onboarding, isFeatured: true, rating: 5, numReviews: 9999,
  owner: '507f1f77bcf86cd799439011', stripeOnboardingComplete: true, stripeAccountId: 'acct_x',
}, {
  assert: (d) =>
    !('isFeatured' in d) && !('rating' in d) && !('owner' in d) && !('stripeAccountId' in d),
});
check('missing cuisine rejected', createRestaurantSchema, { ...onboarding, cuisine: [] }, { expect: 'fail' });

console.log('\n── Menu item (multipart) ──');
check('menu item with JSON sizes/addOns', createMenuItemSchema, {
  name: 'Zinger Burger', description: 'Crispy chicken fillet burger.', price: '8.99',
  category: '507f1f77bcf86cd799439011', vegNonVeg: 'Non-Veg', isAvailable: 'true',
  sizes: '[{"name":"Regular","additionalPrice":0},{"name":"Large","additionalPrice":2}]',
  addOns: '[{"name":"Extra cheese","price":1.5}]',
}, { assert: (d) => d.sizes.length === 2 && d.addOns[0].price === 1.5 && d.isAvailable === true });
check('isAvailable "false" is false, not truthy', createMenuItemSchema, {
  name: 'Sold Out', description: 'Not available today.', price: '5',
  category: '507f1f77bcf86cd799439011', isAvailable: 'false',
}, { assert: (d) => d.isAvailable === false });
check('malformed sizes JSON rejected', createMenuItemSchema, {
  name: 'Broken', description: 'Bad payload.', price: '5',
  category: '507f1f77bcf86cd799439011', sizes: '[{name:',
}, { expect: 'fail' });
check('orderCount/rating stripped', createMenuItemSchema, {
  name: 'Cheat', description: 'Trying to fake popularity.', price: '5',
  category: '507f1f77bcf86cd799439011', orderCount: 99999, rating: 5, numReviews: 500,
}, { assert: (d) => !('orderCount' in d) && !('rating' in d) });

console.log('\n── Offers ──');
check('offer with code', createOfferSchema, {
  title: 'Launch week', discountPercentage: '20', code: 'LAUNCH20',
  validUntil: new Date(Date.now() + 86400000).toISOString(),
});
check('regex payload as code rejected', createOfferSchema, {
  title: 'Evil', discountPercentage: '20', code: '(a+)+$',
  validUntil: new Date(Date.now() + 86400000).toISOString(),
}, { expect: 'fail' });
check('past expiry rejected', createOfferSchema, {
  title: 'Expired', discountPercentage: '20', validUntil: '2020-01-01',
}, { expect: 'fail' });
check('discount over 100 rejected', createOfferSchema, {
  title: 'Too good', discountPercentage: '150',
  validUntil: new Date(Date.now() + 86400000).toISOString(),
}, { expect: 'fail' });

console.log('\n── Categories / reviews / profile ──');
check('category', createCategorySchema, { name: 'Burgers', order: '1' });
check('category restaurantId stripped', createCategorySchema, {
  name: 'Burgers', restaurantId: '507f1f77bcf86cd799439011',
}, { assert: (d) => !('restaurantId' in d) });
check('review', createReviewSchema, { orderId: '507f1f77bcf86cd799439011', rating: 5, comment: 'Great!' });
check('rating 6 rejected', createReviewSchema, { orderId: '507f1f77bcf86cd799439011', rating: 6 }, { expect: 'fail' });
check('profile update: only name/phone', updateProfileSchema, {
  name: 'New Name', phone: '+1 555 000 1111', role: 'admin', email: 'x@y.co', avatar: 'http://evil',
}, { assert: (d) => !('role' in d) && !('email' in d) && !('avatar' in d) });

console.log('\n── Query pagination ──');
check('defaults applied', listOrdersSchema, {}, { assert: (d) => d.page === 1 && d.limit === 20 });
check('string coercion', listRestaurantsSchema, { page: '3', limit: '50' }, {
  assert: (d) => d.page === 3 && d.limit === 50,
});
check('limit ceiling enforced', listRestaurantsSchema, { limit: '100000' }, { expect: 'fail' });
check('page 0 rejected', listRestaurantsSchema, { page: '0' }, { expect: 'fail' });

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
