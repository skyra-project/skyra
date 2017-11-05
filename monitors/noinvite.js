const { structures: { Monitor } } = require('../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			ignoreBots: false
		});
	}

	async run(msg, settings, i18n) {
		if (!settings.selfmod.invitelinks
												|| !/(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(msg.content)
												|| await msg.hasLevel(1)) return false;

		if (msg.deletable) {
			await msg.nuke();
			await msg.alert(i18n.get('MONITOR_NOINVITE', msg.author));
		}

		if (!settings.channels.modlog)
			return null;

		const channel = msg.guild.channels.get(settings.channels.modlog);
		if (!channel)
			return settings.update({ channels: { modlog: null } }).then(() => null);

		const embed = new MessageEmbed()
			.setColor(0xefae45)
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
			.setFooter(`#${msg.channel.name} | ${i18n.get('CONST_MONITOR_INVITELINK')}`)
			.setTimestamp();

		return channel.send({ embed });
	}

};
