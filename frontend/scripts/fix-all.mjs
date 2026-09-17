import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src');

const loginPath = path.join(root, 'pages/public/LoginPage.jsx');
let login = fs.readFileSync(loginPath, 'utf8');
login = login.replace(
  /\n          <div className="relative my-6">[\s\S]*?Entrar como Administrador \(Demo\)\n          <\/Button>\n/,
  '\n',
);
fs.writeFileSync(loginPath, login);

const adminPath = path.join(root, 'pages/admin/AdminDashboard.jsx');
let admin = fs.readFileSync(adminPath, 'utf8');
const emptyBar =
  '<div className="h-1.5 bg-secondary-bg rounded-full overflow-hidden">\n                      <motionFallback />';
const fullBar = `<motionFallback />`;
admin = admin.replace(
  '<div className="h-1.5 bg-secondary-bg rounded-full overflow-hidden">\n                      <div />',
  `<div className="h-1.5 bg-secondary-bg rounded-full overflow-hidden">
                      <div className={\`h-full rounded-full \${cat.bar}\`} style={{ width: \`\${Math.min(100, count * 10)}%\`, opacity: 0.75 }} />`,
);
fs.writeFileSync(adminPath, admin);

console.log('fix-all done');
