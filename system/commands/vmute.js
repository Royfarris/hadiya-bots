// أمر /vmute — كتم صوتي لعضو في الروم الصوتي
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ephemeral } from '../helpers.js';

export const data = new SlashCommandBuilder()
  .setName('vmute')
  .setDescription('كتم صوت عضو في الروم الصوتي')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو').setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!member?.voice?.channel)
    return interaction.reply(ephemeral('❌ العضو مو في روم صوتي.'));

  await member.voice.setMute(true, 'vmute');
  return interaction.reply(`🔇 تم كتم صوت **${user.tag}**.`);
}
