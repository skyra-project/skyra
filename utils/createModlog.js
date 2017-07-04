const toTitleCase = require("../functions/toTitleCase");

const colour = {
    ban: 0xFF0200,
    unban: 0xFF4443,
    softban: 0xFF1A44,
    kick: 0xFFE604,
    mute: 0xFF6E23,
    unmute: 0xFF8343,
    warn: 0xFF8F2A,
    unwarn: 0xFF9C43,
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
    }

    async retrieveModLog(id) {
        const log = await this.guild.settings.moderation.getCases(id);
        this.moderator = log.moderator;
        this.user = log.user;
        this.type = log.type;
        this.reason = log.reason;

        const description = this.getDescription(id);

        const embed = new this.client.methods.Embed()
            .setColor(colour[this.type])
            .setAuthor(this.moderator.tag)
            .setDescription(description)
            .setFooter(`Case ${id}`)
            .setTimestamp();
        return embed;
    }

    setModerator(user) {
        this.moderator = { id: user.id, tag: user.tag, raw: user };
        return this;
    }

    setUser(user) {
        this.user = { id: user.id, tag: user.tag };
        return this;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    setReason(reason) {
        if (reason instanceof Array) {
            if (!reason.length) reason = null;
            else reason = reason.join(" ");
        }

        this.reason = reason;
        return this;
    }

    setExtraData(data) {
        this.extraData = data;
        return this;
    }

    async send() {
        const channel = this.getChannel();

        if (channel) {
            const { embed, numberCase } = await this.getMessage();
            const message = await channel.send({ embed }).catch(err => this.client.emit("log", err, "error"));

            return this.guild.settings.moderation.pushCase({
                moderator: this.moderator ? { id: this.moderator.id, tag: this.moderator.tag } : null,
                user: this.user ? { id: this.user.id, tag: this.user.tag } : null,
                type: this.type,
                case: numberCase,
                reason: this.reason,
                message: message ? message.id : null,
                extraData: this.extraData,
            });
        }

        return false;
    }

    async getMessage() {
        const numberCase = await this.guild.settings.moderation.getAmountCases();
        const description = this.getDescription(numberCase);
        return { embed: this.getEmbed(description, numberCase), description, numberCase };
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
        const embed = new this.client.methods.Embed()
            .setColor(colour[this.type])
            .setAuthor(moderator.tag, moderator.displayAvatarURL({ size: 128 }))
            .setDescription(description)
            .setFooter(`${AUTO ? "AUTO | " : ""}Case ${numberCase}`, this.client.user.displayAvatarURL({ size: 128 }))
            .setTimestamp();
        return embed;
    }

    getDescription(numberCase) {
        return [
            `❯ **Action:** ${toTitleCase(this.type)}`,
            `❯ **User:** ${this.user.tag} (${this.user.id})`,
            `❯ **Reason:** ${this.reason || `Please use \`${this.guild.settings.prefix}reason ${numberCase} to claim.\``}`,
        ].join("\n");
    }

    getChannel() {
        return this.guild.settings.channels.mod ? this.guild.channels.get(this.guild.settings.channels.mod) : false;
    }
}

module.exports = ModerationLog;
