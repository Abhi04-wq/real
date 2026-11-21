import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const p = path.join(__dirname, 'src/pages/Dashboard.jsx');
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
const start = 3008;
const end = 3710;
let stack = [];
const pairs = { ')': '(', ']': '[', '}': '{' };
for (let i = start; i < Math.min(end, lines.length); i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if ('([{'.includes(ch)) stack.push({ ch, i: i+1, j: j+1, snippet: line.trim() });
    else if (')]}'.includes(ch)) {
      if (!stack.length) {
        console.log(`Unmatched closing ${ch} at ${i+1}:${j+1}`);
        process.exit(1);
      }
      const top = stack[stack.length - 1];
      if (top.ch !== pairs[ch]) {
        console.log(`Mismatched ${top.ch} opened at ${top.i}:${top.j}, closed by ${ch} at ${i+1}:${j+1}`);
        console.log('Stack top 5:');
        console.log(stack.slice(-5).map(x => `${x.ch} @ ${x.i}:${x.j} ${x.snippet}`).join('\n'));
        process.exit(1);
      }
      stack.pop();
    }
  }
  if (i >= 2995) {
    console.log(`LINE ${i+1}: ${line}`);
    console.log('STACK top 5:');
    console.log(stack.slice(-5).map(x => `${x.ch} @ ${x.i}:${x.j} ${x.snippet}`).join('\n') || 'empty');
    console.log('---');
  }
}
if (stack.length) {
  console.log('Final stack non-empty:');
  console.log(stack.map(x => `${x.ch} @ ${x.i}:${x.j} ${x.snippet}`).join('\n'));
  process.exit(1);
}
console.log('All matched in range.');
