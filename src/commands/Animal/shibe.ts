import { Command, MessageEmbed, util : { fetch }; } from; '../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			cooldown: 10,
			requiredPermissions: ['EMBED_LINKS'],
			description: (language) => language.get('COMMAND_SHIBE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SHIBE_EXTENDED')
		});
		this.spam = true;
	}

	public async run(msg) {
		const urls = await fetch('http://shibe.online/api/shibes?count=1', 'json');
		return msg.sendEmbed(new MessageEmbed()
			.setColor(0xFFE0B2)
			.setImage(urls[0]));
	}

}
