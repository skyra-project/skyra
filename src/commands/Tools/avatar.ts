import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { getColor, getDisplayAvatar } from '@utils/util';
import { MessageEmbed, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['a', 'av', 'ava'],
			cooldown: 15,
			description: language => language.tget('COMMAND_AVATAR_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_AVATAR_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '(user:member)'
		});

		this.createCustomResolver('member', (arg, possible, msg) =>
			arg ? this.client.arguments.get('membername')!.run(arg, possible, msg) : msg.author);
	}

	public async run(message: KlasaMessage, [member]: [GuildMember]) {
		if (!member.user.avatar) throw message.language.tget('COMMAND_AVATAR_NONE');

		return message.sendEmbed(new MessageEmbed()
			.setAuthor(member.user.tag, getDisplayAvatar(member.id, member.user, { size: 128 }))
			.setColor(getColor(message))
			.setImage(getDisplayAvatar(member.id, member.user, { size: 2048 })));
	}

}
