const fs = require('fs');
const path = require('path').posix; // Use posix to avoid Windows C:\ issues
const osPath = require('path');

const srcDir = osPath.join(__dirname, 'src');

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(osPath.join(dir, file));
    if (stat.isDirectory()) {
      getAllFiles(osPath.join(dir, file), fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(osPath.join(dir, file).replace(/\\/g, '/'));
    }
  }
  return fileList;
}

const currentFiles = getAllFiles(srcDir);

const oldToNew = {
  'store/store': 'redux/store',
  'features/auth/authSlice': 'redux/authSlice',
  'features/cart/cartSlice': 'redux/cartSlice',
  'features/orders/orderSlice': 'redux/orderSlice',
  'features/restaurant/restaurantSlice': 'redux/restaurantSlice',
  'features/admin/adminSlice': 'redux/adminSlice',
  'features/rider/riderSlice': 'redux/riderSlice',
  'features/auth/AuthForm': 'screens/userScreens/AuthForm',
  
  'pages/Home/HomePage': 'screens/userScreens/HomeScreen',
  'pages/About/AboutPage': 'screens/userScreens/AboutScreen',
  'pages/Contact/ContactPage': 'screens/userScreens/ContactScreen',
  'pages/Login/LoginPage': 'screens/userScreens/LoginScreen',
  'pages/Register/RegisterPage': 'screens/userScreens/SignUpScreen',
  'pages/Restaurants/RestaurantsPage': 'screens/userScreens/RestaurantsScreen',
  'pages/RestaurantDetails/RestaurantDetailPage': 'screens/userScreens/RestaurantDetailScreen',
  'pages/Menu/MenuPage': 'screens/userScreens/MenuScreen',
  'pages/Cart/CartPage': 'screens/userScreens/CartScreen',
  'pages/Checkout/CheckoutPage': 'screens/userScreens/CheckoutScreen',
  'pages/Orders/TrackOrderPage': 'screens/userScreens/TrackOrderScreen',
  'pages/Profile/ProfilePage': 'screens/userScreens/ProfileScreen',
  'pages/Wishlist/WishlistPage': 'screens/userScreens/WishlistScreen',
  'pages/Offers/OffersPage': 'screens/userScreens/OffersScreen',
  'pages/Auth/AuthPage': 'screens/userScreens/AuthPage',
  'pages/NotFound/NotFoundPage': 'screens/errorPages/NotFoundPage',
  'pages/Unauthorized/UnauthorizedPage': 'screens/errorPages/UnauthorizedPage',
  
  'pages/Admin/AdminDashboardPage': 'screens/dashboard/AdminDashboard/dashboard/AdminDashboardPage',
  'pages/Admin/AdminAnalyticsPage': 'screens/dashboard/AdminDashboard/analytics/AdminAnalyticsPage',
  'pages/Admin/AdminCategoriesPage': 'screens/dashboard/AdminDashboard/categories/AdminCategoriesPage',
  'pages/Admin/AdminOffersPage': 'screens/dashboard/AdminDashboard/offers/AdminOffersPage',
  'pages/Admin/AdminOrdersPage': 'screens/dashboard/AdminDashboard/orders/AdminOrdersPage',
  'pages/Admin/AdminProductsPage': 'screens/dashboard/AdminDashboard/products/AdminProductsPage',
  'pages/Admin/AdminMyRestaurantPage': 'screens/dashboard/AdminDashboard/restaurant/AdminMyRestaurantPage',
  'pages/Admin/RestaurantOnboardingPage': 'screens/dashboard/AdminDashboard/restaurant/RestaurantOnboardingPage',
  'pages/Admin/StripeReturnPage': 'screens/dashboard/AdminDashboard/dashboard/StripeReturnPage',
  
  'pages/Rider/RiderDashboard': 'screens/dashboard/UserDashboard/dashboard/RiderDashboard',
  'pages/Rider/ActiveDeliveries': 'screens/dashboard/UserDashboard/deliveries/ActiveDeliveries',
  'pages/Rider/Earnings': 'screens/dashboard/UserDashboard/earnings/Earnings',
  'pages/Rider/Ratings': 'screens/dashboard/UserDashboard/ratings/Ratings',
  
  'components/common/Modal/Modal': 'components/Modals/Modal',
  
  'routes/AppRoutes': 'ConditionalRoutes',
  'routes/AdminRoute': 'ProtectedRoute',
  'routes/RiderRoute': 'ProtectedRoute',
  'routes/CustomerRoute': 'ProtectedRoute',
  'routes/GuestRoute': 'ProtectedRoute',
  
  'layouts/AdminLayout': 'components/adminDashboardComponents/AdminLayout',
};

const dirOldToNew = {
  'utils': 'helper',
  'services': 'helper',
  'hooks': 'components/hooks',
  'pages/Admin/components': 'components/adminDashboardComponents',
  'pages/Rider/components': 'components/userDashboardComponents',
  'pages/Home/components': 'components/homeScreen/homeScreenComponents',
  'pages/RestaurantDetails/components': 'components/homeScreen/restaurantDetailComponents',
  'pages/Offers/components': 'components/homeScreen/offersComponents',
  'pages/Checkout/components': 'components/homeScreen/checkoutComponents',
  'pages/Orders/components': 'components/homeScreen/orderComponents',
};

const newToOld = {};
for (const [o, n] of Object.entries(oldToNew)) newToOld[n] = o;
for (const [o, n] of Object.entries(dirOldToNew)) newToOld[n] = o;

function getOldPath(newAbsPath) {
  const newRel = path.relative(srcDir.replace(/\\/g, '/'), newAbsPath);
  
  const ext = path.extname(newRel);
  const newRelNoExt = ext ? newRel.slice(0, -ext.length) : newRel;

  if (newToOld[newRelNoExt]) {
    return newToOld[newRelNoExt] + ext;
  }
  
  for (const [newD, oldD] of Object.entries(newToOld)) {
    if (newRelNoExt.startsWith(newD + '/')) {
      return newRel.replace(newD, oldD);
    }
  }
  
  return newRel;
}

function getNewPath(oldImportRel) {
  if (oldToNew[oldImportRel]) return oldToNew[oldImportRel];
  
  for (const [oldD, newD] of Object.entries(dirOldToNew)) {
    if (oldImportRel.startsWith(oldD + '/')) {
      return oldImportRel.replace(oldD, newD);
    }
  }
  return oldImportRel;
}

let modifiedCount = 0;

for (const file of currentFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  const oldFileRel = getOldPath(file);
  const oldFileDir = path.dirname(oldFileRel);

  // Match import statements
  const importRegex = /(import.*?from\s+['"])(.*?)(['"])/g;
  content = content.replace(importRegex, (match, p1, p2, p3) => {
    if (!p2.startsWith('.')) return match; 

    // If it's already corrupted by previous script (contains ':/'), clean it up
    let cleanP2 = p2;
    if (cleanP2.includes(':/')) {
      // It was corrupted. Let's just reset the state by assuming the original path.
      // Wait, the easiest way is to use regex: extract what was after `:/`.
      const badMatch = cleanP2.match(/:\/(.*)/);
      if (badMatch) {
        // The old script's target absolute old path was essentially just what's after :/
        // e.g. ../../:/features/auth/authSlice -> features/auth/authSlice
        // So oldImportRel is simply badMatch[1]
        const oldImportRel = badMatch[1];
        
        const newImportRel = getNewPath(oldImportRel);
        
        const currentNewDir = '/' + path.dirname(path.relative(srcDir.replace(/\\/g, '/'), file));
        const targetNewDir = '/' + path.dirname(newImportRel);
        const targetBase = path.basename(newImportRel);
        
        let newRelative = path.relative(currentNewDir, targetNewDir);
        if (newRelative === '') newRelative = '.';
        if (!newRelative.startsWith('.')) newRelative = './' + newRelative;
        
        const finalImportPath = newRelative + '/' + targetBase;
        changed = true;
        return p1 + finalImportPath + p3;
      }
    }

    // 1. Resolve old import relative to old file directory
    const absoluteOldImport = path.resolve('/' + oldFileDir, p2);
    const oldImportRel = absoluteOldImport.substring(1); // remove leading '/'

    // 2. Find NEW path for this import
    const newImportRel = getNewPath(oldImportRel);

    // 3. Compute new relative path
    const currentNewDir = '/' + path.dirname(path.relative(srcDir.replace(/\\/g, '/'), file));
    const targetNewDir = '/' + path.dirname(newImportRel);
    const targetBase = path.basename(newImportRel);
    
    let newRelative = path.relative(currentNewDir, targetNewDir);
    if (newRelative === '') newRelative = '.';
    if (!newRelative.startsWith('.')) newRelative = './' + newRelative;
    
    const finalImportPath = newRelative + '/' + targetBase;
    
    if (p2 !== finalImportPath) {
      changed = true;
      return p1 + finalImportPath + p3;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
}

console.log(`Updated imports in ${modifiedCount} files.`);
