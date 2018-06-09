const { Monitor, MessageEmbed, klasaUtil: { codeBlock }, util: { cutText } } = require('../index');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false,
			ignoreSelf: true,
			ignoreWebhooks: true
		});
	}

	async run(msg) {
		if (await msg.hasAtLeastPermissionLevel(5)) return false;

		const { filter, channels } = msg.guild.configs;
		const filtered = msg.content.replace(filter.regexp, match => '*'.repeat(match.length));
		if (filtered === msg.content) return false;

		if (msg.deletable) {
			if (filtered.length > 25) msg.author.send(msg.language.get('MONITOR_WORDFILTER_DM', codeBlock('md', cutText(filtered, 1900)))).catch(() => null);
			msg.nuke().catch(() => null);
		}
		if (msg.channel.postable && (filter.level === 1 || filter.level === 3))
			msg.alert(msg.language.get('MONITOR_WORDFILTER', msg.author)).catch(() => null);

		if (filter.level !== 2 && filter.level !== 3) return true;

		const modLogChannelID = channels.modlog;
		if (!modLogChannelID) return true;

		const channel = msg.guild.channels.get(modLogChannelID);
		if (!channel) return msg.guild.configs.reset('channel.modlog');

		return channel.send(new MessageEmbed()
			.splitFields(cutText(filtered.replace(/\*/g, '\\*'), 4000))
			.setColor(0xefae45)
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
			.setFooter(`#${msg.channel.name} | ${msg.language.get('CONST_MONITOR_WORDFILTER')}`)
			.setTimestamp());
	}

	shouldRun(msg) {
		if (!this.enabled || !msg.guild || msg.author.id === this.client.user.id) return false;

		const { selfmod, filter } = msg.guild.configs;
		return filter.level !== 0 && filter.regexp !== null && !selfmod.ignoreChannels.includes(msg.channel.id);
	}

};
