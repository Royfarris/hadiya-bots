// أمر /ghelp — يعرض أوامر البوت
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ghelp')
  .setDescription('عرض أوامر بوت القيف أواي');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('<:event:1519661163825336431> أوامر بوت القيف أواي')
    .setColor(0x7c3aed)
    .setDescription(
      [
        '`/gcreate` — يفتح منيو تكتب فيه الجائزة وعدد الفائزين والمدة',
        '`/glist` — يعرض القيف أوايات الشغّالة',
        '`/gend <message_id>` — ينهي قيف أواي قبل وقته',
        '`/greroll <message_id>` — يعيد سحب الفائزين',
        '`/ghelp` — تعرض هذي القائمة',
        '',
        'ملاحظة: أوامر الإدارة تحتاج صلاحية **Manage Server**.',
        'للمشاركة في أي قيف أواي اضغط زر <:enter:1519648386175996016> تحت الرسالة.',
      ].join('\n'),
    );

  return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
