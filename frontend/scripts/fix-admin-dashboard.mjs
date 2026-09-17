import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/pages/admin/AdminDashboard.jsx');
let s = fs.readFileSync(p, 'utf8');

const broken = `                    <motionFallback />
                  <motionFallback />
                <motionFallback />
                );`;

const fixed = `                    <div className="h-1.5 bg-secondary-bg rounded-full overflow-hidden">
                      <motionFallback />
                    </motionFallback>
                  </motionFallback>
                </motionFallback>
                );`;

// Use unique broken pattern from file
s = s.replace(
  /                    <[^>]*>\s*<\/div>\s*<\/motionFallback>\s*\);\s*\}\)\}/,
  `                    <div className="h-1.5 bg-secondary-bg rounded-full overflow-hidden">
                      <div className={\`h-full rounded-full \${cat.bar}\`} style={{ width: \`\${Math.min(100, count * 10)}%\`, opacity: 0.75 }} />
                    </div>
                  </motionFallback>
                </motionFallback>
                );
              })}`,
);

// manual fix for current broken state
if (s.includes('<div />\n                    </div>\n                  </motionFallback>')) {
  s = s.replace(
    `                    <motionFallback />
                  <motionFallback />
                );`,
    `                    <div className="h-1.5 bg-secondary-bg rounded-full overflow-hidden">
                      <div className={\`h-full rounded-full \${cat.bar}\`} style={{ width: \`\${Math.min(100, count * 10)}%\`, opacity: 0.75 }} />
                    </div>
                  </div>
                </div>
                );`,
  );
}

s = s.replace(
  `                    <motionFallback />
                  <motionFallback />
                );`,
  `                    <div className="h-1.5 bg-secondary-bg rounded-full overflow-hidden">
                      <div className={\`h-full rounded-full \${cat.bar}\`} style={{ width: \`\${Math.min(100, count * 10)}%\`, opacity: 0.75 }} />
                    </div>
                  </div>
                </motionFallback>
                );`,
);

fs.writeFileSync(p, s);
console.log('admin dashboard category block patched');
