import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['chucknorris'],
	description: LanguageKeys.Commands.Fun.NorrisDescription,
	detailedDescription: LanguageKeys.Commands.Fun.NorrisExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const data = await fetch<NorrisResultOk>('https://api.chucknorris.io/jokes/random', FetchResultTypes.JSON);

		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setTitle(args.t(LanguageKeys.Commands.Fun.NorrisOutput))
			.setURL(data.url)
			.setThumbnail(data.icon_url)
			.setDescription(data.value);
		return send(message, { embeds: [embed] });
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
