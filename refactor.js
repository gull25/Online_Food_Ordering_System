const fs = require('fs');
const path = require('path');

const targets = [
  'client/src/components/common/Button/Button.jsx',
  'client/src/components/common/ErrorMessage/ErrorMessage.jsx',
  'client/src/components/common/Input/Input.jsx',
  'client/src/components/common/Loader/Loader.jsx',
  'client/src/components/common/SearchBar/SearchBar.jsx',
  'client/src/components/common/Spinner/Spinner.jsx',
  'client/src/components/common/Toast/Toast.jsx',
  'client/src/components/ui/CartItem/CartItem.jsx',
  'client/src/components/ui/FoodCard/FoodCard.jsx',
  'client/src/components/ui/MenuItemModal/MenuItemModal.jsx',
  'client/src/components/ui/PriceTag/PriceTag.jsx',
  'client/src/components/ui/RatingStars/RatingStars.jsx',
  'client/src/components/ui/RestaurantCard/RestaurantCard.jsx',
  'client/src/screens/dashboard/admin/categories/AdminCategoriesPage.jsx',
  'client/src/screens/dashboard/admin/offers/AdminOffersPage.jsx',
  'client/src/screens/dashboard/admin/orders/AdminOrdersPage.jsx',
  'client/src/screens/dashboard/admin/products/AdminProductsPage.jsx',
  'client/src/screens/dashboard/rider/dashboard/RiderDashboard.jsx',
  'client/src/screens/dashboard/rider/deliveries/ActiveDeliveries.jsx',
  'client/src/screens/dashboard/rider/earnings/Earnings.jsx',
];

const basePath = path.resolve(__dirname);

// Step 1: Move Files
const movedMap = [];

targets.forEach(target => {
  const fullPath = path.join(basePath, target);
  if (fs.existsSync(fullPath)) {
    const dir = path.dirname(fullPath); // e.g. .../Button
    const newPath = `${dir}.jsx`; // e.g. .../Button.jsx
    
    // In case the parent is categories, we move to AdminCategoriesPage.jsx in parent
    const parentDir = path.dirname(dir);
    const fileName = path.basename(fullPath);
    const actualNewPath = path.join(parentDir, fileName);

    fs.renameSync(fullPath, actualNewPath);
    console.log(`Moved: ${fileName} to ${actualNewPath}`);
    
    // Remove the old directory if empty
    if (fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
    }
    
    // Map what needs to be replaced in imports
    const oldImportPiece = path.basename(dir) + '/' + path.parse(fileName).name; // e.g., Button/Button or categories/AdminCategoriesPage
    const newImportPiece = path.parse(fileName).name; // e.g., Button or AdminCategoriesPage
    movedMap.push({ old: oldImportPiece, new: newImportPiece });
  }
});

console.log('File moving completed. Starting import updates...');

// Step 2: Recursively update imports in all .js and .jsx files
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
        filelist.push(filepath);
      }
    }
  });
  return filelist;
};

const allFiles = walkSync(path.join(basePath, 'client', 'src'));

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  movedMap.forEach(mapping => {
    // Look for import paths matching the old folder/file pattern
    // e.g., /Button/Button or /categories/AdminCategoriesPage
    const regex = new RegExp(`/${mapping.old}(['"\\.])`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `/${mapping.new}$1`);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in: ${file}`);
  }
});

console.log('Done!');
