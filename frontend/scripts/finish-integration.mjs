import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const loginPath = path.join(dir, '../src/pages/public/LoginPage.jsx');
let login = fs.readFileSync(loginPath, 'utf8');
const marker = login.indexOf('relative my-6');
if (marker !== -1) {
  const blockStart = login.lastIndexOf('\n', marker - 5);
  const blockEnd = login.indexOf('¿No tienes cuenta?', marker);
  if (blockEnd !== -1) {
    login = login.slice(0, blockStart) + '\n\n          ' + login.slice(blockEnd);
    fs.writeFileSync(loginPath, login);
    console.log('login cleaned');
  }
}

const myPath = path.join(dir, '../src/pages/citizen/MyReports.jsx');
let my = fs.readFileSync(myPath, 'utf8');
my = my.replace(
  "variant={statusBadgeVariant[report.status] || 'default'}",
  'variant={getStatusBadgeVariant(report.statusRaw)}',
);
fs.writeFileSync(myPath, my);
console.log('myReports ok');
