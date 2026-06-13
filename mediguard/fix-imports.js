const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/app/api', function(filePath) {
  if (filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace imports
    let newContent = content.replace(/from '(\.\.\/\.\.\/\.\.\/\.\.\/|\.\.\/\.\.\/\.\.\/)([^']+)'/g, (match, prefix, modulePath) => {
      changed = true;
      return "from '@/" + modulePath + "'";
    });
    
    if (changed) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Fixed imports in ' + filePath);
    }
  }
});
