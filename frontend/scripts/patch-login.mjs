import fs from 'fs';

const loginPath = new URL('../src/pages/public/LoginPage.jsx', import.meta.url);
let s = fs.readFileSync(loginPath, 'utf8');
s = s.replace(
  /\n          <div className="relative my-6">[\s\S]*?administrador automáticamente\.\n          <\/p>\n/,
  '\n',
);
fs.writeFileSync(loginPath, s);

const createPath = new URL('../src/pages/citizen/CreateReport.jsx', import.meta.url);
const createContent = fs.readFileSync(createPath, 'utf8');
if (!createContent.includes('createReport')) {
  console.log('CreateReport still needs API wiring - run full patch');
}
console.log('login patched');
