import fs from 'fs';

const loginPath = new URL('../src/pages/public/LoginPage.jsx', import.meta.url);
let login = fs.readFileSync(loginPath, 'utf8');
const demoStart = login.indexOf('<motionFallback className="relative my-6">');
const demoStart2 = login.indexOf('<div className="relative my-6">');
const start = demoStart2 >= 0 ? demoStart2 : demoStart;
if (start >= 0) {
  const demoEnd = login.indexOf('Entrar como Administrador (Demo)');
  const btnEnd = login.indexOf('</Button>', demoEnd) + '</Button>'.length;
  login = login.slice(0, start) + login.slice(btnEnd).replace(/^\s+/, '\n');
  fs.writeFileSync(loginPath, login);
  console.log('LoginPage: demo removed');
} else {
  console.log('LoginPage: demo block not found');
}

const profPath = new URL('../src/pages/extra/ProfilePage.jsx', import.meta.url);
let prof = fs.readFileSync(profPath, 'utf8');
if (!prof.includes('};\n\nexport default ProfilePage')) {
  prof = prof.replace(/\n\);\n\nexport default ProfilePage;/, '\n  );\n};\n\nexport default ProfilePage;');
}
prof = prof.replace('defaultValue="Juan Pérez"', "defaultValue={user?.name || ''} readOnly");
prof = prof.replace('defaultValue="+1 234 567 890"', "defaultValue={user?.phone || '—'} readOnly");
prof = prof.replace('defaultValue="juan.perez@example.com"', "defaultValue={user?.email || ''} readOnly");
prof = prof.replace(/\s*<Input label="Dirección Principal"[^/]*\/>\s*/, '\n');
fs.writeFileSync(profPath, prof);
console.log('ProfilePage: patched');
