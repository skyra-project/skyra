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
	description: (language) => language.tget('COMMAND_RESOLVESUGGESTION_DESCRIPTION'),
	extendedHelp: (language) => language.tget('COMMAND_RESOLVESUGGESTION_EXTENDED'),
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
			if (!channelID) throw message.language.tget('COMMAND_SUGGEST_NOSETUP', message.author.username);

			// Validate the suggestion number
			const id = Number(arg);
			if (!Number.isInteger(id) || id < 1) throw message.language.tget('COMMAND_RESOLVESUGGESTION_INVALID_ID');

			// Retrieve the suggestion data
			const { suggestions } = await DbSet.connect();
			const suggestionData = await suggestions.findOne({ id, guildID: message.guild!.id });
			if (!suggestionData) throw message.language.tget('COMMAND_RESOLVESUGGESTION_ID_NOT_FOUND');

			const channel = message.client.channels.get(channelID) as TextChannel;
			const suggestionMessage = await resolveOnErrorCodes(channel.messages.fetch(suggestionData.messageID), APIErrors.UnknownMessage);
			if (suggestionMessage === null) {
				await suggestionData.remove();
				throw message.language.tget('COMMAND_RESOLVESUGGESTION_MESSAGE_NOT_FOUND');
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
			if (typeof arg === 'undefined') return message.language.tget('COMMAND_RESOLVESUGGESTION_DEFAULT_COMMENT');
			return message.client.arguments.get('...string')!.run(arg, possible, message);
		}
	]
])
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [suggestionData, action, comment]: [SuggestionData, string, string | undefined]) {
		const [shouldDM, shouldHideAuthor, shouldRepostSuggestion] = [
			message.guild!.settings.get(GuildSettings.Suggestions.OnAction.DM),
			message.guild!.settings.get(GuildSettings.Suggestions.OnAction.HideAuthor),
			message.guild!.settings.get(GuildSettings.Suggestions.OnAction.RepostMessage)
		];
		const [suggestion] = suggestionData.message.embeds;

		let newEmbed = new MessageEmbed();
		let messageContent = '';

		const author = await this.getAuthor(message, shouldHideAuthor);
		const actions = message.language.tget('COMMAND_RESOLVESUGGESTION_ACTIONS');
		const DMActions = message.language.tget('COMMAND_RESOLVESUGGESTION_ACTIONS_DMS');

		switch (action) {
			case 'a':
			case 'accept':
				messageContent = DMActions.ACCEPT(author, message.guild!.name);
				newEmbed = suggestion.setColor(SuggestionsColors.Accepted).addField(actions.ACCEPT(author), comment);
				break;
			case 'c':
			case 'consider':
				messageContent = DMActions.CONSIDER(author, message.guild!.name);
				newEmbed = suggestion.setColor(SuggestionsColors.Considered).addField(actions.CONSIDER(author), comment);
				break;
			case 'd':
			case 'deny':
				messageContent = DMActions.DENY(author, message.guild!.name);
				newEmbed = suggestion.setColor(SuggestionsColors.Denied).addField(actions.DENY(author), comment);
				break;
		}

		if (shouldDM && messageContent !== null) {
			try {
				await suggestionData.author!.send(messageContent, { embed: newEmbed });
			} catch {
				await message.channel.sendLocale('COMMAND_RESOLVESUGGESTION_DM_FAIL');
			}
		}

		if (shouldRepostSuggestion) {
			await suggestionData.message.channel.send(messageContent, { embed: newEmbed });
		} else if (suggestionData.message.author.id === CLIENT_ID) await suggestionData.message.edit(newEmbed);

		return message.sendLocale('COMMAND_RESOLVESUGGESTION_SUCCESS', [suggestionData.id, action]);
	}

	public async inhibit(message: KlasaMessage) {
		// If the message that triggered this is not this command (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return true;

		const channelID = message.guild.settings.get(GuildSettings.Suggestions.SuggestionsChannel);
		if (channelID !== null) return false;
		await message.sendLocale('COMMAND_SUGGEST_NOSETUP', [message.author.username]);
		return true;
	}

	private async getAuthor(message: KlasaMessage, hideAuthor: boolean) {
		if (Reflect.has(message.flagArgs, 'show-author') || Reflect.has(message.flagArgs, 'showAuthor')) return message.author.tag;
		if (Reflect.has(message.flagArgs, 'hide-author') || Reflect.has(message.flagArgs, 'hideAuthor') || hideAuthor) {
			return (await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator))
				? message.language.tget('COMMAND_RESOLVESUGGESTION_AUTHOR_ADMIN')
				: message.language.tget('COMMAND_RESOLVESUGGESTION_AUTHOR_MODERATOR');
		}
		return message.author.tag;
	}
}
