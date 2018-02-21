const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['nickname'],
			botPerms: ['CHANGE_NICKNAME'],
			cooldown: 30,
			description: (msg) => msg.language.get('COMMAND_NICK_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_NICK_EXTENDED'),
			permLevel: 3,
			runIn: ['text'],
			usage: '[nick:string{,32}]'
		});
	}

	async run(msg, [nick = '']) {
		await msg.guild.me.setNickname(nick).catch(Command.handleError);
		return msg.alert(msg.language.get(nick.length > 0 ? 'COMMAND_NICK_SET' : 'COMMAND_NICK_CLEARED'));
	}

};
