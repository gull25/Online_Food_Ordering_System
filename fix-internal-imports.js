const fs = require('fs');
const path = require('path');

const flattenedFiles = [
  'client/src/components/common/Button.jsx',
  'client/src/components/common/ErrorMessage.jsx',
  'client/src/components/common/Input.jsx',
  'client/src/components/common/Loader.jsx',
  'client/src/components/common/SearchBar.jsx',
  'client/src/components/common/Spinner.jsx',
  'client/src/components/common/Toast.jsx',
  'client/src/components/ui/CartItem.jsx',
  'client/src/components/ui/FoodCard.jsx',
  'client/src/components/ui/MenuItemModal.jsx',
  'client/src/components/ui/PriceTag.jsx',
  'client/src/components/ui/RatingStars.jsx',
  'client/src/components/ui/RestaurantCard.jsx',
  'client/src/screens/dashboard/admin/AdminCategoriesPage.jsx',
  'client/src/screens/dashboard/admin/AdminOffersPage.jsx',
  'client/src/screens/dashboard/admin/AdminOrdersPage.jsx',
  'client/src/screens/dashboard/admin/AdminProductsPage.jsx',
  'client/src/screens/dashboard/rider/RiderDashboard.jsx',
  'client/src/screens/dashboard/rider/ActiveDeliveries.jsx',
  'client/src/screens/dashboard/rider/Earnings.jsx',
];

const basePath = path.resolve(__dirname);

flattenedFiles.forEach(target => {
  const fullPath = path.join(basePath, target);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // We moved the file UP one level.
    // So `import ... from "../../something"` becomes `import ... from "../something"`
    // We only want to replace `../` inside import or require statements.
    
    // regex to find `from "../` or `from "../../` etc.
    // and `import("../` etc.
    
    // Find all occurrences of relative imports starting with `../` or `./`
    // Actually, if they were doing `import x from './Icon'`, they meant the same folder. If we moved the file up, and Icon didn't move, then the path to Icon is now `./Icon`? No!
    // Wait. If it was `./Icon` and Icon is in `client/src/components/common/Icon.jsx`?
    // Wait, Icon wasn't moved. So Icon is still at `client/src/components/common/Icon.jsx`.
    // Previously: Button was at `components/common/Button/Button.jsx`.
    // It imported Icon from `../Icon`.
    // Now Button is at `components/common/Button.jsx`.
    // It needs to import Icon from `./Icon`.
    // So `../` becomes `./`.
    
    // Let's replace `from "../` with `from "./`
    // Wait, what if it was `from "../../` ? It should become `from "../`
    // So generally, remove exactly one `../` from every relative path.
    // Or replace `./` with nothing? No, if it was `./`, it referred to a file inside the `Button` folder. But the `Button` folder only had one file! So there were no `./` imports.
    // Therefore, all relative imports started with `../`.
    // We just need to replace `../` with nothing, BUT wait.
    // `../../components` -> remove one `../` -> `../components`
    // `../Icon` -> remove one `../` -> `./Icon`
    
    // Let's do this:
    // Regex matches `from "([^"]+)"` or `from '([^']+)'`
    content = content.replace(/(from\s+['"])([^'"]+)(['"])/g, (match, prefix, importPath, suffix) => {
      if (importPath.startsWith('../')) {
        let newPath = importPath.substring(3); // remove first `../`
        if (!newPath.startsWith('.') && !newPath.startsWith('/')) {
            newPath = './' + newPath;
        }
        return prefix + newPath + suffix;
      }
      return match;
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed internal relative imports in: ${target}`);
  }
});

console.log('Internal import fixing completed.');
