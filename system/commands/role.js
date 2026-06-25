// أمر /role — إعطاء أو سحب رتبة لعضو (تبديل)
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ephemeral } from '../helpers.js';

export const data = new SlashCommandBuilder()
  .setName('role')
  .setDescription('إعطاء أو سحب رتبة لعضو')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو').setRequired(true),
  )
  .addRoleOption((o) =>
    o.setName('role').setDescription('الرتبة').setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const role = interaction.options.getRole('role');
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!member) return interaction.reply(ephemeral('❌ العضو مو موجود.'));

  const me = interaction.guild.members.me;
  if (role.managed)
    return interaction.reply(ephemeral('❌ هذي رتبة مرتبطة ببوت/تكامل، ما تنعطى.'));
  if (role.position >= me.roles.highest.position)
    return interaction.reply(
      ephemeral('❌ هذي الرتبة أعلى من رتبتي، ارفع رتبة البوت فوقها.'),
    );

  if (member.roles.cache.has(role.id)) {
    await member.roles.remove(role);
    return interaction.reply(`➖ تم سحب رتبة **${role.name}** من ${user.tag}`);
  }
  await member.roles.add(role);
  return interaction.reply(`➕ تم إعطاء رتبة **${role.name}** لـ ${user.tag}`);
}
