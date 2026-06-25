// تخزين بسيط للقيف أوايات في ملف JSON
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// مكان حفظ البيانات — يقدر يتغيّر عبر متغيّر DATA_DIR (مفيد للاستضافة مع Volume)
const DATA_DIR = process.env.DATA_DIR || `${__dirname}/../data`;
const DATA_FILE = `${DATA_DIR}/giveaways.json`;

function ensureFile() {
  const dir = dirname(DATA_FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, '[]', 'utf8');
}

// يرجّع كل القيف أوايات المخزّنة
export function loadGiveaways() {
  ensureFile();
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

// يحفظ القائمة كاملة
export function saveGiveaways(list) {
  ensureFile();
  writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
}
