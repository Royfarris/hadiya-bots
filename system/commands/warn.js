// أمر /warn — تحذير عضو
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ephemeral, validateTarget } from '../helpers.js';
import { addWarn } from '../warnStore.js';
import { dmUser } from '../notify.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('تحذير عضو')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو').setRequired(true),
  )
  .addStringOption((o) =>
    o.setName('reason').setDescription('سبب التحذير').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') ?? 'بدون سبب';
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  const err = validateTarget(interaction, member, { allowOwner: true });
  if (err) return interaction.reply(ephemeral(`❌ ${err}`));

  const count = addWarn(interaction.guild.id, member.id, {
    by: interaction.user.id,
    reason,
    time: Date.now(),
  });

  const dmOk = await dmUser(user, {
    title: '⚠️ تم تحذيرك',
    fields: [
      { name: 'السيرفر', value: interaction.guild.name, inline: true },
      { name: 'عدد تحذيراتك', value: `${count}`, inline: true },
      { name: 'السبب', value: reason },
    ],
    guildName: interaction.guild.name,
    guildIconURL: interaction.guild.iconURL() ?? undefined,
  });

  return interaction.reply(
    `⚠️ تم تحذير **${user.tag}** (تحذير رقم ${count})\nالسبب: ${reason}` +
      (dmOk ? '' : '\n*(تعذّر إرسال الخاص)*'),
  );
}
