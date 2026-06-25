// أمر /greroll — إعادة سحب فائزين جدد لقيف أواي منتهي
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('greroll')
  .setDescription('إعادة سحب الفائزين لقيف أواي منتهي')
  .addStringOption((opt) =>
    opt
      .setName('message_id')
      .setDescription('ايدي رسالة القيف أواي')
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

export async function execute(interaction, manager) {
  const messageId = interaction.options.getString('message_id');
  const g = manager.get(messageId);

  if (!g || g.guildId !== interaction.guildId) {
    return interaction.reply({
      content: '❌ ما لقيت قيف أواي بهذا الايدي في هذا السيرفر.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const result = await manager.reroll(messageId);
  if (!result.ok) {
    const reasons = {
      not_ended: '⚠️ لازم القيف أواي يخلص أول.',
      no_participants: '😔 ما فيه مشاركين عشان نعيد السحب.',
      not_found: '❌ ما لقيت القيف أواي.',
    };
    return interaction.reply({
      content: reasons[result.reason] || '❌ صار خطأ.',
      flags: MessageFlags.Ephemeral,
    });
  }
  return interaction.reply({
    content: '✅ تمت إعادة السحب.',
    flags: MessageFlags.Ephemeral,
  });
}
