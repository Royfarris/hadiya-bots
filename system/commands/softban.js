// أمر /softban — حظر مؤقت لحذف رسائل العضو ثم فك الحظر
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ephemeral, validateTarget } from '../helpers.js';
import { dmUser } from '../notify.js';

export const data = new SlashCommandBuilder()
  .setName('softban')
  .setDescription('حظر وفك حظر فوري (لحذف رسائل العضو)')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو').setRequired(true),
  )
  .addStringOption((o) =>
    o.setName('reason').setDescription('السبب').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') ?? 'بدون سبب';
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  const err = validateTarget(interaction, member);
  if (err) return interaction.reply(ephemeral(`❌ ${err}`));
  if (!member.bannable)
    return interaction.reply(ephemeral('❌ ما أقدر أحظر هذا العضو.'));

  await dmUser(user, {
    title: '🧹 تم تنظيف رسائلك (softban)',
    fields: [
      { name: 'السيرفر', value: interaction.guild.name, inline: true },
      { name: 'السبب', value: reason },
    ],
    guildName: interaction.guild.name,
    guildIconURL: interaction.guild.iconURL() ?? undefined,
  });

  await interaction.guild.members.ban(user.id, {
    reason,
    deleteMessageSeconds: 7 * 24 * 60 * 60,
  });
  await interaction.guild.members.unban(user.id, 'softban');

  return interaction.reply(`🧹 تم softban لـ **${user.tag}** (حذف رسائله).`);
}
