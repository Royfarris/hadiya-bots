// أمر /untimeout — فك كتم عضو
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { ephemeral } from '../helpers.js';

export const data = new SlashCommandBuilder()
  .setName('untimeout')
  .setDescription('فك الكتم عن عضو')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو المراد فك كتمه').setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member)
    return interaction.reply(ephemeral('❌ العضو مو موجود في السيرفر.'));
  if (!member.isCommunicationDisabled())
    return interaction.reply(ephemeral('❌ هذا العضو مو مكتوم أصلاً.'));

  await member.timeout(null);
  return interaction.reply(`✅ تم فك الكتم عن **${user.tag}**`);
}
