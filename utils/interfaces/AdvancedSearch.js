const { GuildMember, User, Role, Channel, Message } = require('discord.js');
const { regExpEsc } = require('../../lib/util/util');
const listify = require('../../functions/listify');

const regex = {
    userOrMember: new RegExp('^(?:<@!?)?(\\d{17,21})>?$'),
    channel: new RegExp('^(?:<#)?(\\d{17,21})>?$'),
    role: new RegExp('^(?:<@&)?(\\d{17,21})>?$')
};

class Fetch {

    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });
    }

    resolveRole(query, guild) {
        if (query instanceof Role) return guild.roles.has(query.id) ? query : null;
        if (typeof query === 'string' && regex.role.test(query)) return guild.roles.get(regex.role.exec(query)[1]);
        return null;
    }

    /**
     * AdvancedSearch [ROLE]
     * @param {(Role|string)} query The query.
     * @param {Message} msg The message.
     * @returns {Promise<Role>}
     */
    async role(query, msg) {
        const resRole = this.resolveRole(query, msg.guild);
        if (resRole) return resRole;

        const results = [];
        const reg = new RegExp(regExpEsc(query), 'i');
        for (const role of msg.guild.roles.values())
            if (reg.test(role.name)) results.push(role);

        let querySearch;
        if (results.length > 0) {
            const regWord = new RegExp(`\\b${regExpEsc(query)}\\b`, 'i');
            const filtered = results.filter(role => regWord.test(role.name));
            querySearch = filtered.length > 0 ? filtered : results;
        } else {
            querySearch = results;
        }

        return this.handleResults(msg, querySearch, res => [res.id, res.name]);
    }

    resolveChannel(query, guild) {
        if (query instanceof Channel) return guild.channels.has(query.id) ? query : null;
        if (query instanceof Message) return query.guild.id === guild.id ? query.channel : null;
        if (typeof query === 'string' && regex.channel.test(query)) return guild.channels.get(regex.channel.exec(query)[1]);
        return null;
    }

    /**
     * AdvancedSearch [CHANNEL]
     * @param {(Channel|Message|string)} query The query.
     * @param {Message} msg The message.
     * @param {('text'|'voice')} type The channel type.
     * @returns {Promise<Channel>}
     */
    async channel(query, msg, type) {
        const resChannel = this.resolveChannel(query, msg.guild);
        if (resChannel) return resChannel;

        const results = [];
        const reg = new RegExp(regExpEsc(query), 'i');
        for (const channel of msg.guild.channels.values()) {
            if (typeof type !== 'undefined' && channel.type !== type) continue;
            if (reg.test(channel.name)) results.push(channel);
        }

        let querySearch;
        if (results.length > 0) {
            const regWord = new RegExp(`\\b${regExpEsc(query)}\\b`, 'i');
            const filtered = results.filter(channel => regWord.test(channel.name));
            querySearch = filtered.length > 0 ? filtered : results;
        } else {
            querySearch = results;
        }

        return this.handleResults(msg, querySearch, res => [res.id, res.name]);
    }

    resolveUser(query, guild) {
        if (query instanceof GuildMember) return query.user;
        if (query instanceof User) return query;
        if (typeof query === 'string') {
            if (regex.userOrMember.test(query)) return this.client.users.fetch(regex.userOrMember.exec(query)[1]).catch(() => null);
            if (/\w{1,32}#\d{4}/.test(query)) {
                const res = guild.members.find(member => member.user.tag === query);
                return res ? res.user : null;
            }
        }
        return null;
    }

    /**
     * AdvancedSearch [USER]
     * @param {(GuildMember|User|string)} query The query.
     * @param {Message} msg The message.
     * @returns {Promise<User>}
     */
    async user(query, msg) {
        const resUser = await this.resolveUser(query, msg.guild);
        if (resUser) return resUser;

        const results = [];
        const reg = new RegExp(regExpEsc(query), 'i');
        for (const member of msg.guild.members.values())
            if (reg.test(member.user.username)) results.push(member.user);

        let querySearch;
        if (results.length > 0) {
            const regWord = new RegExp(`\\b${regExpEsc(query)}\\b`, 'i');
            const filtered = results.filter(user => regWord.test(user.username));
            querySearch = filtered.length > 0 ? filtered : results;
        } else {
            querySearch = results;
        }

        return this.handleResults(msg, querySearch, res => [res.id, res.tag]);
    }

    handleResults(msg, results, parseList) {
        switch (results.length) {
            case 0: return null;
            case 1: return results[0];
            default: return this.makePrompt(msg, results, parseList).catch(() => null);
        }
    }

    async makePrompt(msg, results, parseList, index = 1, alert = 'I have found multiple matches') {
        await msg.send(`Dear ${msg.author}, ${alert}:${'```asciidoc'}\n${listify(results.map(parseList), { index })}${'```'}`);
        const response = await msg.channel.awaitMessages(message => message.author.id === msg.author.id, { time: 30000, errors: ['time'], max: 1 });
        const message = response.first();
        const resText = message.content.toLowerCase();
        if (message.deletable) message.nuke().catch(() => null);
        if (resText === 'abort') return this.promptAbort(msg);
        if (resText === 'next') {
            let nextIndex = index;
            if (index + 1 > Math.ceil(results.length / 10)) alert = 'There is no next page.';
            else ++nextIndex;
            return this.makePrompt(msg, results, parseList, nextIndex, alert);
        }
        if (resText === 'prev' || resText === 'previous') {
            let nextIndex = index;
            if (nextIndex === 1) alert = 'There is no previous page.';
            else --nextIndex;
            return this.makePrompt(msg, results, parseList, nextIndex, alert);
        }
        if (isNaN(resText) === false) {
            const number = parseInt(resText);
            return results[number - 1] || this.makePrompt(msg, results, parseList, index, 'I cannot find that index from this list, try again.');
        }
        return this.promptAbort(msg);
    }

    promptAbort(msg) {
        return msg.send('Prompt aborted').then(() => null);
    }

}

module.exports = Fetch;
