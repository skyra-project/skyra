const { Command } = require('../../index');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 60,
			description: (language) => language.get('COMMAND_ESCAPEROPE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_ESCAPEROPE_EXTENDED')
		});
	}

	public async run(msg: SkyraMessage) {
		if (msg.deletable) msg.nuke().catch(() => null);
		return msg.sendLocale('COMMAND_ESCAPEROPE_OUTPUT', [msg.author]);
	}

}
