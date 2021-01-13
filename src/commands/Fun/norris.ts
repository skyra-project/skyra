import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['chucknorris'],
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.NorrisDescription,
	extendedHelp: LanguageKeys.Commands.Fun.NorrisExtended,
	requiredPermissions: ['EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {
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
