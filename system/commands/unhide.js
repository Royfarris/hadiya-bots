// أمر /unhide — إظهار الروم الحالي
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unhide')
  .setDescription('إظهار الروم الحالي للأعضاء')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDMPermission(false);

export async function execute(interaction) {
  await interaction.channel.permissionOverwrites.edit(
    interaction.guild.roles.everyone,
    { ViewChannel: null },
  );
  return interaction.reply('👁️ تم **إظهار** الروم.');
}
