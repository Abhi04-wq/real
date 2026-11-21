import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const p = path.join(__dirname, 'src/pages/Dashboard.jsx');
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
const start = 3000;
const end = 3700;
let stack = [];
const pairs = { ')': '(', ']': '[', '}': '{' };
for (let i = start; i < Math.min(end, lines.length); i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if ('([{'.includes(ch)) stack.push({ ch, i: i + 1, j: j + 1, line });
    else if (')]}'.includes(ch)) {
      if (!stack.length) {
        console.log(`Unmatched closing ${ch} at ${i+1}:${j+1}`);
        process.exit(1);
      }
      const top = stack[stack.length - 1];
      if (top.ch !== pairs[ch]) {
        console.log(`Mismatched ${top.ch} opened at ${top.i}:${top.j}, closed by ${ch} at ${i+1}:${j+1}`);
        process.exit(1);
      }
      stack.pop();
    }
  }
}
if (stack.length) {
  const top = stack[stack.length - 1];
  console.log(`Unclosed ${top.ch} opened at ${top.i}:${top.j}`);
  process.exit(1);
}
console.log('All braces matched in range.');
