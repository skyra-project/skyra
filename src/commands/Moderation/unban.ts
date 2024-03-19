import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { getModeration } from '#utils/functions';
import { TypeVariation, type Unlock } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.Ban;
type ValueType = Unlock | null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	aliases: ['ub'],
	description: LanguageKeys.Commands.Moderation.UnbanDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnbanExtended,
	requiredClientPermissions: [PermissionFlagsBits.BanMembers],
	requiredMember: false,
	type: TypeVariation.Ban,
	isUndoAction: true
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {
	public override async preHandle(message: GuildMessage) {
		return (await readSettings(message.guild, GuildSettings.Events.BanRemove)) ? { unlock: getModeration(message.guild).createLock() } : null;
	}

	public override postHandle(_message: GuildMessage, { preHandled }: ModerationCommand.PostHandleParameters<ValueType>) {
		preHandled?.unlock?.();
	}
}
