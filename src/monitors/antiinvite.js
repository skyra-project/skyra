const { Monitor, MessageEmbed } = require('../index');

module.exports = class extends Monitor {

	async run(msg) {
		if (!msg.guild
			|| !msg.guild.configs.selfmod.invitelinks
			|| !/(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(msg.content)
			|| await msg.hasAtLeastPermissionLevel(5)) return false;

		if (msg.deletable) {
			await msg.nuke();
			await msg.alert(msg.language.get('MONITOR_NOINVITE', msg.author));
		}

		if (!msg.guild.configs.channels.modlog)
			return null;

		const channel = msg.guild.channels.get(msg.guild.configs.channels.modlog);
		if (!channel)
			return msg.guild.configs.update('channels.modlog').then(() => null);

		return channel.send(new MessageEmbed()
			.setColor(0xefae45)
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
			.setFooter(`#${msg.channel.name} | ${msg.language.get('CONST_MONITOR_INVITELINK')}`)
			.setTimestamp());
	}

	shouldRun(msg) {
		if (!this.enabled || !msg.guild || msg.author.id === this.client.user.id) return false;

		const { invitelinks, ignoreChannels } = msg.guild.configs.selfmod;
		return invitelinks && !ignoreChannels.includes(msg.channel.id);
	}

};
