// أمر /timeout — كتم عضو لمدة معينة
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { ephemeral, validateTarget } from '../helpers.js';
import { parseDuration, formatDuration } from '../../src/utils.js';
import { dmUser } from '../notify.js';

const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000; // 28 يوم (الحد الأقصى في ديسكورد)

export const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('كتم عضو لمدة معينة')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو المراد كتمه').setRequired(true),
  )
  .addStringOption((o) =>
    o
      .setName('duration')
      .setDescription('المدة مثل: 10m او 1h او 1d')
      .setRequired(true),
  )
  .addStringOption((o) =>
    o.setName('reason').setDescription('سبب الكتم').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const durationRaw = interaction.options.getString('duration');
  const reason = interaction.options.getString('reason') ?? 'بدون سبب';
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  const err = validateTarget(interaction, member);
  if (err) return interaction.reply(ephemeral(`❌ ${err}`));
  if (!member.moderatable)
    return interaction.reply(
      ephemeral('❌ ما أقدر أكتم هذا العضو (صلاحياتي أقل أو رتبته أعلى مني).'),
    );

  const ms = parseDuration(durationRaw);
  if (!ms)
    return interaction.reply(
      ephemeral('❌ صيغة المدة غلط. استخدم مثل: `10m` أو `1h` أو `1d`.'),
    );
  if (ms > MAX_TIMEOUT)
    return interaction.reply(ephemeral('❌ أقصى مدة كتم هي 28 يوم.'));

  await member.timeout(ms, reason);
  await dmUser(user, {
    title: '🔇 تم كتمك',
    fields: [
      { name: 'السيرفر', value: interaction.guild.name, inline: true },
      { name: 'المدة', value: formatDuration(ms), inline: true },
      { name: 'السبب', value: reason },
    ],
    guildName: interaction.guild.name,
    guildIconURL: interaction.guild.iconURL() ?? undefined,
  });
  return interaction.reply(
    `✅ تم كتم **${user.tag}** لمدة ${formatDuration(ms)}\nالسبب: ${reason}`,
  );
}
