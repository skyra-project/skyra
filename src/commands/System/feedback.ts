import { Command, MessageEmbed } from '../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
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

	public async run(msg, [feedback]) {
		const embed = new MessageEmbed()
			.setColor(0x06d310)
			.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL({ size: 128 }))
			.setDescription(feedback)
			.setFooter(`${msg.author.id} | Feedback`)
			.setTimestamp();

		if (msg.deletable) msg.nuke().catch(() => null);

		await this.channel.send({ embed });
		return msg.alert(msg.language.get('COMMAND_FEEDBACK'));
	}

	public init() {
		this.channel = this.client.channels.get('257561807500214273');
	}

}
