import { DbSet } from '#lib/database';
import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { getContent, getImage } from '#utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { CommandStore } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['sniped'],
			description: LanguageKeys.Commands.Misc.SnipeDescription,
			extendedHelp: LanguageKeys.Commands.Misc.SnipeExtended,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text']
		});
	}

	public async run(message: GuildMessage) {
		const { sniped } = message.channel as TextChannel;
		if (sniped === null) throw await message.resolveKey(LanguageKeys.Commands.Misc.SnipeEmpty);

		const embed = new MessageEmbed()
			.setTitle(await message.resolveKey(LanguageKeys.Commands.Misc.SnipeTitle))
			.setColor(await DbSet.fetchColor(sniped))
			.setAuthor(sniped.author.username, sniped.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp(sniped.createdTimestamp);

		const content = getContent(sniped);
		if (content !== null) embed.setDescription(content);
		const image = getImage(sniped);
		if (image !== null) embed.setImage(image);

		return message.send(embed);
	}
}
