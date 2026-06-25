// أمر /warnings — عرض تحذيرات عضو
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { getWarns } from '../warnStore.js';

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription('عرض تحذيرات عضو')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو').setRequired(true),
  )
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const warns = getWarns(interaction.guild.id, user.id);

  if (warns.length === 0)
    return interaction.reply({
      content: `✅ **${user.tag}** ما عنده تحذيرات.`,
      flags: MessageFlags.Ephemeral,
    });

  const embed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setTitle(`⚠️ تحذيرات ${user.tag} (${warns.length})`)
    .setDescription(
      warns
        .map(
          (w, i) =>
            `**${i + 1}.** ${w.reason}\n— بواسطة <@${w.by}> <t:${Math.floor(w.time / 1000)}:R>`,
        )
        .join('\n\n'),
    );

  return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
