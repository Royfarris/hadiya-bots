// الملف الرئيسي للبوت
import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Collection,
  Partials,
  Events,
  MessageFlags,
} from 'discord.js';
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { GiveawayManager, JOIN_BUTTON_ID } from './giveawayManager.js';
import { MODAL_ID } from './commands/gcreate.js';
import { parseDuration } from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const token = process.env.DISCORD_TOKEN?.trim();
if (!token) {
  console.error('❌ ما فيه DISCORD_TOKEN في ملف .env');
  process.exit(1);
}
const { createHash } = await import('node:crypto');
console.log(
  `[Hadiya] طول التوكن: ${token.length} | بصمة: ${createHash('sha256').update(token).digest('hex').slice(0, 10)}`,
);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel, Partials.Message],
});

// حماية: نمنع أي خطأ غير متوقع من إطفاء البوت
client.on(Events.Error, (err) =>
  console.error('خطأ في العميل:', err?.message || err),
);
process.on('unhandledRejection', (err) =>
  console.error('خطأ غير معالج:', err?.code || err?.message || err),
);
process.on('uncaughtException', (err) =>
  console.error('استثناء غير معالج:', err?.code || err?.message || err),
);

// تحميل الأوامر
client.commands = new Collection();
const commandsPath = `${__dirname}/commands`;
const files = readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
for (const file of files) {
  const mod = await import(pathToFileURL(`${commandsPath}/${file}`).href);
  if (mod.data && mod.execute) {
    client.commands.set(mod.data.name, mod);
  }
}

let manager;

client.once(Events.ClientReady, () => {
  console.log(`✅ البوت شغّال باسم ${client.user.tag}`);
  manager = new GiveawayManager(client);
  manager.resume();
  client.user.setActivity('Hadiya 🎁 | /gcreate');
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // أوامر السلاش
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction, manager);
      return;
    }

    // زر المشاركة
    if (interaction.isButton() && interaction.customId === JOIN_BUTTON_ID) {
      const result = await manager.toggleParticipant(
        interaction.message.id,
        interaction.user.id,
      );
      if (!result.ok) {
        await interaction.reply({
          content: '⚠️ هذا القيف أواي انتهى.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await interaction.reply({
        content: result.joined
          ? '✅ تمت مشاركتك! بالتوفيق 🍀'
          : '↩️ تم إلغاء مشاركتك.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // منيو الإنشاء
    if (interaction.isModalSubmit() && interaction.customId === MODAL_ID) {
      await handleModal(interaction);
      return;
    }
  } catch (err) {
    // 10062 = انتهت صلاحية التفاعل (غالباً ساعة الجهاز غير مضبوطة)
    if (err?.code === 10062) {
      console.error(
        '⚠️ تفاعل منتهي (Unknown interaction). تأكد إن ساعة جهازك مضبوطة ومتزامنة!',
      );
      return;
    }
    // 40060 = تم الرد على التفاعل مسبقاً — نتجاهله بدون إزعاج
    if (err?.code === 40060) return;

    console.error('خطأ في معالجة التفاعل:', err);
    if (
      interaction.isRepliable() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      interaction
        .reply({ content: '❌ صار خطأ غير متوقع.', flags: MessageFlags.Ephemeral })
        .catch(() => {});
    }
  }
});

// معالجة بيانات المنيو وإنشاء القيف أواي
async function handleModal(interaction) {
  const prize = interaction.fields.getTextInputValue('prize').trim();
  const winnersRaw = interaction.fields.getTextInputValue('winners').trim();
  const durationRaw = interaction.fields.getTextInputValue('duration').trim();

  const winnerCount = parseInt(winnersRaw, 10);
  if (!Number.isInteger(winnerCount) || winnerCount < 1 || winnerCount > 100) {
    return interaction.reply({
      content: '❌ عدد الفائزين لازم يكون رقم بين 1 و 100.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const durationMs = parseDuration(durationRaw);
  if (!durationMs) {
    return interaction.reply({
      content:
        '❌ صيغة المدة غلط. استخدم مثل: `30m` أو `2h` أو `1d`.\n(w=اسبوع، d=يوم، h=ساعة، m=دقيقة، s=ثانية)',
      flags: MessageFlags.Ephemeral,
    });
  }
  if (durationMs < 10_000) {
    return interaction.reply({
      content: '❌ المدة قصيرة مرة، خلها 10 ثواني على الأقل.',
      flags: MessageFlags.Ephemeral,
    });
  }

  await manager.create({
    channel: interaction.channel,
    guildId: interaction.guildId,
    hostId: interaction.user.id,
    prize,
    winnerCount,
    durationMs,
  });

  return interaction.reply({
    content: '✅ تم إنشاء القيف أواي في هذي القناة!',
    flags: MessageFlags.Ephemeral,
  });
}

client.login(token);
