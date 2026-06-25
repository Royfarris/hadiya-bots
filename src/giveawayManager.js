// مدير القيف أواي: ينشئ ويتابع وينهي ويعيد سحب القيف أوايات
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { loadGiveaways, saveGiveaways } from './storage.js';
import { pickWinners } from './utils.js';

export const JOIN_BUTTON_ID = 'giveaway_join';

// إيموجي زر الدخول (إيموجي مخصص من سيرفرك)
export const ENTER_EMOJI = { id: '1519648386175996016', name: 'enter' };

// إيموجي الافنت (البوبر) — يظهر داخل وصف الرسالة
export const EVENT_EMOJI = { id: '1519661163825336431', name: 'event' };

export class GiveawayManager {
  constructor(client) {
    this.client = client;
    this.giveaways = loadGiveaways();
    this.timers = new Map(); // messageId -> Timeout
  }

  save() {
    saveGiveaways(this.giveaways);
  }

  get(messageId) {
    return this.giveaways.find((g) => g.messageId === messageId);
  }

  // كل القيف أوايات الشغّالة في سيرفر معيّن
  activeInGuild(guildId) {
    return this.giveaways.filter((g) => g.guildId === guildId && !g.ended);
  }

  // يبني الإمبيد حق القيف أواي (شكل مطوّر وأنيق)
  buildEmbed(g) {
    const ts = Math.floor(g.endAt / 1000);

    if (g.ended) {
      const winnersText =
        g.winners.length > 0
          ? g.winners.map((id) => `<@${id}>`).join('\n> ')
          : '*لا يوجد فائز كفاية* 😔';

      return new EmbedBuilder()
        .setColor(0x7c3aed)
        .setTitle(g.prize)
        .setDescription(
          [
            `${this.eventMention()} **انتهى القيف أواي** ${this.eventMention()}`,
            '',
            `**الفائزون:**`,
            `> ${winnersText}`,
            '',
            `انتهى <t:${ts}:R>`,
            `المنظّم: <@${g.hostId}>`,
            `المشاركون: **${g.participants.length}**`,
          ].join('\n'),
        )
        .setFooter({ text: 'Hadiya • Giveaway Bot' })
        .setTimestamp(g.endAt);
    }

    return new EmbedBuilder()
      .setColor(0x7c3aed)
      .setTitle(g.prize)
      .setDescription(
        [
          `${this.eventMention()} **قيف أواي جديد** ${this.eventMention()}`,
          `اضغط ${this.enterMention()} تحت عشان تشارك!`,
          '',
          `**ينتهي:** <t:${ts}:R>`,
          `**عدد الفائزين:** ${g.winnerCount}`,
          `**المشاركون:** ${g.participants.length}`,
          `**المنظّم:** <@${g.hostId}>`,
        ].join('\n'),
      )
      .setFooter({ text: 'Hadiya • Giveaway Bot' })
      .setTimestamp(g.endAt);
  }

  // نص ذكر إيموجي الدخول داخل الرسالة
  enterMention() {
    return `<:${ENTER_EMOJI.name}:${ENTER_EMOJI.id}>`;
  }

  // نص ذكر إيموجي الافنت داخل الرسالة
  eventMention() {
    return `<:${EVENT_EMOJI.name}:${EVENT_EMOJI.id}>`;
  }

  buildButton(g, disabled = false) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(JOIN_BUTTON_ID)
        .setEmoji(ENTER_EMOJI)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
    );
    return row;
  }

  // ينشئ قيف أواي جديد وينشر الرسالة
  async create({ channel, guildId, hostId, prize, winnerCount, durationMs }) {
    const endAt = Date.now() + durationMs;
    const g = {
      messageId: null,
      channelId: channel.id,
      guildId,
      hostId,
      prize,
      winnerCount,
      endAt,
      ended: false,
      participants: [],
      winners: [],
    };

    const message = await channel.send({
      embeds: [this.buildEmbed(g)],
      components: [this.buildButton(g)],
    });

    g.messageId = message.id;
    this.giveaways.push(g);
    this.save();
    this.scheduleEnd(g);
    return g;
  }

  // يضيف مشارك (أو يشيله لو ضغط مرتين)
  async toggleParticipant(messageId, userId) {
    const g = this.get(messageId);
    if (!g || g.ended) return { ok: false, reason: 'ended' };

    const idx = g.participants.indexOf(userId);
    let joined;
    if (idx === -1) {
      g.participants.push(userId);
      joined = true;
    } else {
      g.participants.splice(idx, 1);
      joined = false;
    }
    this.save();
    await this.refreshMessage(g);
    return { ok: true, joined, count: g.participants.length };
  }

  // يحدّث الرسالة بعد تغيّر عدد المشاركين
  async refreshMessage(g) {
    try {
      const channel = await this.client.channels.fetch(g.channelId);
      const message = await channel.messages.fetch(g.messageId);
      await message.edit({
        embeds: [this.buildEmbed(g)],
        components: [this.buildButton(g, g.ended)],
      });
    } catch (err) {
      console.error('تعذّر تحديث رسالة القيف أواي:', err.message);
    }
  }

  // يجدول إنهاء القيف أواي في وقته
  scheduleEnd(g) {
    if (this.timers.has(g.messageId)) {
      clearTimeout(this.timers.get(g.messageId));
    }
    const delay = g.endAt - Date.now();
    if (delay <= 0) {
      this.end(g.messageId);
      return;
    }
    // setTimeout يقبل حد أقصى ~24.8 يوم، فنقسّم المدد الطويلة
    const MAX = 2_147_483_647;
    if (delay > MAX) {
      const timer = setTimeout(() => this.scheduleEnd(g), MAX);
      this.timers.set(g.messageId, timer);
    } else {
      const timer = setTimeout(() => this.end(g.messageId), delay);
      this.timers.set(g.messageId, timer);
    }
  }

  // ينهي القيف أواي ويعلن الفائزين
  async end(messageId, force = false) {
    const g = this.get(messageId);
    if (!g) return { ok: false, reason: 'not_found' };
    if (g.ended && !force) return { ok: false, reason: 'already_ended' };

    g.ended = true;
    g.endAt = Math.min(g.endAt, Date.now());
    if (this.timers.has(messageId)) {
      clearTimeout(this.timers.get(messageId));
      this.timers.delete(messageId);
    }

    g.winners = pickWinners(g.participants, g.winnerCount);
    this.save();

    try {
      const channel = await this.client.channels.fetch(g.channelId);
      const message = await channel.messages.fetch(g.messageId);
      await message.edit({
        embeds: [this.buildEmbed(g)],
        components: [this.buildButton(g, true)],
      });

      if (g.winners.length > 0) {
        const mentions = g.winners.map((id) => `<@${id}>`).join(' ');
        await channel.send({
          content: `${this.eventMention()} مبروك ${mentions}! ربحتوا **${g.prize}**`,
          reply: { messageReference: g.messageId },
        });
      } else {
        await channel.send({
          content: `لا يوجد مشاركون كفاية في قيف أواي **${g.prize}**`,
          reply: { messageReference: g.messageId },
        });
      }
    } catch (err) {
      console.error('تعذّر إنهاء القيف أواي:', err.message);
    }

    return { ok: true, giveaway: g };
  }

  // يعيد سحب فائزين جدد لقيف أواي منتهي
  async reroll(messageId) {
    const g = this.get(messageId);
    if (!g) return { ok: false, reason: 'not_found' };
    if (!g.ended) return { ok: false, reason: 'not_ended' };

    const newWinners = pickWinners(g.participants, g.winnerCount);
    if (newWinners.length === 0) {
      return { ok: false, reason: 'no_participants' };
    }
    g.winners = newWinners;
    this.save();

    try {
      const channel = await this.client.channels.fetch(g.channelId);
      const mentions = newWinners.map((id) => `<@${id}>`).join(' ');
      await channel.send({
        content: `${this.eventMention()} إعادة سحب! الفائزون الجدد بـ **${g.prize}**: ${mentions}`,
        reply: { messageReference: g.messageId },
      });
    } catch (err) {
      console.error('تعذّر إرسال إعادة السحب:', err.message);
    }
    return { ok: true, winners: newWinners };
  }

  // يحذف قيف أواي من التخزين
  async delete(messageId) {
    const idx = this.giveaways.findIndex((g) => g.messageId === messageId);
    if (idx === -1) return false;
    if (this.timers.has(messageId)) {
      clearTimeout(this.timers.get(messageId));
      this.timers.delete(messageId);
    }
    this.giveaways.splice(idx, 1);
    this.save();
    return true;
  }

  // يعيد جدولة كل القيف أوايات الشغّالة بعد إعادة تشغيل البوت
  resume() {
    for (const g of this.giveaways) {
      if (g.ended) continue;
      if (g.endAt <= Date.now()) {
        this.end(g.messageId);
      } else {
        this.scheduleEnd(g);
      }
    }
    console.log(`تمّت إعادة جدولة ${this.activeAll().length} قيف أواي شغّال.`);
  }

  activeAll() {
    return this.giveaways.filter((g) => !g.ended);
  }
}
