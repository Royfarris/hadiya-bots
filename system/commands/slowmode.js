// أمر /slowmode — وضع التبريد للروم
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { formatDuration } from '../../src/utils.js';

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('وضع تبريد للروم (ثواني بين كل رسالة)')
  .addIntegerOption((o) =>
    o
      .setName('seconds')
      .setDescription('عدد الثواني (0 لإلغاء التبريد)')
      .setMinValue(0)
      .setMaxValue(21600)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDMPermission(false);

export async function execute(interaction) {
  const seconds = interaction.options.getInteger('seconds');
  await interaction.channel.setRateLimitPerUser(seconds);
  return interaction.reply(
    seconds === 0
      ? '⏱️ تم **إلغاء** التبريد.'
      : `⏱️ تم ضبط التبريد على **${formatDuration(seconds * 1000)}**.`,
  );
}
