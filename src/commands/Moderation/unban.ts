import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { getModeration } from '#utils/functions';
import { TypeVariation, type MaybeUnlock } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { Result } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.Ban;
type ValueType = MaybeUnlock & { bans: readonly string[] };

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
		const result = await Result.fromAsync(message.guild.bans.fetch());
		const bans = result.map((value) => value.map((ban) => ban.user.id)).unwrapOr(null);

		// If the fetch failed, throw an error saying that the fetch failed:
		if (bans === null) {
			throw await resolveKey(message, LanguageKeys.System.FetchBansFail);
		}

		// If there were no bans, throw an error saying that the ban list is empty:
		if (bans.length === 0) {
			throw await resolveKey(message, LanguageKeys.Commands.Moderation.GuildBansEmpty);
		}

		return {
			bans,
			unlock: (await readSettings(message.guild, GuildSettings.Events.BanRemove)) ? getModeration(message.guild).createLock() : null
		};
	}

	public override postHandle(_message: GuildMessage, { preHandled }: ModerationCommand.PostHandleParameters<ValueType>) {
		preHandled?.unlock?.();
	}

	public override checkModeratable(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		if (!context.preHandled.bans.includes(context.target.id)) throw context.args.t(LanguageKeys.Commands.Moderation.GuildBansNotFound);
		return super.checkModeratable(message, context);
	}
}
