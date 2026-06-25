// أمر /unban — فك حظر عضو
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { ephemeral } from '../helpers.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('فك حظر عضو عن طريق الايدي')
  .addStringOption((o) =>
    o.setName('user_id').setDescription('ايدي العضو المحظور').setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const userId = interaction.options.getString('user_id').trim();

  if (!/^\d{17,20}$/.test(userId))
    return interaction.reply(ephemeral('❌ الايدي غير صحيح.'));

  const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
  if (!ban)
    return interaction.reply(ephemeral('❌ هذا العضو مو محظور أصلاً.'));

  await interaction.guild.members.unban(userId);
  return interaction.reply(`✅ تم فك الحظر عن **${ban.user.tag}**`);
}
