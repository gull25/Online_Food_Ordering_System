const fs = require('fs');
const path = require('path');

const basePath = path.resolve(__dirname, 'client', 'src');

const filesToMove = [
  {
    oldPath: 'components/layout/Navbar/Navbar.jsx',
    newPath: 'components/globalComponents/Navbar.jsx',
    depthChange: -1 // moved up one level
  },
  {
    oldPath: 'components/common/MainLayout.jsx',
    newPath: 'components/globalComponents/MainLayout.jsx',
    depthChange: 0 // same depth
  },
  {
    oldPath: 'components/homeScreen/homeScreenComponents/HomeFooter.jsx',
    newPath: 'components/globalComponents/HomeFooter.jsx',
    depthChange: -1 // moved up one level
  }
];

const globalDir = path.join(basePath, 'components', 'globalComponents');
if (!fs.existsSync(globalDir)) {
  fs.mkdirSync(globalDir, { recursive: true });
}

// Move files and fix internal imports
filesToMove.forEach(file => {
  const oldFull = path.join(basePath, file.oldPath);
  const newFull = path.join(basePath, file.newPath);
  
  if (fs.existsSync(oldFull)) {
    let content = fs.readFileSync(oldFull, 'utf8');
    
    // Fix internal relative imports if depth changed
    if (file.depthChange === -1) {
      content = content.replace(/(from\s+['"])([^'"]+)(['"])/g, (match, prefix, importPath, suffix) => {
        if (importPath.startsWith('../')) {
          let newPath = importPath.substring(3); // remove one '../'
          if (!newPath.startsWith('.') && !newPath.startsWith('/')) {
              newPath = './' + newPath;
          }
          return prefix + newPath + suffix;
        }
        return match;
      });
    }

    fs.writeFileSync(newFull, content, 'utf8');
    fs.unlinkSync(oldFull);
    console.log(`Moved and fixed internal imports for: ${file.oldPath}`);
  }
});

// Cleanup empty dirs
const navbarDir = path.join(basePath, 'components/layout/Navbar');
if (fs.existsSync(navbarDir) && fs.readdirSync(navbarDir).length === 0) fs.rmdirSync(navbarDir);
const layoutDir = path.join(basePath, 'components/layout');
if (fs.existsSync(layoutDir) && fs.readdirSync(layoutDir).length === 0) fs.rmdirSync(layoutDir);

// Now update external files that import these components
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

const allFiles = walkSync(basePath);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Since we don't know the exact relative path other files used, 
  // we look for the unique trailing parts of the old paths and replace them with the new parts.
  
  // Replace references to layout/Navbar/Navbar -> globalComponents/Navbar
  const navRegex = /layout\/Navbar\/Navbar(['"])/g;
  if (navRegex.test(content)) {
    content = content.replace(navRegex, 'globalComponents/Navbar$1');
    changed = true;
  }

  // Replace references to common/MainLayout -> globalComponents/MainLayout
  const mainRegex = /common\/MainLayout(['"])/g;
  if (mainRegex.test(content)) {
    content = content.replace(mainRegex, 'globalComponents/MainLayout$1');
    changed = true;
  }

  // Replace references to homeScreen/homeScreenComponents/HomeFooter -> globalComponents/HomeFooter
  const footerRegex = /homeScreen\/homeScreenComponents\/HomeFooter(['"])/g;
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, 'globalComponents/HomeFooter$1');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated external imports in: ${file}`);
  }
});

console.log('Migration Complete.');
