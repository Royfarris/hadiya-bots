// أمر /gcreate — يفتح منيو (Modal) لإدخال معلومات القيف أواي
import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} from 'discord.js';

export const MODAL_ID = 'giveaway_create_modal';

export const data = new SlashCommandBuilder()
  .setName('gcreate')
  .setDescription('إنشاء قيف أواي جديد عن طريق منيو')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

export async function execute(interaction) {
  const modal = new ModalBuilder()
    .setCustomId(MODAL_ID)
    .setTitle('إنشاء قيف أواي 🎉');

  const prize = new TextInputBuilder()
    .setCustomId('prize')
    .setLabel('وش الجائزة؟')
    .setPlaceholder('مثال: نايترو ديسكورد')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(200)
    .setRequired(true);

  const winners = new TextInputBuilder()
    .setCustomId('winners')
    .setLabel('كم عدد الفائزين؟')
    .setPlaceholder('مثال: 1')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(3)
    .setRequired(true);

  const duration = new TextInputBuilder()
    .setCustomId('duration')
    .setLabel('كم المدة؟ (مثال: 1d او 2h او 30m)')
    .setPlaceholder('w=اسبوع d=يوم h=ساعة m=دقيقة s=ثانية')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(20)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(prize),
    new ActionRowBuilder().addComponents(winners),
    new ActionRowBuilder().addComponents(duration),
  );

  await interaction.showModal(modal);
}
