import { Command, MessageEmbed, util : { fetch }; } from; '../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['chucknorris'],
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 10,
			description: (language) => language.get('COMMAND_NORRIS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_NORRIS_EXTENDED')
		});
		this.spam = true;
	}

	public async run(msg) {
		const data = await fetch('https://api.chucknorris.io/jokes/random', 'json');
		return msg.sendEmbed(new MessageEmbed()
			.setColor(0x80D8FF)
			.setTitle(msg.language.get('COMMAND_NORRIS_OUTPUT'))
			.setURL(data.url)
			.setThumbnail(data.icon_url)
			.setDescription(data.value));
	}

}
