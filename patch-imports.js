const fs = require('fs');
const path = require('path');

const basePath = path.resolve(__dirname, 'client', 'src');

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

  // Replace occurrences of `layout/Navbar` (not followed by `/Navbar`) with `globalComponents/Navbar`
  const regex = /layout\/Navbar(['"])/g;
  if (regex.test(content)) {
    content = content.replace(regex, 'globalComponents/Navbar$1');
    changed = true;
  }
  
  // Specific fix for MainLayout since it moved into the same folder
  // `../components/layout/Navbar` -> `./Navbar`
  // Actually, wait, `../components/layout/Navbar` would have been replaced by `../components/globalComponents/Navbar` by the above regex.
  // We can just replace `../components/globalComponents/Navbar` with `./Navbar` in MainLayout.jsx
  if (file.endsWith('MainLayout.jsx')) {
    content = content.replace(/\.\.\/components\/globalComponents\/Navbar/g, './Navbar');
    content = content.replace(/\.\.\/components\/globalComponents\/HomeFooter/g, './HomeFooter');
    content = content.replace(/layout\/Navbar/g, './Navbar');
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated lingering layout/Navbar imports in: ${file}`);
  }
});

// Delete components/layout/Navbar/index.jsx
const indexFile = path.join(basePath, 'components', 'layout', 'Navbar', 'index.jsx');
if (fs.existsSync(indexFile)) {
    fs.unlinkSync(indexFile);
    console.log('Deleted index.jsx');
}
const navbarDir = path.join(basePath, 'components', 'layout', 'Navbar');
if (fs.existsSync(navbarDir) && fs.readdirSync(navbarDir).length === 0) fs.rmdirSync(navbarDir);
const layoutDir = path.join(basePath, 'components', 'layout');
if (fs.existsSync(layoutDir) && fs.readdirSync(layoutDir).length === 0) fs.rmdirSync(layoutDir);

console.log('Patch complete.');
