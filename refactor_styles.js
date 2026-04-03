const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Replace border radius
  newContent = newContent.replace(/rounded-(xl|2xl|3xl|lg|full)/g, (match, p1) => {
    // allow rounded-full for specific status indicators or scrollbars
    if (p1 === 'full') return 'rounded-full'; 
    return 'rounded-md';
  });

  // Remove shadows
  newContent = newContent.replace(/\s?shadow-(sm|md|lg|xl|2xl|none)\s?/g, ' ');
  newContent = newContent.replace(/\s?shadow\s?/g, ' ');

  // Remove blurs
  newContent = newContent.replace(/\s?backdrop-blur-(sm|md|lg|xl)\s?/g, ' ');
  newContent = newContent.replace(/\s?blur-(sm|md|lg|xl)\s?/g, ' ');

  // Remove gradients
  newContent = newContent.replace(/\s?bg-gradient-to-(r|l|t|b|tr|tl|br|bl)\s?/g, ' ');
  newContent = newContent.replace(/\s?from-[a-z0-9/-]+\s?/g, ' ');
  newContent = newContent.replace(/\s?to-[a-z0-9/-]+\s?/g, ' ');
  newContent = newContent.replace(/\s?via-[a-z0-9/-]+\s?/g, ' ');
  
  // Clean up space around replacements where two spaces might be created
  newContent = newContent.replace(/\s{2,}/g, ' ');

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated', filePath);
  }
});
