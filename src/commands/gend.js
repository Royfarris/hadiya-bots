// أمر /gend — ينهي قيف أواي قبل وقته
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('gend')
  .setDescription('إنهاء قيف أواي قبل وقته')
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
  if (g.ended) {
    return interaction.reply({
      content: '⚠️ هذا القيف أواي منتهي أصلاً.',
      flags: MessageFlags.Ephemeral,
    });
  }

  await manager.end(messageId, true);
  return interaction.reply({
    content: '✅ تم إنهاء القيف أواي.',
    flags: MessageFlags.Ephemeral,
  });
}
