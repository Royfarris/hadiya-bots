// أمر /clear — مسح عدد من الرسائل
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { ephemeral } from '../helpers.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('مسح عدد من الرسائل في القناة')
  .addIntegerOption((o) =>
    o
      .setName('count')
      .setDescription('عدد الرسائل (1 إلى 100)')
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false);

export async function execute(interaction) {
  const count = interaction.options.getInteger('count');

  // bulkDelete ما يمسح رسائل أقدم من 14 يوم
  const deleted = await interaction.channel
    .bulkDelete(count, true)
    .catch(() => null);

  if (!deleted)
    return interaction.reply(
      ephemeral('❌ تعذّر المسح (الرسائل أقدم من 14 يوم أو صلاحية ناقصة).'),
    );

  return interaction.reply(
    ephemeral(`✅ تم مسح **${deleted.size}** رسالة.`),
  );
}
