import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { BrandingColors } from '../../lib/util/constants';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['supportserver', 'server'],
			description: language => language.tget('COMMAND_SUPPORT_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SUPPORT_EXTENDED_HELP'),
			guarded: true,
			permissionLevel: 0
		});

	}

	public run(message: KlasaMessage) {
		const embed = new MessageEmbed()
		// TODO: LANGUAGE SUPPORT YOU IDIOT
			.setTitle(message.language.tget('COMMAND_SUPPORT_EMBED_TITLE', message.author.username))
			.setDescription(message.language.tget('COMMAND_SUPPORT_EMBED_DESCRIPTION'))
			.setColor(BrandingColors.Primary);
		return message.send(embed);
	}

}
