// أمر /avatar — عرض صورة عضو
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription('عرض صورة عضو')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو (افتراضي: انت)').setRequired(false),
  )
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user') ?? interaction.user;
  const embed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setTitle(`صورة ${user.tag}`)
    .setImage(user.displayAvatarURL({ size: 1024 }));

  return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
