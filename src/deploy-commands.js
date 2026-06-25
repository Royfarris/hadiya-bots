// تسجيل الأوامر عالمياً (تشتغل في كل السيرفرات اللي فيها البوت)
import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  console.error('❌ لازم تحط DISCORD_TOKEN و CLIENT_ID في ملف .env');
  process.exit(1);
}

const commands = [];
const commandsPath = `${__dirname}/commands`;
const files = readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

for (const file of files) {
  const mod = await import(pathToFileURL(`${commandsPath}/${file}`).href);
  if (mod.data) commands.push(mod.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

try {
  console.log(`⏳ جاري تسجيل ${commands.length} أمر عالمياً...`);
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log('✅ تم تسجيل الأوامر! (قد تأخذ لين ساعة عشان تظهر في كل السيرفرات)');
} catch (error) {
  console.error('❌ خطأ في التسجيل:', error);
}
