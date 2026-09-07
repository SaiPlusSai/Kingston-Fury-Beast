import fs from 'fs';

const p = new URL('../src/pages/public/RegisterPage.jsx', import.meta.url);
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('{error &&')) {
  s = s.replace(
    '          <form onSubmit={handleRegister} className="space-y-4">',
    `          {error && (
            <p className="mb-4 text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-3 py-2">{error}</p>
          )}

          <form onSubmit={handleRegister} className="space-y-4">`,
  );
}

const patches = [
  ['Nombre Completo', 'name'],
  ['Teléfono', 'phone'],
  ['Correo Electrónico', 'email'],
  ['Contraseña', 'password'],
  ['Confirmar Contraseña', 'confirmPassword'],
];

for (const [label, name] of patches) {
  const needle = `label="${label}"`;
  const idx = s.indexOf(needle);
  if (idx === -1) continue;
  const before = s.slice(Math.max(0, idx - 80), idx);
  if (before.includes(`name="${name}"`)) continue;
  const inputStart = s.lastIndexOf('<Input', idx);
  s = `${s.slice(0, inputStart)}<Input name="${name}" value={form.${name}} onChange={handleChange} ${s.slice(inputStart + 6)}`;
}

fs.writeFileSync(p, s);
console.log('RegisterPage patched');
