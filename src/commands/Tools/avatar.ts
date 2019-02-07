import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			cooldown: 15,
			description: (language) => language.get('COMMAND_AVATAR_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_AVATAR_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '(user:username)'
		});

		this.createCustomResolver('username', (arg, possible, msg) =>
			arg ? this.client.arguments.get('username').run(arg, possible, msg) : msg.author);
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		if (!user.avatar) throw message.language.get('COMMAND_AVATAR_NONE');
		return message.sendEmbed(new MessageEmbed()
			.setAuthor(user.tag, user.avatarURL({ size: 128 }))
			.setColor(message.member.displayColor || 0xDFDFDF)
			.setImage(user.avatarURL({ size: 2048 })));
	}

}
