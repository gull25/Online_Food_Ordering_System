const fs = require('fs');
const path = require('path');
const strip = require('strip-comments');

const DIRS_TO_PROCESS = [
  path.join(__dirname, 'client', 'src'),
  path.join(__dirname, 'server', 'src'),
  path.join(__dirname, 'server', 'seed-custom.js')
];

function traverseDirectory(dir, callback) {
  if (!fs.existsSync(dir)) return;

  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    callback(dir);
    return;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDirectory(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

function processFile(filePath) {
  if (!filePath.match(/\.(js|jsx)$/)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // We keep line returns but remove the comments to avoid breaking line numbers too much
    // strip-comments removes single and multi-line JS comments
    let newContent = strip(content, { keepProtected: false });

    // For JSX { /* */ } we can't reliably rely just on strip, but strip-comments handles it well if it treats it as a JS block
    // It leaves empty {} blocks behind though. Let's clean up empty JSX comment blocks:
    newContent = newContent.replace(/\{\s*\}/g, '');

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Stripped comments from: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

console.log('Starting comment removal...');
DIRS_TO_PROCESS.forEach(dir => traverseDirectory(dir, processFile));
console.log('Done!');
