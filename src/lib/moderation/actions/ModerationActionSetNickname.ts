import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { resolveOnErrorCodes } from '#utils/common';
import { TypeVariation } from '#utils/moderationConstants';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes, type Guild } from 'discord.js';

const Root = LanguageKeys.Commands.Moderation;

export class ModerationActionSetNickname extends ModerationAction<string | null, TypeVariation.SetNickname> {
	public constructor() {
		super({
			type: TypeVariation.SetNickname,
			isUndoActionAvailable: true,
			logPrefix: 'Moderation => SetNickname'
		});
	}

	public override async isActive(guild: Guild, userId: string, context: string | null) {
		const member = await resolveOnErrorCodes(guild.members.fetch(userId), RESTJSONErrorCodes.UnknownMember);
		return !isNullish(member) && member.nickname === context;
	}

	protected override async handleApplyPre(guild: Guild, entry: ModerationAction.Entry, data: ModerationAction.Data<string>) {
		const nickname = data.context || null;
		const reason = await (entry.reason
			? resolveKey(guild, nickname ? Root.ActionSetNicknameSet : Root.ActionSetNicknameRemoved, { reason: entry.reason })
			: resolveKey(guild, nickname ? Root.ActionSetNicknameNoReasonSet : Root.ActionSetNicknameNoReasonRemoved));
		await api().guilds.editMember(guild.id, entry.userId, { nick: nickname }, { reason });

		await this.completeLastModerationEntryFromUser({ guild, userId: entry.userId });
	}

	protected override async handleUndoPre(guild: Guild, entry: ModerationAction.Entry, data: ModerationAction.Data<string>) {
		const nickname = data.context || null;
		await api().guilds.editMember(guild.id, entry.userId, { nick: nickname }, { reason: entry.reason || undefined });

		await this.completeLastModerationEntryFromUser({ guild, userId: entry.userId });
	}

	protected override async resolveOptionsExtraData(guild: Guild, options: ModerationAction.PartialOptions) {
		const member = await guild.members.fetch(options.user);
		return { oldName: member.nickname };
	}
}
