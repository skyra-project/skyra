const { Command, MessageEmbed, util: { fetch } } = require('../../index');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['kittenfact'],
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 10,
			description: (language) => language.get('COMMAND_CATFACT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CATFACT_EXTENDED')
		});
		this.spam = true;
	}

	public async run(msg: SkyraMessage) {
		const { fact } = await fetch('https://catfact.ninja/fact', 'json');
		return msg.sendEmbed(new MessageEmbed()
			.setColor(0xFFE0B2)
			.setTitle(msg.language.get('COMMAND_CATFACT_TITLE'))
			.setDescription(fact));
	}

}
