import { readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { getModeration } from '#utils/functions';
import { TypeVariation, type Unlock } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.Kick;
type ValueType = Unlock | null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	aliases: ['k'],
	description: LanguageKeys.Commands.Moderation.KickDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.KickExtended,
	requiredClientPermissions: [PermissionFlagsBits.KickMembers],
	requiredMember: true,
	type: TypeVariation.Kick
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {
	protected override async preHandle(message: GuildMessage) {
		const settings = await readSettings(message.guild);
		return settings.channelsLogsMemberRemove ? { unlock: getModeration(message.guild).createLock() } : null;
	}

	protected override postHandle(_message: GuildMessage, { preHandled }: ModerationCommand.PostHandleParameters<ValueType>) {
		preHandled?.unlock();
	}

	protected override async checkTargetCanBeModerated(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		const member = await super.checkTargetCanBeModerated(message, context);
		if (member && !member.kickable) throw context.args.t(LanguageKeys.Commands.Moderation.KickNotKickable);
		return member;
	}
}
