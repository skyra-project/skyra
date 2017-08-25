const { Inhibitor } = require('../index');

const cooldowns = new Set();

module.exports = class extends Inhibitor {

    constructor(...args) {
        super(...args, { spamProtection: true });
    }

    async run(msg, cmd, settings) {
        if (msg.author.id === this.client.config.ownerID || cmd.spam !== true) return;
        if (settings.channels.spam === msg.channel.id) return;

        if (cooldowns.has(msg.guild.id)) throw true;

        const channel = msg.guild.channels.get(settings.channels.spam);
        if (!channel) {
            await settings.update({ channels: { spam: null } });
            return;
        }

        cooldowns.add(msg.guild.id);
        setTimeout(() => cooldowns.delete(msg.guild.id), 30000);

        throw msg.language.get('INHIBITOR_SPAM', channel);
    }

};
