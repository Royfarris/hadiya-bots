// أمر /help — يعرض كل أوامر البوت
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('عرض كل أوامر بوت Hadiya');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🎁 Hadiya — قائمة الأوامر')
    .setColor(0x7c3aed)
    .setDescription(
      [
        '<:event:1519661163825336431> **القيف أواي**',
        '`/gcreate` — يفتح منيو تكتب فيه الجائزة وعدد الفائزين والمدة',
        '`/glist` — يعرض القيف أوايات الشغّالة',
        '`/gend <message_id>` — ينهي قيف أواي قبل وقته',
        '`/greroll <message_id>` — يعيد سحب الفائزين',
        '',
        '**ℹ️ عام**',
        '`/help` — تعرض هذي القائمة',
        '`/ghelp` — نفس الأمر (اختصار)',
        '',
        'ملاحظة: أوامر الإدارة تحتاج صلاحية **Manage Server**.',
        'للمشاركة في أي قيف أواي اضغط زر <:enter:1519648386175996016> تحت الرسالة.',
      ].join('\n'),
    )
    .setFooter({ text: 'Hadiya 🎁 | Giveaway Bot' });

  return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
