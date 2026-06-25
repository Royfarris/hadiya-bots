// أدوات مساعدة لبوت الإدارة System
import { MessageFlags } from 'discord.js';

// رد مخفي (يشوفه المستخدم بس) — لأوامر السلاش
export function ephemeral(content) {
  return { content, flags: MessageFlags.Ephemeral };
}

// يتحقق إن العضو الهدف ينفع نطبّق عليه إجراء إداري
// executor و target كلاهما GuildMember
// يرجّع رسالة خطأ نصية، أو null لو كل شي تمام
export function validateMember(executor, target, { allowOwner = false } = {}) {
  if (!target) return 'العضو مو موجود في السيرفر.';
  // صاحب السيرفر محمي إلا لو سمحنا (مثل التحذير)
  if (!allowOwner && target.id === target.guild.ownerId)
    return 'ما تقدر تسوي هذا على صاحب السيرفر.';
  return null;
}

// نسخة لأوامر السلاش (تستقبل interaction)
export function validateTarget(interaction, member, options) {
  return validateMember(interaction.member, member, options);
}
