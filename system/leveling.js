// نظام المستويات: يعطي XP على الرسائل ويعلن عند ترقية المستوى
import { addXp } from './levelStore.js';
import { PREFIX } from './prefix.js';

const COOLDOWN = 60 * 1000; // دقيقة بين كل XP لنفس العضو
const cooldowns = new Map();

export async function handleLevelMessage(message) {
  if (message.author.bot || !message.guild) return;
  // نتجاهل أوامر البرفكس عشان ما تعطي XP
  if (message.content.startsWith(PREFIX)) return;

  const key = `${message.guild.id}-${message.author.id}`;
  const now = Date.now();
  if (cooldowns.has(key) && now - cooldowns.get(key) < COOLDOWN) return;
  cooldowns.set(key, now);

  // XP عشوائي بين 15 و 25 (نوّع بالوقت عشان ما يكون ثابت)
  const gain = 15 + (now % 11);
  const res = addXp(message.guild.id, message.author.id, gain);

  if (res.leveledUp) {
    message.channel
      .send(`🎉 مبروك ${message.author}! وصلت المستوى **${res.level}** 🆙`)
      .catch(() => {});
  }
}
