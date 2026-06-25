// أمر /unwarn — حذف تحذير محدد برقمه
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ephemeral } from '../helpers.js';
import { removeWarn, getWarns } from '../warnStore.js';

export const data = new SlashCommandBuilder()
  .setName('unwarn')
  .setDescription('حذف تحذير محدد من عضو')
  .addUserOption((o) =>
    o.setName('user').setDescription('العضو').setRequired(true),
  )
  .addIntegerOption((o) =>
    o
      .setName('number')
      .setDescription('رقم التحذير (شوفه من /warnings)')
      .setMinValue(1)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const number = interaction.options.getInteger('number');
  const total = getWarns(interaction.guild.id, user.id).length;

  if (total === 0)
    return interaction.reply(ephemeral(`❌ **${user.tag}** ما عنده تحذيرات.`));

  const ok = removeWarn(interaction.guild.id, user.id, number);
  if (!ok)
    return interaction.reply(
      ephemeral(`❌ رقم غلط. عنده ${total} تحذير فقط (1 إلى ${total}).`),
    );

  return interaction.reply(
    `✅ تم حذف التحذير رقم **${number}** من ${user.tag}`,
  );
}
