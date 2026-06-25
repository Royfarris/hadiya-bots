// أمر /say — البوت يرسل رسالة
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ephemeral } from '../helpers.js';

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('خلّ البوت يرسل رسالة')
  .addStringOption((o) =>
    o.setName('message').setDescription('الرسالة').setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false);

export async function execute(interaction) {
  const msg = interaction.options.getString('message');
  await interaction.channel.send({
    content: msg,
    allowedMentions: { parse: [] }, // نمنع منشن @everyone
  });
  return interaction.reply(ephemeral('✅ تم الإرسال.'));
}
