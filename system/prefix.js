// معالج أوامر البرفكس (#) لبوت الإدارة
import {
  PermissionFlagsBits,
  EmbedBuilder,
  AttachmentBuilder,
} from 'discord.js';
import { validateMember } from './helpers.js';
import { parseDuration, formatDuration } from '../src/utils.js';
import { addWarn, getWarns, clearWarns, removeWarn } from './warnStore.js';
import { dmUser } from './notify.js';
import {
  getXp,
  levelFromXp,
  getRank,
  getLeaderboard,
} from './levelStore.js';
import { buildRankCard } from './rankCard.js';

export const PREFIX = '#';

const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000;

// إيموجي الرياكشن (نجاح/خطأ)
const CORRECT = 'correct:1519702803797250070';
const DENIED = 'denied:1519702805492006922';

const ok = (m) => m.react(CORRECT).catch(() => {});
const fail = (m) => m.react(DENIED).catch(() => {});

// يطلّع ايدي من منشن أو رقم
function extractId(token) {
  if (!token) return null;
  const m = token.match(/^<@!?(\d{17,20})>$/);
  if (m) return m[1];
  if (/^\d{17,20}$/.test(token)) return token;
  return null;
}

// يجيب العضو الهدف من أول وسيط، ويرجّع الباقي
async function resolveTarget(message, args) {
  const id = extractId(args[0]);
  if (!id) return { id: null, member: null, rest: args };
  const member = await message.guild.members.fetch(id).catch(() => null);
  return { id, member, rest: args.slice(1) };
}

function lacksPerm(message, perm) {
  return !message.member.permissions.has(perm);
}

const guildIcon = (message) => message.guild.iconURL() ?? undefined;

export async function handlePrefix(message) {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();
  if (!cmd) return;

  try {
    switch (cmd) {
      case 'kick': {
        if (lacksPerm(message, PermissionFlagsBits.KickMembers))
          return fail(message);
        const { member, rest } = await resolveTarget(message, args);
        if (validateMember(message.member, member)) return fail(message);
        if (!member.kickable) return fail(message);
        const reason = rest.join(' ') || 'بدون سبب';
        await dmUser(member.user, {
          title: '👢 تم طردك',
          fields: [
            { name: 'السيرفر', value: message.guild.name, inline: true },
            { name: 'بواسطة', value: message.author.tag, inline: true },
            { name: 'السبب', value: reason },
          ],
          guildName: message.guild.name,
          guildIconURL: guildIcon(message),
        });
        await member.kick(reason);
        return ok(message);
      }

      case 'ban': {
        if (lacksPerm(message, PermissionFlagsBits.BanMembers))
          return fail(message);
        const { id, member, rest } = await resolveTarget(message, args);
        if (!id) return fail(message);
        if (member) {
          if (validateMember(message.member, member)) return fail(message);
          if (!member.bannable) return fail(message);
        }
        const reason = rest.join(' ') || 'بدون سبب';
        if (member) {
          await dmUser(member.user, {
            title: '🔨 تم حظرك',
            fields: [
              { name: 'السيرفر', value: message.guild.name, inline: true },
              { name: 'بواسطة', value: message.author.tag, inline: true },
              { name: 'السبب', value: reason },
            ],
            guildName: message.guild.name,
            guildIconURL: guildIcon(message),
          });
        }
        await message.guild.members.ban(id, { reason });
        return ok(message);
      }

      case 'unban': {
        if (lacksPerm(message, PermissionFlagsBits.BanMembers))
          return fail(message);
        const id = extractId(args[0]);
        if (!id) return fail(message);
        const ban = await message.guild.bans.fetch(id).catch(() => null);
        if (!ban) return fail(message);
        await message.guild.members.unban(id);
        return ok(message);
      }

      case 'timeout':
      case 'mute': {
        if (lacksPerm(message, PermissionFlagsBits.ModerateMembers))
          return fail(message);
        const { member, rest } = await resolveTarget(message, args);
        if (validateMember(message.member, member)) return fail(message);
        if (!member.moderatable) return fail(message);
        const ms = parseDuration(rest[0]);
        if (!ms || ms > MAX_TIMEOUT) return fail(message);
        const reason = rest.slice(1).join(' ') || 'بدون سبب';
        await member.timeout(ms, reason);
        await dmUser(member.user, {
          title: '🔇 تم كتمك',
          fields: [
            { name: 'السيرفر', value: message.guild.name, inline: true },
            { name: 'المدة', value: formatDuration(ms), inline: true },
            { name: 'السبب', value: reason },
          ],
          guildName: message.guild.name,
          guildIconURL: guildIcon(message),
        });
        return ok(message);
      }

      case 'untimeout':
      case 'unmute': {
        if (lacksPerm(message, PermissionFlagsBits.ModerateMembers))
          return fail(message);
        const { member } = await resolveTarget(message, args);
        if (!member || !member.isCommunicationDisabled()) return fail(message);
        await member.timeout(null);
        return ok(message);
      }

      case 'warn': {
        if (lacksPerm(message, PermissionFlagsBits.ModerateMembers))
          return fail(message);
        const { member, rest } = await resolveTarget(message, args);
        if (validateMember(message.member, member, { allowOwner: true }))
          return fail(message);
        const reason = rest.join(' ') || 'بدون سبب';
        const count = addWarn(message.guild.id, member.id, {
          by: message.author.id,
          reason,
          time: Date.now(),
        });
        await dmUser(member.user, {
          title: '⚠️ تم تحذيرك',
          fields: [
            { name: 'السيرفر', value: message.guild.name, inline: true },
            { name: 'عدد تحذيراتك', value: `${count}`, inline: true },
            { name: 'السبب', value: reason },
          ],
          guildName: message.guild.name,
          guildIconURL: guildIcon(message),
        });
        return ok(message);
      }

      case 'clearwarns': {
        if (lacksPerm(message, PermissionFlagsBits.ModerateMembers))
          return fail(message);
        const { member } = await resolveTarget(message, args);
        if (!member) return fail(message);
        return clearWarns(message.guild.id, member.id) ? ok(message) : fail(message);
      }

      case 'unwarn': {
        if (lacksPerm(message, PermissionFlagsBits.ModerateMembers))
          return fail(message);
        const { member, rest } = await resolveTarget(message, args);
        if (!member) return fail(message);
        const number = parseInt(rest[0], 10);
        if (!Number.isInteger(number)) return fail(message);
        return removeWarn(message.guild.id, member.id, number)
          ? ok(message)
          : fail(message);
      }

      case 'softban': {
        if (lacksPerm(message, PermissionFlagsBits.BanMembers))
          return fail(message);
        const { member, rest } = await resolveTarget(message, args);
        if (validateMember(message.member, member)) return fail(message);
        if (!member.bannable) return fail(message);
        const reason = rest.join(' ') || 'بدون سبب';
        await dmUser(member.user, {
          title: '🧹 تم تنظيف رسائلك (softban)',
          fields: [
            { name: 'السيرفر', value: message.guild.name, inline: true },
            { name: 'السبب', value: reason },
          ],
          guildName: message.guild.name,
          guildIconURL: guildIcon(message),
        });
        await message.guild.members.ban(member.id, {
          reason,
          deleteMessageSeconds: 7 * 24 * 60 * 60,
        });
        await message.guild.members.unban(member.id, 'softban');
        return ok(message);
      }

      case 'disconnect':
      case 'voicekick':
      case 'vkick': {
        if (lacksPerm(message, PermissionFlagsBits.MoveMembers))
          return fail(message);
        const { member } = await resolveTarget(message, args);
        if (!member?.voice?.channel) return fail(message);
        await member.voice.disconnect();
        return ok(message);
      }

      case 'vmute': {
        if (lacksPerm(message, PermissionFlagsBits.MuteMembers))
          return fail(message);
        const { member } = await resolveTarget(message, args);
        if (!member?.voice?.channel) return fail(message);
        await member.voice.setMute(true, 'vmute');
        return ok(message);
      }

      case 'vunmute': {
        if (lacksPerm(message, PermissionFlagsBits.MuteMembers))
          return fail(message);
        const { member } = await resolveTarget(message, args);
        if (!member?.voice?.channel) return fail(message);
        await member.voice.setMute(false, 'vunmute');
        return ok(message);
      }

      case 'avatar':
      case 'av': {
        const { member } = await resolveTarget(message, args);
        const user = member?.user ?? message.author;
        return message.reply(user.displayAvatarURL({ size: 1024 }));
      }

      case 'lock': {
        if (lacksPerm(message, PermissionFlagsBits.ManageChannels))
          return fail(message);
        await message.channel.permissionOverwrites.edit(
          message.guild.roles.everyone,
          { SendMessages: false },
        );
        return ok(message);
      }

      case 'unlock': {
        if (lacksPerm(message, PermissionFlagsBits.ManageChannels))
          return fail(message);
        await message.channel.permissionOverwrites.edit(
          message.guild.roles.everyone,
          { SendMessages: null },
        );
        return ok(message);
      }

      case 'hide': {
        if (lacksPerm(message, PermissionFlagsBits.ManageChannels))
          return fail(message);
        await message.channel.permissionOverwrites.edit(
          message.guild.roles.everyone,
          { ViewChannel: false },
        );
        return ok(message);
      }

      case 'unhide': {
        if (lacksPerm(message, PermissionFlagsBits.ManageChannels))
          return fail(message);
        await message.channel.permissionOverwrites.edit(
          message.guild.roles.everyone,
          { ViewChannel: null },
        );
        return ok(message);
      }

      case 'slowmode':
      case 'slow': {
        if (lacksPerm(message, PermissionFlagsBits.ManageChannels))
          return fail(message);
        const sec = parseInt(args[0], 10);
        if (!Number.isInteger(sec) || sec < 0 || sec > 21600)
          return fail(message);
        await message.channel.setRateLimitPerUser(sec);
        return ok(message);
      }

      case 'role': {
        if (lacksPerm(message, PermissionFlagsBits.ManageRoles))
          return fail(message);
        const { member, rest } = await resolveTarget(message, args);
        if (!member) return fail(message);
        const role =
          message.mentions.roles.first() ||
          message.guild.roles.cache.get(rest[0]) ||
          message.guild.roles.cache.find((r) => r.name === rest.join(' '));
        if (!role || role.managed) return fail(message);
        if (role.position >= message.guild.members.me.roles.highest.position)
          return fail(message);
        if (member.roles.cache.has(role.id)) await member.roles.remove(role);
        else await member.roles.add(role);
        return ok(message);
      }

      case 'nick': {
        if (lacksPerm(message, PermissionFlagsBits.ManageNicknames))
          return fail(message);
        const { member, rest } = await resolveTarget(message, args);
        if (!member || !member.manageable) return fail(message);
        await member.setNickname(rest.join(' ') || null);
        return ok(message);
      }

      case 'say': {
        if (lacksPerm(message, PermissionFlagsBits.ManageMessages))
          return fail(message);
        const text = args.join(' ');
        if (!text) return fail(message);
        await message.channel.send({
          content: text,
          allowedMentions: { parse: [] },
        });
        return message.delete().catch(() => {});
      }

      case 'clear':
      case 'purge': {
        if (lacksPerm(message, PermissionFlagsBits.ManageMessages))
          return fail(message);
        const count = parseInt(args[0], 10);
        if (!Number.isInteger(count) || count < 1 || count > 100)
          return fail(message);
        const deleted = await message.channel
          .bulkDelete(count + 1, true)
          .catch(() => null);
        if (!deleted) return;
        return message.channel
          .send(`✅ تم مسح **${deleted.size - 1}** رسالة.`)
          .then((m) => setTimeout(() => m.delete().catch(() => {}), 4000));
      }

      // === أوامر الأعضاء (مستويات) ===
      case 'rank':
      case 'level':
      case 'r': {
        const { member } = await resolveTarget(message, args);
        const user = member?.user ?? message.author;
        const xp = getXp(message.guild.id, user.id);
        const { level, current, needed } = levelFromXp(xp);
        const { rank } = getRank(message.guild.id, user.id);
        const png = await buildRankCard({
          avatarURL: user.displayAvatarURL({ extension: 'png', size: 256 }),
          username: user.username,
          level,
          rank,
          xp,
          current,
          needed,
        });
        return message.reply({
          files: [new AttachmentBuilder(png, { name: 'rank.png' })],
        });
      }

      case 'top':
      case 'leaderboard': {
        const lb = getLeaderboard(message.guild.id, 10);
        if (lb.length === 0) return message.reply('📭 ما فيه نقاط مسجّلة بعد.');
        const medals = ['🥇', '🥈', '🥉'];
        const lines = lb.map(([id, xp], i) => {
          const { level } = levelFromXp(xp);
          const r = medals[i] ?? `**${i + 1}.**`;
          return `${r} <@${id}> — مستوى **${level}** (${xp} XP)`;
        });
        const embed = new EmbedBuilder()
          .setColor(0x7c3aed)
          .setTitle(`🏆 ترتيب ${message.guild.name}`)
          .setDescription(lines.join('\n'));
        return message.reply({ embeds: [embed] });
      }

      // أوامر معلومات (ترد برسالة عادية)
      case 'warnings':
      case 'warns': {
        const { member } = await resolveTarget(message, args);
        if (!member) return fail(message);
        const warns = getWarns(message.guild.id, member.id);
        if (warns.length === 0)
          return message.reply(`✅ **${member.user.tag}** ما عنده تحذيرات.`);
        const list = warns
          .map(
            (w, i) =>
              `**${i + 1}.** ${w.reason} — بواسطة <@${w.by}> <t:${Math.floor(w.time / 1000)}:R>`,
          )
          .join('\n');
        return message.reply(
          `⚠️ تحذيرات **${member.user.tag}** (${warns.length}):\n${list}`,
        );
      }

      case 'help':
      case 'ahelp': {
        return message.reply(
          [
            '🛡️ **أوامر الإدارة بالبرفكس** `#`',
            '**الأعضاء:** `#kick` `#ban` `#unban` `#timeout` `#untimeout`',
            '**التحذيرات:** `#warn` `#warnings` `#clearwarns`',
            '**الرومات:** `#lock` `#unlock` `#hide` `#unhide` `#slowmode` `#clear`',
            '**ثاني:** `#role @عضو @رتبة` `#nick @عضو لقب` `#say رسالة`',
          ].join('\n'),
        );
      }

      default:
        return; // أمر غير معروف — نتجاهله
    }
  } catch (err) {
    console.error('System - خطأ في أمر برفكس:', err?.message || err);
    fail(message);
  }
}
