import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['chucknorris'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Fun.NorrisDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.NorrisExtended),
	requiredPermissions: ['EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const data = await fetch<NorrisResultOk>('https://api.chucknorris.io/jokes/random', FetchResultTypes.JSON);
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(message.language.get(LanguageKeys.Commands.Fun.NorrisOutput))
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
