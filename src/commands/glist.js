// أمر /glist — يعرض القيف أوايات الشغّالة في السيرفر
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('glist')
  .setDescription('عرض القيف أوايات الشغّالة في السيرفر')
  .setDMPermission(false);

export async function execute(interaction, manager) {
  const active = manager.activeInGuild(interaction.guildId);

  if (active.length === 0) {
    return interaction.reply({
      content: '📭 ما فيه قيف أواي شغّال حالياً في هذا السيرفر.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('<:event:1519661163825336431> القيف أوايات الشغّالة')
    .setColor(0x7c3aed)
    .setDescription(
      active
        .map((g, i) => {
          const ends = Math.floor(g.endAt / 1000);
          return `**${i + 1}.** ${g.prize} — ${g.winnerCount} فائز — ينتهي <t:${ends}:R>\nالقناة: <#${g.channelId}> | الايدي: \`${g.messageId}\``;
        })
        .join('\n\n'),
    );

  return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
