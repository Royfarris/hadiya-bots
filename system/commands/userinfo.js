// أمر /userinfo — معلومات عضو
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { getWarns } from '../warnStore.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('عرض معلومات عضو')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو (افتراضي: انت)').setRequired(false),
  )
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user') ?? interaction.user;
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  const warns = getWarns(interaction.guild.id, user.id).length;

  const embed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setTitle(`معلومات ${user.tag}`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      { name: 'الايدي', value: user.id, inline: false },
      {
        name: 'تاريخ الإنشاء',
        value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
        inline: true,
      },
      {
        name: 'تاريخ الدخول',
        value: member
          ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
          : 'مو في السيرفر',
        inline: true,
      },
      { name: 'التحذيرات', value: `${warns}`, inline: true },
    );

  if (member) {
    const roles = member.roles.cache
      .filter((r) => r.id !== interaction.guild.id)
      .map((r) => `<@&${r.id}>`)
      .slice(0, 15)
      .join(' ');
    embed.addFields({ name: 'الرتب', value: roles || 'لا يوجد' });
  }

  return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
