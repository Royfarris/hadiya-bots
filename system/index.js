// الملف الرئيسي لبوت الإدارة System
import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  MessageFlags,
} from 'discord.js';
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { handlePrefix } from './prefix.js';
import { handleLevelMessage } from './leveling.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const token = process.env.SYSTEM_TOKEN?.trim();

// لو ما فيه توكن، نتخطّى هذا البوت بدون ما نوقف الباقي
if (!token) {
  console.warn('⚠️ بوت System: ما فيه SYSTEM_TOKEN في .env — تم تخطّيه.');
} else {
  console.log(`[System] طول التوكن: ${token.length} (المفروض 70-75)`);
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  client.on(Events.Error, (err) =>
    console.error('System - خطأ في العميل:', err?.message || err),
  );

  // تحميل الأوامر
  client.commands = new Collection();
  const commandsPath = `${__dirname}/commands`;
  for (const file of readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
    const mod = await import(pathToFileURL(`${commandsPath}/${file}`).href);
    if (mod.data && mod.execute) client.commands.set(mod.data.name, mod);
  }

  client.once(Events.ClientReady, () => {
    console.log(`✅ بوت System شغّال باسم ${client.user.tag}`);
    client.user.setActivity('🛡️ الإدارة | /ahelp');
  });

  // أوامر البرفكس (#) + نظام المستويات
  client.on(Events.MessageCreate, (message) => {
    handlePrefix(message).catch((err) =>
      console.error('System - خطأ في معالجة الرسالة:', err?.message || err),
    );
    handleLevelMessage(message).catch((err) =>
      console.error('System - خطأ في المستويات:', err?.message || err),
    );
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      if (err?.code === 10062 || err?.code === 40060) return;
      console.error('System - خطأ في الأمر:', err);
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

  client.login(token);
}

process.on('unhandledRejection', (err) =>
  console.error('System - خطأ غير معالج:', err?.code || err?.message || err),
);
