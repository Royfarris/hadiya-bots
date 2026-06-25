// أدوات مساعدة: تحويل المدة + اختيار الفائزين

// يحوّل نص المدة مثل "1d" "2h" "30m" "45s" "1w" إلى ميلي ثانية
// يدعم الجمع: "1d12h" أو "1h 30m"
export function parseDuration(input) {
  if (!input) return null;
  const regex = /(\d+)\s*(w|d|h|m|s)/gi;
  const units = {
    w: 7 * 24 * 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  };
  let total = 0;
  let matched = false;
  let match;
  while ((match = regex.exec(input.toLowerCase())) !== null) {
    matched = true;
    total += parseInt(match[1], 10) * units[match[2]];
  }
  if (!matched) return null;
  return total > 0 ? total : null;
}

// يختار فائزين عشوائيين بدون تكرار
export function pickWinners(participants, count) {
  const pool = [...new Set(participants)];
  const winners = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(idx, 1)[0]);
  }
  return winners;
}

// يحوّل الميلي ثانية إلى نص عربي مقروء
export function formatDuration(ms) {
  if (ms <= 0) return 'انتهى';
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const parts = [];
  if (d) parts.push(`${d} يوم`);
  if (h) parts.push(`${h} ساعة`);
  if (m) parts.push(`${m} دقيقة`);
  if (s && !d && !h) parts.push(`${s} ثانية`);
  return parts.join(' و ') || 'أقل من دقيقة';
}
