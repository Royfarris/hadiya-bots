// أمر /leaderboard — أعلى الأعضاء بالنقاط
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLeaderboard, levelFromXp } from '../levelStore.js';

const MEDALS = ['🥇', '🥈', '🥉'];

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('أعلى الأعضاء في المستويات')
  .setDMPermission(false);

export async function execute(interaction) {
  const lb = getLeaderboard(interaction.guild.id, 10);

  if (lb.length === 0)
    return interaction.reply('📭 ما فيه نقاط مسجّلة بعد.');

  const lines = lb.map(([id, xp], i) => {
    const { level } = levelFromXp(xp);
    const rank = MEDALS[i] ?? `**${i + 1}.**`;
    return `${rank} <@${id}> — مستوى **${level}** (${xp} XP)`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setTitle(`🏆 ترتيب ${interaction.guild.name}`)
    .setDescription(lines.join('\n'));

  return interaction.reply({ embeds: [embed] });
}
