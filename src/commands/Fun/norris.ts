import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['chucknorris'],
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.NorrisDescription,
	extendedHelp: LanguageKeys.Commands.Fun.NorrisExtended,
	permissions: ['EMBED_LINKS'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message) {
		const t = await message.fetchT();
		const data = await fetch<NorrisResultOk>('https://api.chucknorris.io/jokes/random', FetchResultTypes.JSON);
		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(t(LanguageKeys.Commands.Fun.NorrisOutput))
				.setURL(data.url)
				.setThumbnail(data.icon_url)
				.setDescription(data.value)
		);
	}
}

export interface NorrisResultOk {
	categories: string[];
	created_at: Date;
	icon_url: string;
	id: string;
	updated_at: Date;
	url: string;
	value: string;
}
