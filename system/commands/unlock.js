// أمر /unlock — فتح الروم الحالي
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('فتح الروم الحالي (السماح بالكتابة)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDMPermission(false);

export async function execute(interaction) {
  await interaction.channel.permissionOverwrites.edit(
    interaction.guild.roles.everyone,
    { SendMessages: null },
  );
  return interaction.reply('🔓 تم **فتح** الروم. تقدرون تكتبون الحين.');
}
