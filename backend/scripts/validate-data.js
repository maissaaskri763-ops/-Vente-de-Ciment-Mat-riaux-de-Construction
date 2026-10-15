import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

const requiredFiles = [
  'summary.json',
  'customers.json',
  'products.json',
  'governorates.json',
  'monthly.json',
  'transactions_sample.json'
];

for (const filename of requiredFiles) {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Missing data file: ${filename}`);
  }

  JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

console.log(`Validated ${requiredFiles.length} local data files.`);
