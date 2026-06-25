// أمر /serverinfo — معلومات السيرفر
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('عرض معلومات السيرفر')
  .setDMPermission(false);

export async function execute(interaction) {
  const g = interaction.guild;
  const owner = await g.fetchOwner().catch(() => null);

  const embed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setTitle(g.name)
    .setThumbnail(g.iconURL() ?? null)
    .addFields(
      { name: 'المالك', value: owner ? owner.user.tag : 'غير معروف', inline: true },
      { name: 'الأعضاء', value: `${g.memberCount}`, inline: true },
      { name: 'الرتب', value: `${g.roles.cache.size}`, inline: true },
      { name: 'الرومات', value: `${g.channels.cache.size}`, inline: true },
      { name: 'البوستات', value: `${g.premiumSubscriptionCount ?? 0}`, inline: true },
      {
        name: 'تاريخ الإنشاء',
        value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`,
        inline: true,
      },
    )
    .setFooter({ text: `الايدي: ${g.id}` });

  return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
