// تخزين نقاط الخبرة (XP) والمستويات لكل عضو
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || `${__dirname}/../data`;
const FILE = `${DATA_DIR}/levels.json`;

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

// كم XP لازم للانتقال من مستوى للي بعده
export function xpToNext(level) {
  return 5 * level * level + 50 * level + 100;
}

// يحسب المستوى من إجمالي الـ XP
export function levelFromXp(totalXp) {
  let level = 0;
  let remaining = totalXp;
  while (remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level++;
  }
  return { level, current: remaining, needed: xpToNext(level) };
}

// يضيف XP ويرجّع هل طلع مستوى جديد
export function addXp(guildId, userId, amount) {
  const data = load();
  data[guildId] ??= {};
  const before = data[guildId][userId] ?? 0;
  const after = before + amount;
  data[guildId][userId] = after;
  save(data);
  const levelBefore = levelFromXp(before).level;
  const levelAfter = levelFromXp(after).level;
  return { xp: after, leveledUp: levelAfter > levelBefore, level: levelAfter };
}

export function getXp(guildId, userId) {
  return load()[guildId]?.[userId] ?? 0;
}

// ترتيب الأعضاء حسب الـ XP
export function getLeaderboard(guildId, limit = 10) {
  const g = load()[guildId] ?? {};
  return Object.entries(g)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

// ترتيب عضو معيّن (1 = الأول)
export function getRank(guildId, userId) {
  const g = load()[guildId] ?? {};
  const sorted = Object.entries(g).sort((a, b) => b[1] - a[1]);
  const idx = sorted.findIndex(([id]) => id === userId);
  return { rank: idx === -1 ? null : idx + 1, total: sorted.length };
}
