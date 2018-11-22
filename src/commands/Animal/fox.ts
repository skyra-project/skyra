import { Command, util : { fetch }, MessageEmbed; } from; '../../index';
const url = new URL('https://randomfox.ca/floof');

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_FOX_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_FOX_EXTENDED')
		});
		this.spam = true;
	}

	public async run(msg) {
		const { image, link } = await fetch(url, 'json');
		return msg.sendEmbed(new MessageEmbed()
			.setAuthor(msg.author.username, msg.author.displayAvatarURL({ size: 64 }))
			.setImage(image)
			.setURL(link)
			.setTimestamp());
	}

}
