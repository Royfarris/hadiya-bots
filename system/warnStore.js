// تخزين تحذيرات الأعضاء في ملف JSON
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || `${__dirname}/../data`;
const FILE = `${DATA_DIR}/warns.json`;

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(FILE)) writeFileSync(FILE, '{}', 'utf8');
}

function load() {
  ensure();
  try {
    return JSON.parse(readFileSync(FILE, 'utf8'));
  } catch {
    return {};
  }
}

function save(data) {
  ensure();
  writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
}

// يضيف تحذير ويرجّع العدد الإجمالي
export function addWarn(guildId, userId, entry) {
  const data = load();
  data[guildId] ??= {};
  data[guildId][userId] ??= [];
  data[guildId][userId].push(entry);
  save(data);
  return data[guildId][userId].length;
}

// يرجّع تحذيرات عضو
export function getWarns(guildId, userId) {
  const data = load();
  return data[guildId]?.[userId] ?? [];
}

// يمسح تحذير محدد برقمه (1 = الأول)، يرجّع true لو انحذف
export function removeWarn(guildId, userId, index) {
  const data = load();
  const arr = data[guildId]?.[userId];
  if (!arr || index < 1 || index > arr.length) return false;
  arr.splice(index - 1, 1);
  if (arr.length === 0) delete data[guildId][userId];
  save(data);
  return true;
}

// يمسح كل تحذيرات عضو
export function clearWarns(guildId, userId) {
  const data = load();
  if (data[guildId]?.[userId]) {
    delete data[guildId][userId];
    save(data);
    return true;
  }
  return false;
}
