const { Monitor } = require('../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			ignoreBots: false
		});
	}

	async run(msg, settings, i18n) {
		if (settings.filter.level === 0
												|| settings.filter.regexp === null
												|| await msg.hasLevel(1)
												|| !settings.filter.regexp.test(msg.content)) return false;

		if (msg.deletable) await msg.nuke().catch(() => null);
		if (settings.filter.level === 1 || settings.filter.level === 3) {
			msg.send(i18n.get('MONITOR_WORDFILTER', msg.author)).catch(() => null);
		}

		if (settings.filter.level !== 2 && settings.filter.level !== 3) return true;

		const modLogChannelID = settings.channels.modlog;
		if (!modLogChannelID) return true;

		const channel = msg.guild.channels.get(modLogChannelID);
		if (!channel) return settings.update({ channels: { mod: null } });

		const embed = new MessageEmbed()
			.setColor(0xefae45)
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
			.setFooter(`#${msg.channel.name} | ${i18n.get('CONST_MONITOR_WORDFILTER')} ${settings.filter.regexp.exec(msg.content)[0]}`)
			.setTimestamp();

		return channel.send({ embed });
	}

};
