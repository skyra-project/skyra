import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { getModeration } from '#utils/functions';
import { TimeOptions, getSeconds } from '#utils/moderation-utilities';
import { TypeVariation, type Unlock } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.Ban;
type ValueType = Unlock | null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	aliases: ['b'],
	description: LanguageKeys.Commands.Moderation.BanDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.BanExtended,
	options: TimeOptions,
	requiredClientPermissions: [PermissionFlagsBits.BanMembers],
	type: TypeVariation.Ban
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {
	protected override async preHandle(message: GuildMessage) {
		return (await readSettings(message.guild, GuildSettings.Events.BanAdd)) ? { unlock: getModeration(message.guild).createLock() } : null;
	}

	protected override getHandleDataContext(_message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		return getSeconds(context.args);
	}

	protected override postHandle(_message: GuildMessage, { preHandled }: ModerationCommand.PostHandleParameters<ValueType>) {
		preHandled?.unlock();
	}

	protected override async checkModeratable(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.bannable) throw context.args.t(LanguageKeys.Commands.Moderation.BanNotBannable);
		return member;
	}
}
