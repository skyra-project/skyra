import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/commands/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { BrandingColors } from '#utils/constants';
import { pickRandom } from '#utils/util';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['emojis'],
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.EmotesDescription,
	extendedHelp: LanguageKeys.Commands.Tools.EmotesExtended,
	runIn: ['text']
})
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const animEmotes: string[] = [];
		const staticEmotes: string[] = [];

		for (const [id, emote] of [...message.guild.emojis.cache.entries()]) {
			if (emote.animated) animEmotes.push(`<a:${emote.name}:${id}>`);
			else staticEmotes.push(`<:${emote.name}:${id}>`);
		}

		const display = await this.buildDisplay(message, t, chunk(animEmotes, 50), chunk(staticEmotes, 50));

		await display.start(response, message.author.id);
		return response;
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, animatedEmojis: string[][], staticEmojis: string[][]) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(
					[`${message.guild.emojis.cache.size}`, `${t(LanguageKeys.Commands.Tools.EmotesTitle)}`, `${message.guild.name}`].join(' '),
					message.guild.iconURL({ format: 'png' })!
				)
		);

		for (const chunk of staticEmojis) {
			display.addPage((embed: MessageEmbed) => embed.setDescription(chunk.join(' ')));
		}

		for (const chunk of animatedEmojis) {
			display.addPage((embed: MessageEmbed) => embed.setDescription(chunk.join(' ')));
		}

		return display;
	}
}
