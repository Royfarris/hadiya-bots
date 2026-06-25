// أمر /hide — إخفاء الروم الحالي
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('hide')
  .setDescription('إخفاء الروم الحالي عن الأعضاء')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDMPermission(false);

export async function execute(interaction) {
  await interaction.channel.permissionOverwrites.edit(
    interaction.guild.roles.everyone,
    { ViewChannel: false },
  );
  return interaction.reply('🙈 تم **إخفاء** الروم.');
}
