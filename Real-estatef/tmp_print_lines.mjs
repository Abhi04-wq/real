import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const p = path.join(__dirname, 'src/pages/Dashboard.jsx');
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
const start = 2965;
const end = 3005;
for (let i = start; i < Math.min(end, lines.length); i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
