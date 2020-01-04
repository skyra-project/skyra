import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { getColor } from '@util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['support-server', 'server'],
			description: language => language.tget('COMMAND_SUPPORT_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SUPPORT_EXTENDED'),
			guarded: true
		});

	}

	public run(message: KlasaMessage) {
		return message.sendEmbed(new MessageEmbed()
			.setTitle(message.language.tget('COMMAND_SUPPORT_EMBED_TITLE', message.author.username))
			.setDescription(message.language.tget('COMMAND_SUPPORT_EMBED_DESCRIPTION'))
			.setColor(getColor(message)));
	}

}
