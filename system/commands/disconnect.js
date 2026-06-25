// أمر /disconnect — طرد عضو من الرومات الصوتية
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ephemeral } from '../helpers.js';

export const data = new SlashCommandBuilder()
  .setName('disconnect')
  .setDescription('إخراج عضو من الروم الصوتي')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو').setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!member?.voice?.channel)
    return interaction.reply(ephemeral('❌ العضو مو في روم صوتي.'));

  await member.voice.disconnect();
  return interaction.reply(`🔌 تم إخراج **${user.tag}** من الصوت.`);
}
