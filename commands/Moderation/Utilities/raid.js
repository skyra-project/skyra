const { structures: { Command }, management: { AntiRaid } } = require('../../../index');

const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			botPerms: ['EMBED_LINKS'],
			permLevel: 3,
			mode: 2,

			cooldown: 5,

			usage: '<list|clear|cool>',
			description: 'Manage the Anti-RAID system.'
		});
	}

	async run(msg, [type], settings, i18n) {
		if (settings.selfmod.raid !== true) throw i18n.get('COMMAND_RAID_DISABLED');
		if (msg.guild.me.permissions.has('KICK_MEMBERS') !== true) throw i18n.get('COMMAND_RAID_MISSING_KICK');

		const data = AntiRaid.get(msg.guild, settings);

		return this[type](msg, data, settings, i18n);
	}

	list(msg, data, settings, i18n) {
		const embed = new MessageEmbed()
			.setTitle(i18n.get('COMMAND_RAID_LIST'))
			.setDescription(Array.from(data.users.keys()).map(user => `<@${user}>`))
			.setFooter(`${data.users.size}/${settings.selfmod.raidthreshold} ${i18n.get('CONST_USERS')}`)
			.setTimestamp();

		return msg.send({ embed });
	}

	clear(msg, data, settings, i18n) {
		data.prune();
		return msg.send(i18n.get('COMMAND_RAID_CLEAR'));
	}

	cool(msg, data, settings, i18n) {
		data.prune().cool();
		return msg.send(i18n.get('COMMAND_RAID_COOL'));
	}

};
