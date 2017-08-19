const ModLog = require('./createModlog.js');
const moment = require('moment');

const date = time => moment(time).format('DD[/]MM[, at ]hh[:]mm[:]ss');
const duration = time => moment.duration(time).format('hh [hours,] mm [minutes,] ss [seconds]');

class TaskProcess {

    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });
    }

    async reminder(doc) {
        const user = await this.client.fetchUser(doc.user).catch((err) => { throw err; });
        const message = `⏲ Hey! You asked me on ${date(doc.createdAt)} to remind you:\n*${doc.content}*`;
        return user.send(message).catch((err) => { throw err; });
    }

    async poll(poll) {
        const user = await this.client.fetchUser(poll.user).catch((err) => { throw err; });
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

        return this.client.clock.create({
            type: 'pollEnd',
            timestamp: 86400000 + Date.now(),
            poll
        }).catch((err) => { throw err; });
    }

    async unban(doc) {
        const guild = this.client.guilds.get(doc.guild);
        if (!guild) return null;
        if (guild.me.permissions.has('BAN_MEMBERS') !== true) return null;

        const user = await this.client.fetchUser(doc.user).catch((err) => { throw err; });

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

        const user = await this.client.fetchUser(doc.user).catch((err) => { throw err; });
        const member = await guild.fetchMember(user).catch(() => null);

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

        const user = await this.client.fetchUser(doc.user).catch((err) => { throw err; });
        const member = await guild.fetchMember(user).catch(() => null);

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
