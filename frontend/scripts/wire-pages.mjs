import fs from 'fs';
import path from 'path';

const root = new URL('../src/', import.meta.url);

function write(rel, content) {
  const p = path.join(root.pathname.replace(/^\/([A-Z]:)/, '$1'), rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log('wrote', rel);
}

// Fix CitizenDashboard activity block
const dashPath = path.join(root.pathname.replace(/^\/([A-Z]:)/, '$1'), 'pages/citizen/CitizenDashboard.jsx');
let dash = fs.readFileSync(dashPath, 'utf8');
dash = dash.replace(
  /recentReports\.map\(\(act, i\) => \(\s*<div[\s\S]*?<\/div>\s*\)\)/,
  `recentReports.map((act, i) => (
                  <motionFallback />
                ))`.replace(/motionFallback/g, 'ACTIVITY_ITEM'),
);
// fix ACTIVITY_ITEM placeholder
dash = dash.replace(
  `recentReports.map((act, i) => (
                  <ACTIVITY_ITEM />
                ))`,
  `recentReports.map((act, i) => (
                  <div
                    key={act.id}
                    className={\`px-5 py-3 flex items-center gap-3 \${i < recentReports.length - 1 ? 'border-b border-border-light' : ''}\`}
                  >
                    <motionFallback />
                  </motionFallback>
                ))`,
);
// This script approach is getting messy - use direct string
fs.writeFileSync(dashPath, fs.readFileSync(dashPath, 'utf8').replace(/<motionFallback \/>/g, '').replace(/<\/motionFallback>/g, '</motionFallback>'));
