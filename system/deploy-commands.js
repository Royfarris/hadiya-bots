// تسجيل أوامر بوت الإدارة System عالمياً
import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const token = process.env.SYSTEM_TOKEN;
const clientId = process.env.SYSTEM_CLIENT_ID;

if (!token || !clientId) {
  console.error('❌ لازم تحط SYSTEM_TOKEN و SYSTEM_CLIENT_ID في ملف .env');
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
  console.log(`⏳ جاري تسجيل ${commands.length} أمر لبوت System...`);
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log('✅ تم تسجيل أوامر System!');
} catch (error) {
  console.error('❌ خطأ في التسجيل:', error);
}
