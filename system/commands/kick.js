// أمر /kick — طرد عضو
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { ephemeral, validateTarget } from '../helpers.js';
import { dmUser } from '../notify.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('طرد عضو من السيرفر')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو المراد طرده').setRequired(true),
  )
  .addStringOption((o) =>
    o.setName('reason').setDescription('سبب الطرد').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') ?? 'بدون سبب';
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  const err = validateTarget(interaction, member);
  if (err) return interaction.reply(ephemeral(`❌ ${err}`));
  if (!member.kickable)
    return interaction.reply(
      ephemeral('❌ ما أقدر أطرد هذا العضو (صلاحياتي أقل أو رتبته أعلى مني).'),
    );

  await dmUser(user, {
    title: '👢 تم طردك',
    fields: [
      { name: 'السيرفر', value: interaction.guild.name, inline: true },
      { name: 'بواسطة', value: interaction.user.tag, inline: true },
      { name: 'السبب', value: reason },
    ],
    guildName: interaction.guild.name,
    guildIconURL: interaction.guild.iconURL() ?? undefined,
  });
  await member.kick(reason);
  return interaction.reply(`✅ تم طرد **${user.tag}**\nالسبب: ${reason}`);
}
