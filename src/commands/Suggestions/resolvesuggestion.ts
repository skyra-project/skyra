import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import type { SuggestionData } from '@lib/types/definitions/Suggestion';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { CLIENT_ID } from '@root/config';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { APIErrors } from '@utils/constants';
import { resolveOnErrorCodes } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import type { KlasaMessage } from 'klasa';

const enum SuggestionsColors {
	Accepted = 0x4cb02c,
	Considered = 0xcfa08d,
	Denied = 0xf90505
}

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['resu'],
	cooldown: 10,
	description: (language) => language.get('commandResolveSuggestionDescription'),
	extendedHelp: (language) => language.get('commandResolveSuggestionExtended'),
	flagSupport: true,
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<suggestion:suggestion> <accept|a|deny|d|consider|c> [comment:comment]',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'suggestion',
		async (arg, _, message): Promise<SuggestionData> => {
			// Validate the suggestions channel ID
			const channelID = message.guild!.settings.get(GuildSettings.Suggestions.SuggestionsChannel);
			if (!channelID) throw message.language.get('commandSuggestNoSetup', { username: message.author.username });

			// Validate the suggestion number
			const id = Number(arg);
			if (!Number.isInteger(id) || id < 1) throw message.language.get('commandResolveSuggestionInvalidId');

			// Retrieve the suggestion data
			const { suggestions } = await DbSet.connect();
			const suggestionData = await suggestions.findOne({ id, guildID: message.guild!.id });
			if (!suggestionData) throw message.language.get('commandResolveSuggestionIdNotFound');

			const channel = message.client.channels.cache.get(channelID) as TextChannel;
			const suggestionMessage = await resolveOnErrorCodes(channel.messages.fetch(suggestionData.messageID), APIErrors.UnknownMessage);
			if (suggestionMessage === null) {
				await suggestionData.remove();
				throw message.language.get('commandResolveSuggestionMessageNotFound');
			}

			const suggestionAuthor = await message.client.users.fetch(suggestionData.authorID).catch(() => null);
			return {
				message: suggestionMessage,
				author: suggestionAuthor,
				id
			};
		}
	],
	[
		'comment',
		(arg, possible, message) => {
			if (typeof arg === 'undefined') return message.language.get('commandResolveSuggestionDefaultComment');
			return message.client.arguments.get('...string')!.run(arg, possible, message);
		}
	]
])
export default class extends SkyraCommand {
	public async run(
		message: KlasaMessage,
		[suggestionData, action, comment]: [SuggestionData, 'accept' | 'a' | 'deny' | 'd' | 'consider' | 'c', string | undefined]
	) {
		const [shouldDM, shouldHideAuthor, shouldRepostSuggestion] = [
			message.guild!.settings.get(GuildSettings.Suggestions.OnAction.DM),
			message.guild!.settings.get(GuildSettings.Suggestions.OnAction.HideAuthor),
			message.guild!.settings.get(GuildSettings.Suggestions.OnAction.RepostMessage)
		];
		const [suggestion] = suggestionData.message.embeds;

		let newEmbed = new MessageEmbed();
		let messageContent = '';

		const author = await this.getAuthor(message, shouldHideAuthor);
		const actions = message.language.get('commandResolveSuggestionActions', { author });
		const DMActions = message.language.get('commandResolveSuggestionActionsDms', { author, guild: message.guild!.name });

		switch (action) {
			case 'a':
			case 'accept':
				messageContent = DMActions.accept;
				newEmbed = suggestion.setColor(SuggestionsColors.Accepted).addField(actions.accept, comment);
				break;
			case 'c':
			case 'consider':
				messageContent = DMActions.consider;
				newEmbed = suggestion.setColor(SuggestionsColors.Considered).addField(actions.consider, comment);
				break;
			case 'd':
			case 'deny':
				messageContent = DMActions.deny;
				newEmbed = suggestion.setColor(SuggestionsColors.Denied).addField(actions.deny, comment);
				break;
		}

		if (shouldDM && messageContent !== null) {
			try {
				await suggestionData.author!.send(messageContent, { embed: newEmbed });
			} catch {
				await message.channel.sendLocale('commandResolveSuggestionDmFail');
			}
		}

		if (shouldRepostSuggestion) {
			await suggestionData.message.channel.send(messageContent, { embed: newEmbed });
		} else if (suggestionData.message.author.id === CLIENT_ID) await suggestionData.message.edit(newEmbed);

		return message.sendLocale('commandResolveSuggestionSuccess', [{ id: suggestionData.id, action }]);
	}

	public async inhibit(message: KlasaMessage) {
		// If the message that triggered this is not this command (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return true;

		const channelID = message.guild.settings.get(GuildSettings.Suggestions.SuggestionsChannel);
		if (channelID !== null) return false;
		await message.sendLocale('commandSuggestNoSetup', [{ username: message.author.username }]);
		return true;
	}

	private async getAuthor(message: KlasaMessage, hideAuthor: boolean) {
		if (Reflect.has(message.flagArgs, 'show-author') || Reflect.has(message.flagArgs, 'showAuthor')) return message.author.tag;
		if (Reflect.has(message.flagArgs, 'hide-author') || Reflect.has(message.flagArgs, 'hideAuthor') || hideAuthor) {
			return (await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator))
				? message.language.get('commandResolveSuggestionAuthorAdmin')
				: message.language.get('commandResolveSuggestionAuthorModerator');
		}
		return message.author.tag;
	}
}
