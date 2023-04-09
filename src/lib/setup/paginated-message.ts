import { LanguageKeys } from '#lib/i18n/languageKeys';
import { userMention } from '@discordjs/builders';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import i18n from 'i18next';

PaginatedMessage.selectMenuOptions = async (pageIndex, internationalizationContext) => {
	const languageForContext = await container.i18n.fetchLanguage(internationalizationContext);

	return { label: `${i18n.t(LanguageKeys.Globals.PaginatedMessagePage, { lng: languageForContext ?? 'en-US' })} ${pageIndex}` };
};

PaginatedMessage.wrongUserInteractionReply = async (targetUser, _, internationalizationContext) => {
	const languageForContext = await container.i18n.fetchLanguage(internationalizationContext);

	return {
		content: i18n.t(LanguageKeys.Globals.PaginatedMessageWrongUserInteractionReply, {
			lng: languageForContext ?? 'en-US',
			user: userMention(targetUser.id)
		}),
		ephemeral: true,
		allowedMentions: { users: [], roles: [] }
	};
};
