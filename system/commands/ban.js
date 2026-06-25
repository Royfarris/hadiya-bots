// أمر /ban — حظر عضو
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { ephemeral, validateTarget } from '../helpers.js';
import { dmUser } from '../notify.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('حظر عضو من السيرفر')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو المراد حظره').setRequired(true),
  )
  .addStringOption((o) =>
    o.setName('reason').setDescription('سبب الحظر').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') ?? 'بدون سبب';
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  // لو العضو موجود في السيرفر نتحقق من الرتب والصلاحيات
  if (member) {
    const err = validateTarget(interaction, member);
    if (err) return interaction.reply(ephemeral(`❌ ${err}`));
    if (!member.bannable)
      return interaction.reply(
        ephemeral('❌ ما أقدر أحظر هذا العضو (صلاحياتي أقل أو رتبته أعلى مني).'),
      );
  }

  await dmUser(user, {
    title: '🔨 تم حظرك',
    fields: [
      { name: 'السيرفر', value: interaction.guild.name, inline: true },
      { name: 'بواسطة', value: interaction.user.tag, inline: true },
      { name: 'السبب', value: reason },
    ],
    guildName: interaction.guild.name,
    guildIconURL: interaction.guild.iconURL() ?? undefined,
  });
  await interaction.guild.members.ban(user.id, { reason });
  return interaction.reply(`✅ تم حظر **${user.tag}**\nالسبب: ${reason}`);
}
