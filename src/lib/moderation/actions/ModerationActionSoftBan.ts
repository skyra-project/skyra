import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { TypeVariation } from '#utils/moderationConstants';
import { fetchT, type TFunction } from '@sapphire/plugin-i18next';
import { isNullishOrEmpty } from '@sapphire/utilities';
import type { Guild } from 'discord.js';

const Root = LanguageKeys.Commands.Moderation;

export class ModerationActionSoftban extends ModerationAction<number, TypeVariation.Softban> {
	public constructor() {
		super({
			type: TypeVariation.Softban,
			isUndoActionAvailable: false,
			logPrefix: 'Moderation => Softban'
		});
	}

	protected override async handleApplyPost(guild: Guild, entry: ModerationAction.Entry, data: ModerationAction.Data<number>) {
		const t = await fetchT(guild);

		await api().guilds.banUser(guild.id, entry.userId, { delete_message_seconds: data.context ?? 0 }, this.#getBanReason(t, entry.reason));
		await api().guilds.unbanUser(guild.id, entry.userId, this.#getUnbanReason(t, entry.reason));

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: entry.userId, type: TypeVariation.Ban });
	}

	#getBanReason(t: TFunction, reason: string | null | undefined) {
		return { reason: isNullishOrEmpty(reason) ? t(Root.ActionSoftBanNoReason) : t(Root.ActionSoftBanReason, { reason }) };
	}

	#getUnbanReason(t: TFunction, reason: string | null | undefined) {
		return { reason: isNullishOrEmpty(reason) ? t(Root.ActionUnSoftBanNoReason) : t(Root.ActionUnSoftBanReason, { reason }) };
	}
}
