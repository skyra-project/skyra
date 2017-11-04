const { Event } = require('../index');

module.exports = class extends Event {

	async run(oldMember, newMember) {
		if (this.client.ready !== true || newMember.guild.available !== true) return null;

		const wasStreaming = oldMember.presence.activity !== null && oldMember.presence.activity.type === 'STREAMING';
		const isStreaming = newMember.presence.activity !== null && newMember.presence.activity.type === 'STREAMING';

		let action;
		if (wasStreaming && isStreaming === false)
			action = 'STOP';
		else if (wasStreaming === false && isStreaming)
			action = 'START';
		else
			return null;

		const url = action === 'START' ? newMember.presence.activity.url : oldMember.presence.activity.url;
		if (typeof url !== 'string')
			return null;

		const user = url.split('/').pop();

		const settings = await newMember.guild.settings;

		if (settings.twitch.channel === null
												|| settings.twitch.mode === 0
												|| (action === 'STOP' && settings.twitch.messagestop === null)
												|| (action === 'START' && settings.twitch.messagestart === null))
			return null;

		switch (settings.twitch.mode) {
			case 2:
				if (settings.twitch.list.includes(user))
					return null;
				break;
			case 3:
				if (!settings.twitch.list.includes(user))
					return null;
		}

		return this.sendLog(newMember, action, settings, url);
	}

	async sendLog(member, action, settings, url) {
		const channel = member.guild.channels.get(settings.twitch.channel);
		if (!channel || channel.postable !== true)
			return settings.update({ twitch: { channel: null } });

		let message = '';
		if (action === 'START') {
			if (settings.twitch.messagestart)
				message = this.format(settings.twitch.messagestart, member, url);
			else
				message = member.guild.language.get('EVENTS_STREAM_START', member);
		} else if (settings.twitch.messagestop)
			message = this.format(settings.twitch.messagestop, member, url);
		else
			message = member.guild.language.get('EVENTS_STREAM_STOP', member);

		return channel.send(message);
	}

	format(string, member, url) {
		return string
			.replace(/%URL%/g, url)
			.replace(/%MEMBER%/g, member)
			.replace(/%MEMBERNAME%/g, member.user.username)
			.replace(/%MEMBERTAG%/g, member.user.tag)
			.replace(/%GUILD%/g, member.guild.name)
			.replace(/%TITLE%/g, member.presence.activity ? member.presence.activity.name : '%TITLE%');
	}

};
