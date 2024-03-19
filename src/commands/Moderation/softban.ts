import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { getModeration } from '#utils/functions';
import { TimeOptions, getSeconds } from '#utils/moderation-utilities';
import { TypeVariation, type Unlock } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.Softban;
type ValueType = Unlock | null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	aliases: ['sb'],
	description: LanguageKeys.Commands.Moderation.SoftBanDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.SoftBanExtended,
	options: TimeOptions,
	requiredClientPermissions: [PermissionFlagsBits.BanMembers],
	requiredMember: false,
	type: TypeVariation.Softban
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {
	public override async preHandle(message: GuildMessage) {
		const [banAdd, banRemove] = await readSettings(message.guild, [GuildSettings.Events.BanAdd, GuildSettings.Events.BanRemove]);
		return banAdd || banRemove ? { unlock: getModeration(message.guild).createLock() } : null;
	}

	public override getHandleDataContext(_message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		return getSeconds(context.args);
	}

	public override postHandle(_message: GuildMessage, { preHandled }: ModerationCommand.PostHandleParameters<ValueType>) {
		preHandled?.unlock();
	}

	public override async checkModeratable(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.bannable) throw context.args.t(LanguageKeys.Commands.Moderation.BanNotBannable);
		return member;
	}
}
