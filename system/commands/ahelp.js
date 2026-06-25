// أمر /ahelp — قائمة أوامر بوت الإدارة
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ahelp')
  .setDescription('عرض أوامر بوت الإدارة System');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🛡️ System — أوامر الإدارة')
    .setColor(0x7c3aed)
    .setDescription(
      [
        '**👮 الأعضاء**',
        '`/kick` `/ban` `/unban` `/softban`',
        '`/timeout` `/untimeout`',
        '`/warn` `/unwarn` `/warnings` — التحذيرات',
        '',
        '**🔊 الصوت**',
        '`/disconnect` `/vmute` `/vunmute`',
        '',
        '**💬 الرومات**',
        '`/lock` `/unlock` `/hide` `/unhide`',
        '`/slowmode` `/clear`',
        '',
        '**⚙️ ثاني**',
        '`/role` `/nick` `/say`',
        '`/avatar` `/userinfo` `/serverinfo`',
        '',
        'كل الأوامر متوفّرة بالبرفكس `#` كمان. اكتب `#ahelp`.',
        'العضو المعاقَب يوصله إشعار بالخاص 🛡️',
      ].join('\n'),
    )
    .setFooter({ text: 'System • Admin Bot' });

  return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
