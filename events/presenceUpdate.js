const { Event } = require('../index');

module.exports = class extends Event {

    async run(oldMember, newMember) {
        if (this.client.ready !== true || newMember.guild.available !== true) return null;

        const wasStreaming = oldMember.presence.activity !== null && oldMember.presence.activity.type === 'STREAMING';
        const isStreaming = newMember.presence.activity !== null && newMember.presence.activity.type === 'STREAMING';

        let action;
        if (wasStreaming && isStreaming === false) action = 'STOP';
        else if (wasStreaming === false && isStreaming) action = 'START';
        else return null;

        let settings = newMember.guild.settings;
        if (settings instanceof Promise) settings = await settings;

        if (settings.channels.stream !== null) return this.sendLog(newMember, action, settings);

        return null;
    }

    async sendLog(member, action, settings) {
        const channel = member.guild.channels.get(settings.channels.stream);
        if (!channel || channel.postable !== true) return settings.update({ channels: { stream: null } });

        return channel.send(member.guild.language.get(action === 'START' ? 'EVENTS_STREAM_START' : 'EVENTS_STREAM_STOP', member));
    }

};
