const { Command, MessageEmbed } = require('../../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 5,
			description: 'Manage the Anti-RAID system.',
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<list|clear|cool>'
		});
	}

	async run(msg, [type]) {
		if (!msg.guild.configs.selfmod.raid) throw msg.language.get('COMMAND_RAID_DISABLED');
		if (!msg.guild.me.permissions.has('KICK_MEMBERS')) throw msg.language.get('COMMAND_RAID_MISSING_KICK');

		return this[type](msg);
	}

	list(msg) {
		const { raid } = msg.guild.security;
		const embed = new MessageEmbed()
			.setTitle(msg.language.get('COMMAND_RAID_LIST'))
			.setDescription([...raid.keys()].map(user => `<@${user}>`))
			.setFooter(`${raid.size}/${msg.guild.configs.selfmod.raidthreshold} ${msg.language.get('CONST_USERS')}`)
			.setTimestamp();

		return msg.sendMessage({ embed });
	}

	clear(msg) {
		msg.guild.security.raid.clear();
		return msg.sendLocale('COMMAND_RAID_CLEAR');
	}

	cool(msg) {
		msg.guild.security.raid.stop();
		return msg.sendLocale('COMMAND_RAID_COOL');
	}

};
