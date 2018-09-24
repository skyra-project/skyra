const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['nickname'],
			requiredPermissions: ['CHANGE_NICKNAME'],
			cooldown: 30,
			description: (language) => language.get('COMMAND_NICK_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_NICK_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '[nick:string{,32}]'
		});
	}

	async run(msg, [nick = '']) {
		await msg.guild.me.setNickname(nick);
		return msg.alert(msg.language.get(...nick.length > 0 ? ['COMMAND_NICK_SET', nick] : ['COMMAND_NICK_CLEARED']));
	}

};
