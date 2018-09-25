const { Command } = require('../../index');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
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

	public async run(msg, [nick = '']) {
		await msg.guild.me.setNickname(nick);
		return msg.alert(msg.language.get(...nick.length > 0 ? ['COMMAND_NICK_SET', nick] : ['COMMAND_NICK_CLEARED']));
	}

}
