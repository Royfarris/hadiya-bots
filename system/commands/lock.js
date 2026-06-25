// أمر /lock — قفل الروم الحالي (منع الكتابة)
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('قفل الروم الحالي (منع الأعضاء من الكتابة)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDMPermission(false);

export async function execute(interaction) {
  await interaction.channel.permissionOverwrites.edit(
    interaction.guild.roles.everyone,
    { SendMessages: false },
  );
  return interaction.reply('🔒 تم **قفل** الروم. ما أحد يقدر يكتب الحين.');
}
