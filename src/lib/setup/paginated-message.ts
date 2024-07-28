import { LanguageKeys } from '#lib/i18n/languageKeys';
import { fetchT } from '#lib/i18n/translate';
import { userMention } from '@discordjs/builders';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

PaginatedMessage.selectMenuOptions = async (pageIndex, internationalizationContext) => {
	const t = await fetchT(internationalizationContext);

	return {
		label: `${t(LanguageKeys.Globals.PaginatedMessagePage, {})} ${pageIndex}`
	};
};

PaginatedMessage.wrongUserInteractionReply = async (targetUser, _, internationalizationContext) => {
	const t = await fetchT(internationalizationContext);

	return {
		content: t(LanguageKeys.Globals.PaginatedMessageWrongUserInteractionReply, { user: userMention(targetUser.id) }),
		ephemeral: true,
		allowedMentions: { users: [], roles: [] }
	};
};
