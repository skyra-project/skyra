import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { BrandingColors } from '#utils/constants';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed, TextChannel, User } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Suggestions.SuggestDescription,
	extendedHelp: LanguageKeys.Commands.Suggestions.SuggestExtended,
	permissions: ['EMBED_LINKS'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const suggestionsChannelID = await message.guild.readSettings(GuildSettings.Suggestions.Channel);

		const suggestionsChannel = this.context.client.channels.cache.get(suggestionsChannelID ?? '') as TextChannel | undefined;
		if (!suggestionsChannel) {
			this.error(LanguageKeys.Commands.Suggestions.SuggestNoSetup, { username: message.author.username });
		}

		if (!suggestionsChannel.postable) {
			this.error(LanguageKeys.Commands.Suggestions.SuggestNoPermissions, {
				username: message.author.username,
				channel: message.channel.toString()
			});
		}

		const { author, content, image } = await this.resolveArguments(args);
		const [[upvoteEmoji, downvoteEmoji], [suggestions, currentSuggestionId]] = await Promise.all([
			message.guild.readSettings([GuildSettings.Suggestions.VotingEmojis.UpvoteEmoji, GuildSettings.Suggestions.VotingEmojis.DownvoteEmoji]),
			this.getCurrentSuggestionID(message.guild.id)
		]);

		// Post the suggestion
		const embed = new MessageEmbed()
			.setColor(BrandingColors.Primary)
			.setAuthor(`${author.tag} (${author.id})`, author.displayAvatarURL({ format: 'png', size: 128, dynamic: true }))
			.setTitle(args.t(LanguageKeys.Commands.Suggestions.SuggestTitle, { id: currentSuggestionId + 1 }))
			.setDescription(content);
		if (image !== null) embed.setImage(image);

		const suggestionsMessage = await (suggestionsChannel as TextChannel).send(embed);

		// Commit the suggestion to the DB
		await suggestions.insert({
			id: currentSuggestionId + 1,
			authorID: author.id,
			guildID: message.guild.id,
			messageID: suggestionsMessage.id
		});

		// Add the upvote/downvote reactions
		for (const emoji of [upvoteEmoji, downvoteEmoji]) {
			await suggestionsMessage.react(emoji);
		}

		return message.send(
			args.t(LanguageKeys.Commands.Suggestions.SuggestSuccess, {
				channel: suggestionsChannel.toString()
			})
		);
	}

	private async resolveArguments(args: SkyraCommand.Args): Promise<ResolvedArguments> {
		try {
			const message = await args.pick('message');
			return { author: message.author, content: message.content, image: getImage(message) };
		} catch {
			const suggestion = await args.rest('string');
			return { author: args.message.author, content: suggestion, image: getImage(args.message) };
		}
	}

	private async getCurrentSuggestionID(guildID: string) {
		const { suggestions } = this.context.db;

		// Retrieve the ID for the latest suggestion
		const [{ max }] = (await suggestions.query(
			/* sql */ `
			SELECT max(id)
			FROM suggestion
			WHERE guild_id = $1
		`,
			[guildID]
		)) as [MaxQuery];

		return [suggestions, max ?? 0] as const;
	}
}

interface MaxQuery {
	max: number | null;
}

interface ResolvedArguments {
	author: User;
	content: string;
	image: string | null;
}
