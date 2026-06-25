// إرسال إشعار خاص للعضو مع صورة guard.png
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GUARD_PATH = `${__dirname}/commands/gurad.png`;

// لون اللوقو الموحّد لكل الإمبيدات
export const LOGO_COLOR = 0x7c3aed;

// يرسل رسالة خاص للعضو بإمبيد أنيق + صورة الدرع
// يرجّع true لو وصلت، false لو خاصه مقفّل
export async function dmUser(
  user,
  { title, color = LOGO_COLOR, fields = [], guildName, guildIconURL },
) {
  try {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setTimestamp();

    if (fields.length) embed.addFields(fields);
    if (guildName)
      embed.setFooter({ text: guildName, iconURL: guildIconURL ?? undefined });

    const files = [];
    if (existsSync(GUARD_PATH)) {
      files.push(new AttachmentBuilder(GUARD_PATH, { name: 'guard.png' }));
      embed.setThumbnail('attachment://guard.png');
    }

    await user.send({ embeds: [embed], files });
    return true;
  } catch {
    return false; // خاص العضو مقفّل
  }
}
