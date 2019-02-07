import { MessageEmbed, TextChannel } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	private channel: TextChannel = null;

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['suggest'],
			bucket: 2,
			cooldown: 20,
			description: (language) => language.get('COMMAND_FEEDBACK_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_FEEDBACK_EXTENDED'),
			guarded: true,
			usage: '<message:string{8,1900}>'
		});

		this.channel = null;
	}

	public async run(message: KlasaMessage, [feedback]: [string]) {
		const embed = new MessageEmbed()
			.setColor(0x06D310)
			.setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ size: 128 }))
			.setDescription(feedback)
			.setFooter(`${message.author.id} | Feedback`)
			.setTimestamp();

		if (message.deletable) message.nuke().catch(() => null);

		await this.channel.send({ embed });
		return message.alert(message.language.get('COMMAND_FEEDBACK'));
	}

	public async init() {
		this.channel = this.client.channels.get('257561807500214273') as TextChannel;
	}

}
