import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['emojis'],
	description: LanguageKeys.Commands.Tools.EmotesDescription,
	extendedHelp: LanguageKeys.Commands.Tools.EmotesExtended,
	runIn: ['GUILD_ANY']
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const response = await sendLoadingMessage(message, args.t);

		const animEmotes: string[] = [];
		const staticEmotes: string[] = [];

		for (const [id, emote] of [...message.guild.emojis.cache.entries()]) {
			if (emote.animated) animEmotes.push(`<a:${emote.name}:${id}>`);
			else staticEmotes.push(`<:${emote.name}:${id}>`);
		}

		if (animEmotes.length === 0 && staticEmotes.length === 0) {
			this.error(LanguageKeys.Commands.Tools.EmoteNoEmotes);
		}

		const display = await this.buildDisplay(message, args.t, chunk(animEmotes, 50), chunk(staticEmotes, 50));

		await display.run(response, message.author);
		return response;
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, animatedEmojis: string[][], staticEmojis: string[][]) {
		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed()
				.setColor(await this.container.db.fetchColor(message))
				.setAuthor(
					[`${message.guild.emojis.cache.size}`, `${t(LanguageKeys.Commands.Tools.EmotesTitle)}`, `${message.guild.name}`].join(' '),
					message.guild.iconURL({ format: 'png' })!
				)
		});

		for (const chunk of staticEmojis) {
			display.addPageEmbed((embed) => embed.setDescription(chunk.join(' ')));
		}

		for (const chunk of animatedEmojis) {
			display.addPageEmbed((embed) => embed.setDescription(chunk.join(' ')));
		}

		return display;
	}
}
