const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'frontend', 'src');
const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);
const changed = [];

function walk(dir){
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for(const it of items){
    const full = path.join(dir, it.name);
    if(it.isDirectory()) walk(full);
    else if(it.isFile() && exts.has(path.extname(it.name))){
      stripFile(full);
    }
  }
}

function stripFile(file){
  let src = fs.readFileSync(file, 'utf8');
  const original = src;
  // remove JSX comments like {/* ... */}
  src = src.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  // remove block comments /* ... */
  src = src.replace(/\/\*[\s\S]*?\*\//g, '');
  // remove line comments //...
  src = src.replace(/(^|[^:\\])\/\/.*$/gm, '$1');
  // tidy trailing whitespace on lines
  src = src.split('\n').map(l => l.replace(/[ \t]+$/,'')).join('\n');
  // avoid touching files if no change
  if(src !== original){
    fs.writeFileSync(file, src, 'utf8');
    changed.push(file);
  }
}

try{
  walk(root);
  console.log('Stripped comments from', changed.length, 'files');
  changed.forEach(f => console.log(' -', f));
} catch(e){
  console.error('Error:', e.message);
  process.exit(1);
}
