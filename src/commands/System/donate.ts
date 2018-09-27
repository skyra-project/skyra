const { Command } = require('klasa');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_DONATE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DONATE_EXTENDED'),
			guarded: true
		});
	}

	public async run(msg: SkyraMessage) {
		return msg.author.send(msg.language.get('COMMAND_DONATE_EXTENDED'))
			.then(() => { if (msg.channel.type !== 'dm') msg.alert(msg.language.get('COMMAND_DM_SENT')); })
			.catch(() => { if (msg.channel.type !== 'dm') msg.alert(msg.language.get('COMMAND_DM_NOT_SENT')); });
	}

}
