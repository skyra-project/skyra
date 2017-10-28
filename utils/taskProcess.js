const ModLog = require('./createModlog.js');
const moment = require('moment');
const { MessageEmbed } = require('discord.js');
const sleep = require('util').promisify(setTimeout);

const date = time => moment(time).format('DD[/]MM[, at ]hh[:]mm[:]ss');
const duration = time => moment.duration(time).format('h [hours,] m [minutes,] s [seconds]');

class TaskProcess {

    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });
    }

    async reminder(doc) {
        const user = await this.client.users.fetch(doc.user).catch((err) => { throw err; });
        const message = `⏲ Hey! You asked me on ${date(doc.createdAt)} to remind you:\n*${doc.content}*`;
        return user.send(message).catch((err) => { throw err; });
    }

    async poll(poll) {
        const user = await this.client.users.fetch(poll.user).catch((err) => { throw err; });
        let content;
        if (poll.voted.length > 0) {
            const graph = [];
            const length = Object.keys(poll.votes).reduce((long, str) => Math.max(long, str.length), 0);
            for (const [key, value] of Object.entries(poll.votes)) {
                const percentage = Math.round((value / poll.voted.length) * 100);
                graph.push(`${key.padEnd(length, ' ')} : [${'#'.repeat((percentage / 100) * 25).padEnd(25, ' ')}] (${percentage}%)`);
            }
            content = `Hey! Your poll __${poll.title}__ with ID \`${poll.id}\` just finished, check the results!${'```http'}\n${graph.join('\n')}${'```'}`;
        } else {
            content = `Hey! Your poll __${poll.title}__ with ID \`${poll.id}\` just finished, but nobody voted :(`;
        }

        await user.send(content).catch(() => null);

        return this.client.handler.clock.create({
            type: 'pollEnd',
            timestamp: 86400000 + Date.now(),
            poll
        }).catch((err) => { throw err; });
    }

    async giveaway(doc) {
        const author = await this.client.users.fetch(doc.user).catch(() => null);
        if (!author)
            return null;
        const guild = this.client.guilds.get(doc.guild);
        if (!guild)
            return null;
        const channel = guild.channels.get(doc.channel);
        if (!channel)
            return null;
        const message = await channel.messages.fetch(doc.message).catch(() => null);
        if (!message)
            return null;
        const reactions = message.reactions.get('🎉');
        if (!reactions)
            return null;

        this._giveaway(doc, author, guild, channel, message, reactions).catch(() => null);
        return true;
    }

    async _giveaway(doc, author, guild, channel, message, reactions) {
        const settings = await guild.settings;
        const i18n = this.client.languages.get(settings.master.language);
        const ends = new Date(doc.timestamp + 20000);
        const embed = new MessageEmbed()
            .setColor(0xE64700)
            .setTitle(doc.title)
            .setDescription(i18n.get('GIVEAWAY_LASTCHANCE', 20000))
            .setFooter(i18n.get('GIVEAWAY_ENDS_AT'))
            .setTimestamp(ends);

        await this._giveawayCountdown(doc, embed, message, ends, i18n).catch(() => null);

        const users = await reactions.fetchUsers().catch(() => null);
        if (users === null || users.size === 0)
            return null;
        users.delete(this.client.user.id);

        const amount = Math.min(users.size, 11);
        const winners = users.random(amount);
        const winner = winners[0];

        embed
            .setColor(0xFF7749)
            .setDescription(i18n.get('GIVEAWAY_ENDED', winner))
            .setFooter(i18n.get('GIVEAWAY_ENDED_AT'));
        await message.edit(i18n.get('GIVEAWAY_ENDED_TITLE'), { embed }).catch(() => null);
        await channel.send(i18n.get('GIVEAWAY_ENDED_MESSAGE', winner, doc.title)).catch(() => null);

        return author.send(i18n.get('GIVEAWAY_ENDED_DIRECT_MESSAGE', doc.title, doc.id, winner, amount - 1, winners.length > 1 ? `${'```asciidoc\n'}${winners
            .slice(1)
            .map(user => `${user.id.padEnd(18, ' ')} :: ${user.tag}`)
            .join('\n')
            .replace(/```/g, '`\u200B``')}${'```'}` : ''));
    }

    async _giveawayCountdown(doc, embed, message, ends, i18n) {
        const LASTCHANCE_TITLE = i18n.get('GIVEAWAY_LASTCHANCE_TITLE');

        message.edit(LASTCHANCE_TITLE, { embed });
        await sleep(10000);
        embed.setDescription(i18n.get('GIVEAWAY_LASTCHANCE', 10000));
        message.edit(LASTCHANCE_TITLE, { embed });
        await sleep(5000);
        for (const remaining of [5000, 4000, 3000, 2000, 1000]) {
            embed.setDescription(i18n.get('GIVEAWAY_LASTCHANCE', remaining));
            message.edit(LASTCHANCE_TITLE, { embed });
            await sleep(1000);
        }
    }

    async unban(doc) {
        const guild = this.client.guilds.get(doc.guild);
        if (!guild) return null;
        if (guild.me.permissions.has('BAN_MEMBERS') !== true) return null;

        const user = await this.client.users.fetch(doc.user).catch((err) => { throw err; });

        user.action = 'unban';
        await guild.unban(user, `[AUTO] Ban released after ${duration(doc.duration)}`);

        return new ModLog(guild)
            .setModerator(this.client.user)
            .setUser(user)
            .setType('unban')
            .setReason(`Ban released after ${duration(doc.duration)}`)
            .send();
    }

    async unmute(doc) {
        const guild = this.client.guilds.get(doc.guild);
        if (!guild) return null;
        if (guild.me.permissions.has('MANAGE_ROLES') !== true) return null;

        const user = await this.client.users.fetch(doc.user).catch((err) => { throw err; });
        const member = await guild.members.fetch(user).catch(() => null);

        if (!member) return null;

        let settings = guild.settings;
        if (settings instanceof Promise) settings = await settings;

        const mutedUsed = await settings.moderation.getMute(user.id);
        if (!mutedUsed) return null;

        const roles = mutedUsed.extraData || [];
        await member.edit({ roles });

        return new ModLog(guild)
            .setModerator(this.client.user)
            .setUser(user)
            .setType('unmute')
            .setReason(`Mute released after ${duration(doc.duration)}`)
            .send();
    }

    async vunmute(doc) {
        const guild = this.client.guilds.get(doc.guild);
        if (!guild) return null;
        if (guild.me.permissions.has('MUTE_MEMBERS') !== true) return null;

        const user = await this.client.users.fetch(doc.user).catch((err) => { throw err; });
        const member = await guild.members.fetch(user).catch(() => null);

        if (!member || member.serverMute !== true) return null;

        await member.setDeaf(false, `[AUTO] Mute released after ${duration(doc.duration)}`);

        return new ModLog(guild)
            .setModerator(this.client.user)
            .setUser(user)
            .setType('unvmute')
            .setReason(`Ban released after ${duration(doc.duration)}`)
            .send();
    }

}

module.exports = TaskProcess;
