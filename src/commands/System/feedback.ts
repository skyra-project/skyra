import { MessageEmbed, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	private channel: TextChannel | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['suggest'],
			bucket: 2,
			cooldown: 20,
			description: language => language.tget('COMMAND_FEEDBACK_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_FEEDBACK_EXTENDED'),
			guarded: true,
			usage: '<message:string{8,1900}>'
		});
	}

	public async run(message: KlasaMessage, [feedback]: [string]) {
		const embed = new MessageEmbed()
			.setColor(0x06D310)
			.setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ size: 128 }))
			.setDescription(feedback)
			.setFooter(`${message.author.id} | Feedback`)
			.setTimestamp();

		if (message.deletable) message.nuke().catch(() => null);

		await this.channel!.send({ embed });
		return message.alert(message.language.tget('COMMAND_FEEDBACK'));
	}

	public init() {
		// TODO(kyranet): This should be replaced with a webhook
		this.channel = this.client.channels.get('257561807500214273') as TextChannel;
		return Promise.resolve();
	}

}
