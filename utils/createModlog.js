const { MessageEmbed } = require('discord.js');

const colour = {
    ban: { color: 0xD50000, title: 'Ban' },
    softban: { color: 0xFF1744, title: 'Softban' },
    kick: { color: 0xF57F17, title: 'Kick' },
    mute: { color: 0xF9A825, title: 'Mute' },
    vmute: { color: 0xFBC02D, title: 'Voice Mute' },
    warn: { color: 0xFFD600, title: 'Warn' },

    tban: { color: 0xC51162, title: 'Temporal Ban' },
    tmute: { color: 0xF50057, title: 'Temporal Mute' },
    tvmute: { color: 0xFF4081, title: 'Temporal Voice Mute' },

    unban: { color: 0x304FFE, title: 'Unban' },
    unmute: { color: 0x448AFF, title: 'Unmute' },
    unvmute: { color: 0xBBDEFB, title: 'Voice Unmute' },

    prune: { color: 0xB2FF59, title: 'Message Prune' }
};

class ModerationLog {

    constructor(guild) {
        this.client = guild.client;

        this.guild = guild;
        this.moderator = null;
        this.user = null;

        this.type = null;
        this.reason = null;
        this.extraData = null;

        this.anonymous = false;
    }

    async retrieveModLog(id) {
        const log = await this.guild.settings.moderation.getCases(id);
        this.moderator = log.moderator;
        this.user = log.user;
        this.type = log.type;
        this.reason = log.reason;

        const description = this.getDescription(id);

        const embed = new MessageEmbed()
            .setColor(colour[this.type])
            .setAuthor(this.moderator.tag)
            .setDescription(description)
            .setFooter(`Case ${id}`)
            .setTimestamp();
        return embed;
    }

    setAnonymous(value) {
        this.anonymous = value;
        return this;
    }

    setModerator(user) {
        this.moderator = { id: user.id, tag: user.tag, raw: user };
        return this;
    }

    setUser(user) {
        this.user = { id: user.id, tag: user.tag, raw: user };
        return this;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    setReason(reason) {
        if (Array.isArray(reason)) reason = reason.join(' ');
        this.reason = reason.length > 0 ? reason : null;
        return this;
    }

    setExtraData(data) {
        this.extraData = data;
        return this;
    }

    async send() {
        if (this.anonymous && this.user.raw.action === this.type) {
            delete this.user.raw.action;
            return null;
        }
        const channel = this.getChannel();

        if (channel) {
            const { embed, numberCase } = await this.getMessage();
            channel.send({ embed }).catch(err => this.client.emit('log', err, 'error'));

            return this.guild.settings.moderation.pushCase({
                moderator: this.moderator ? { id: this.moderator.id, tag: this.moderator.tag } : null,
                user: this.user ? { id: this.user.id, tag: this.user.tag } : null,
                type: this.type,
                case: numberCase,
                reason: this.reason,
                extraData: this.extraData
            });
        }

        return false;
    }

    async getMessage() {
        const numberCase = await this.guild.settings.moderation.getAmountCases();
        const description = this.getDescription(numberCase);
        return { embed: this.getEmbed(description, numberCase), numberCase };
    }

    getEmbed(description, numberCase) {
        let AUTO = false;
        let moderator;
        if (!this.moderator) {
            AUTO = true;
            moderator = this.client.user;
        } else {
            moderator = this.moderator.raw;
        }
        const embed = new MessageEmbed()
            .setColor(colour[this.type].color)
            .setAuthor(moderator.tag, moderator.displayAvatarURL({ size: 128 }))
            .setDescription(description)
            .setFooter(`${AUTO ? 'AUTO | ' : ''}Case ${numberCase}`, this.client.user.displayAvatarURL({ size: 128 }))
            .setTimestamp();
        return embed;
    }

    getDescription(numberCase) {
        return [
            `❯ **Action:** ${colour[this.type].title}`,
            `❯ **User:** ${this.user.tag} (${this.user.id})`,
            `❯ **Reason:** ${this.reason || `Please use \`${this.guild.settings.prefix}reason ${numberCase} to claim.\``}`
        ].join('\n');
    }

    getChannel() {
        return this.guild.settings.channels.mod ? this.guild.channels.get(this.guild.settings.channels.mod) : false;
    }

    static getColor(type) {
        return colour[type];
    }

}

module.exports = ModerationLog;
