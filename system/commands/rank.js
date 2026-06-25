// أمر /rank — بطاقة مستوى العضو (صورة)
import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { getXp, levelFromXp, getRank } from '../levelStore.js';
import { buildRankCard } from '../rankCard.js';

export const data = new SlashCommandBuilder()
  .setName('rank')
  .setDescription('عرض بطاقة مستواك أو مستوى عضو')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو (افتراضي: انت)').setRequired(false),
  )
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user') ?? interaction.user;
  const xp = getXp(interaction.guild.id, user.id);
  const { level, current, needed } = levelFromXp(xp);
  const { rank } = getRank(interaction.guild.id, user.id);

  await interaction.deferReply();
  const png = await buildRankCard({
    avatarURL: user.displayAvatarURL({ extension: 'png', size: 256 }),
    username: user.username,
    level,
    rank,
    xp,
    current,
    needed,
  });

  return interaction.editReply({
    files: [new AttachmentBuilder(png, { name: 'rank.png' })],
  });
}
