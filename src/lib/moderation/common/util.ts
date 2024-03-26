import { LanguageKeys } from '#lib/i18n/languageKeys';
import { TranslationMappings, UndoTaskNameMappings, getColor } from '#lib/moderation/common/constants';
import type { ModerationManager } from '#lib/moderation/managers/ModerationManager';
import type { SkyraCommand } from '#lib/structures';
import { seconds } from '#utils/common';
import { TypeVariation } from '#utils/moderationConstants';
import { getDisplayAvatar, getFullEmbedAuthor, getTag } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullishOrZero } from '@sapphire/utilities';
import { TimestampStyles, chatInputApplicationCommandMention, time, type Snowflake } from 'discord.js';

export function getTranslationKey<const Type extends TypeVariation>(type: Type): (typeof TranslationMappings)[Type] {
	return TranslationMappings[type];
}

/**
 * Retrieves the task name for the scheduled undo action based on the provided type.
 *
 * @param type - The type of the variation.
 * @returns The undo task name associated with the provided type, or `null` if not found.
 */
export function getUndoTaskName(type: TypeVariation) {
	return type in UndoTaskNameMappings ? UndoTaskNameMappings[type as keyof typeof UndoTaskNameMappings] : null;
}

const Root = LanguageKeys.Moderation;
export function getTitle(t: TFunction, entry: ModerationManager.Entry): string {
	const name = t(getTranslationKey(entry.type));
	if (entry.isUndo()) return t(Root.MetadataUndo, { name });
	if (entry.isTemporary()) return t(Root.MetadataTemporary, { name });
	return name;
}

export async function getEmbed(t: TFunction, entry: ModerationManager.Entry) {
	const [description, moderator] = await Promise.all([getEmbedDescription(t, entry), entry.fetchModerator()]);
	const embed = new EmbedBuilder()
		.setColor(getColor(entry))
		.setAuthor(getFullEmbedAuthor(moderator))
		.setDescription(description)
		.setFooter({
			text: t(Root.EmbedFooter, { caseId: entry.id }),
			iconURL: getDisplayAvatar(container.client.user!, { size: 128 })
		})
		.setTimestamp(entry.createdAt);

	if (entry.imageURL) embed.setImage(entry.imageURL);
	return embed;
}

async function getEmbedDescription(t: TFunction, entry: ModerationManager.Entry) {
	const reason = entry.reason ?? t(Root.EmbedReasonNotSet, { command: getCaseEditMention(), caseId: entry.id });

	const type = getTitle(t, entry);
	const user = t(Root.EmbedUser, { tag: getTag(await entry.fetchUser()), id: entry.userId });
	return isNullishOrZero(entry.duration)
		? t(Root.EmbedDescription, { type, user, reason })
		: t(Root.EmbedDescriptionTemporary, { type, user, time: getEmbedDescriptionTime(entry.expiresTimestamp!), reason });
}

function getEmbedDescriptionTime(timestamp: number) {
	return time(seconds.fromMilliseconds(timestamp), TimestampStyles.RelativeTime);
}

let caseCommandId: Snowflake | null = null;
function getCaseEditMention() {
	caseCommandId ??= (container.stores.get('commands').get('case') as SkyraCommand).getGlobalCommandId();
	return chatInputApplicationCommandMention('case', 'edit', caseCommandId);
}
