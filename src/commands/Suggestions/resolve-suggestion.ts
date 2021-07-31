import { GuildSettings, readSettings, SuggestionEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import type { SuggestionData } from '#lib/types/definitions/Suggestion';
import { PermissionLevels } from '#lib/types/Enums';
import { resolveOnErrorCodes } from '#utils/common';
import { isAdmin } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, container } from '@sapphire/framework';
import { send } from '@skyra/editable-commands';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { MessageEmbed, TextChannel } from 'discord.js';

const enum SuggestionsColors {
	Accepted = 0x4cb02c,
	Considered = 0xcfa08d,
	Denied = 0xf90505
}

type Actions = 'accept' | 'a' | 'deny' | 'd' | 'consider' | 'c';
const kActions: readonly Actions[] = ['accept', 'a', 'deny', 'd', 'consider', 'c'];

const minimum = 1;
const maximum = 2_147_483_647; // Maximum value for int32

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['resu'],
	description: LanguageKeys.Commands.Suggestions.ResolveSuggestionDescription,
	extendedHelp: LanguageKeys.Commands.Suggestions.ResolveSuggestionExtended,
	flags: ['show-author', 'showAuthor', 'hide-author', 'hideAuthor'],
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: ['EMBED_LINKS'],
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const suggestionData = await args.pick(UserCommand.suggestion);
		const action = await args.pick(UserCommand.action);
		const comment = args.finished ? args.t(LanguageKeys.Commands.Suggestions.ResolveSuggestionDefaultComment) : await args.rest('string');

		const [shouldDM, shouldHideAuthor, shouldRePostSuggestion] = await readSettings(message.guild, [
			GuildSettings.Suggestions.OnAction.DM,
			GuildSettings.Suggestions.OnAction.HideAuthor,
			GuildSettings.Suggestions.OnAction.RePostMessage
		]);

		const suggestionEmbed = new MessageEmbed(suggestionData.message.embeds[0]);
		if (suggestionEmbed.fields.length === 25) {
			this.error(LanguageKeys.Commands.Suggestions.ResolveSuggestionTooManyFields);
		}

		let responseContent: string;

		const author = await this.getAuthor(message, shouldHideAuthor, args);

		const actions = args.t(LanguageKeys.Commands.Suggestions.ResolveSuggestionActions, { author });
		const DMActions = args.t(LanguageKeys.Commands.Suggestions.ResolveSuggestionActionsDms, { author, guild: message.guild.name });

		switch (action) {
			case 'a':
			case 'accept':
				responseContent = DMActions.accept;
				suggestionEmbed.setColor(SuggestionsColors.Accepted).addField(actions.accept, comment);
				break;
			case 'c':
			case 'consider':
				responseContent = DMActions.consider;
				suggestionEmbed.setColor(SuggestionsColors.Considered).addField(actions.consider, comment);
				break;
			case 'd':
			case 'deny':
				responseContent = DMActions.deny;
				suggestionEmbed.setColor(SuggestionsColors.Denied).addField(actions.deny, comment);
				break;
		}

		const embedMaximum = 6000;
		const embedLength = suggestionEmbed.length;
		if (embedLength >= embedMaximum) {
			this.error(LanguageKeys.Commands.Suggestions.ResolveSuggestionTooManyCharacters, { maximum: embedMaximum, amount: embedLength });
		}

		if (shouldDM && responseContent !== null) {
			try {
				await suggestionData.author!.send({ content: responseContent, embeds: [suggestionEmbed] });
			} catch {
				const content = args.t(LanguageKeys.Commands.Suggestions.ResolveSuggestionDmFail);
				await send(message, content);
			}
		}

		if (shouldRePostSuggestion) {
			await send(suggestionData.message, { content: responseContent, embeds: [suggestionEmbed] });
		} else if (suggestionData.message.author.id === process.env.CLIENT_ID) {
			await suggestionData.message.edit({ embeds: [suggestionEmbed] });
		}

		const actionText =
			action === 'a' || action === 'accept'
				? args.t(LanguageKeys.Commands.Suggestions.ResolveSuggestionSuccessAcceptedText)
				: action === 'd' || action === 'deny'
				? args.t(LanguageKeys.Commands.Suggestions.ResolveSuggestionSuccessDeniedText)
				: args.t(LanguageKeys.Commands.Suggestions.ResolveSuggestionSuccessConsideredText);

		const content = args.t(LanguageKeys.Commands.Suggestions.ResolveSuggestionSuccess, { id: suggestionData.id, actionText });
		return send(message, content);
	}

	private async getAuthor(message: GuildMessage, hideAuthor: boolean, args: SkyraCommand.Args) {
		if (args.getFlags('show-author', 'showAuthor')) return message.author.tag;
		if (args.getFlags('hide-author', 'hideAuthor') || hideAuthor) {
			return (await isAdmin(message.member))
				? args.t(LanguageKeys.Commands.Suggestions.ResolveSuggestionAuthorAdmin)
				: args.t(LanguageKeys.Commands.Suggestions.ResolveSuggestionAuthorModerator);
		}
		return message.author.tag;
	}

	private static suggestion = Args.make<SuggestionData>(async (parameter, { args, argument, message }) => {
		// Validate the suggestions channel ID
		const channelId = await readSettings(message.guild!, GuildSettings.Suggestions.Channel);
		if (!channelId) {
			return Args.error({
				argument,
				parameter,
				identifier: LanguageKeys.Commands.Suggestions.SuggestNoSetup,
				context: { username: message.author.username }
			});
		}

		let suggestionData: SuggestionEntity | undefined;
		if (args.t(LanguageKeys.Arguments.CaseLatestOptions).includes(parameter.toLowerCase())) {
			// Retrieve latest entry
			const { suggestions } = container.db;
			suggestionData = await suggestions.findOne({ order: { id: 'DESC' }, where: { guildId: message.guild!.id } });
		} else {
			// Validate the suggestion number
			const id = Number(parameter);
			if (!Number.isInteger(id) || id < minimum || id > maximum) {
				return Args.error({
					argument,
					parameter,
					identifier: LanguageKeys.Commands.Suggestions.ResolveSuggestionInvalidId,
					context: { minimum, maximum }
				});
			}

			// Retrieve the suggestion data
			const { suggestions } = container.db;
			suggestionData = await suggestions.findOne({ id, guildId: message.guild!.id });
		}

		if (!suggestionData) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Suggestions.ResolveSuggestionIdNotFound });
		}

		const channel = message.client.channels.cache.get(channelId) as TextChannel;
		const suggestionMessage = await resolveOnErrorCodes(channel.messages.fetch(suggestionData.messageId), RESTJSONErrorCodes.UnknownMessage);
		if (suggestionMessage === null) {
			await suggestionData.remove();
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Suggestions.ResolveSuggestionMessageNotFound });
		}

		const suggestionAuthor = await message.client.users.fetch(suggestionData.authorId).catch(() => null);
		return Args.ok({ message: suggestionMessage, author: suggestionAuthor, id: suggestionData.id });
	});

	private static action = Args.make<Actions>(async (parameter, { argument }) => {
		const lowerCase = parameter.toLowerCase() as Actions;
		if (kActions.includes(lowerCase)) return Args.ok(lowerCase);
		return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Suggestions.ResolveSuggestionInvalidAction });
	});
}
