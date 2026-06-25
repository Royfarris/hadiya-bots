// أمر /nick — تغيير لقب عضو
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ephemeral } from '../helpers.js';

export const data = new SlashCommandBuilder()
  .setName('nick')
  .setDescription('تغيير لقب عضو')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو').setRequired(true),
  )
  .addStringOption((o) =>
    o
      .setName('name')
      .setDescription('اللقب الجديد (اتركه فاضي للحذف)')
      .setMaxLength(32)
      .setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const name = interaction.options.getString('name');
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!member) return interaction.reply(ephemeral('❌ العضو مو موجود.'));
  if (!member.manageable)
    return interaction.reply(ephemeral('❌ ما أقدر أغيّر لقب هذا العضو.'));

  await member.setNickname(name ?? null);
  return interaction.reply(
    name
      ? `✏️ تم تغيير لقب ${user.tag} إلى **${name}**`
      : `✏️ تم حذف لقب ${user.tag}`,
  );
}
