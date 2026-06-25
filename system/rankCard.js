// مولّد بطاقة المستوى (صورة) — بستايل وألوان اللوقو
import { createCanvas, loadImage } from '@napi-rs/canvas';

// يختصر الأرقام الكبيرة: 30000 -> 30K
function short(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return `${n}`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function buildRankCard({
  avatarURL,
  username,
  level,
  rank,
  xp,
  current,
  needed,
}) {
  const W = 934;
  const H = 282;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // الخلفية (تدرّج بنفسجي غامق)
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1e1b2e');
  bg.addColorStop(1, '#2a2440');
  roundRect(ctx, 0, 0, W, H, 34);
  ctx.fillStyle = bg;
  ctx.fill();

  // إطار بنفسجي خفيف
  roundRect(ctx, 4, 4, W - 8, H - 8, 30);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(124,58,237,0.45)';
  ctx.stroke();

  // الأفتار
  const size = 175;
  const ax = 55;
  const ay = (H - size) / 2;
  try {
    const res = await fetch(avatarURL);
    const buf = Buffer.from(await res.arrayBuffer());
    const avatar = await loadImage(buf);
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax + size / 2, ay + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, ax, ay, size, size);
    ctx.restore();
  } catch {
    // لو فشل تحميل الصورة نرسم دائرة فاضية
    ctx.beginPath();
    ctx.arc(ax + size / 2, ay + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#3a3550';
    ctx.fill();
  }
  // حلقة الأفتار
  ctx.beginPath();
  ctx.arc(ax + size / 2, ay + size / 2, size / 2 + 3, 0, Math.PI * 2);
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#7c3aed';
  ctx.stroke();

  const textX = 270;

  // LEVEL و RANK (أعلى اليمين)
  ctx.textAlign = 'right';
  ctx.font = 'bold 30px Arial';
  ctx.fillStyle = '#a855f7';
  ctx.fillText('LEVEL', W - 200, 70);
  ctx.fillText('RANK', W - 55, 70);
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${level}`, W - 200, 110);
  ctx.fillText(`#${short(rank ?? 0)}`, W - 55, 110);

  // اسم العضو
  ctx.textAlign = 'left';
  ctx.font = 'bold 42px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(username.slice(0, 18), textX, 175);

  // XP (يمين فوق الشريط)
  ctx.textAlign = 'right';
  ctx.font = '26px Arial';
  ctx.fillStyle = '#b8b3c9';
  ctx.fillText(`${short(current)} / ${short(needed)} XP`, W - 50, 170);

  // شريط التقدّم — الخلفية
  const barX = textX;
  const barY = 200;
  const barW = W - textX - 50;
  const barH = 34;
  const r = barH / 2;
  roundRect(ctx, barX, barY, barW, barH, r);
  ctx.fillStyle = '#3a3550';
  ctx.fill();

  // شريط التقدّم — التعبئة
  const ratio = needed > 0 ? Math.min(1, current / needed) : 0;
  const fillW = Math.max(barH, barW * ratio);
  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, '#7c3aed');
  grad.addColorStop(1, '#c084fc');
  roundRect(ctx, barX, barY, fillW, barH, r);
  ctx.fillStyle = grad;
  ctx.fill();

  return canvas.encode('png');
}
