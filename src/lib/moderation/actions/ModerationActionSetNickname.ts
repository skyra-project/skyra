import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { TypeVariation } from '#utils/moderationConstants';
import { resolveKey } from '@sapphire/plugin-i18next';
import type { Guild } from 'discord.js';

const Root = LanguageKeys.Commands.Moderation;

export class ModerationActionSetNickname extends ModerationAction<string> {
	public constructor() {
		super({
			type: TypeVariation.SetNickname,
			actionKey: 'setNickname',
			logPrefix: 'Moderation => SetNickname'
		});
	}

	protected override async handleApplyPre(guild: Guild, options: ModerationAction.Options, data: ModerationAction.Data<string>) {
		const nickname = data.context as string;
		const reason = await (options.reason
			? resolveKey(guild, nickname ? Root.ActionSetNicknameSet : Root.ActionSetNicknameRemoved, { reason: options.reason })
			: resolveKey(guild, nickname ? Root.ActionSetNicknameNoReasonSet : Root.ActionSetNicknameNoReasonRemoved));
		await api().guilds.editMember(guild.id, options.userId, { nick: nickname }, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: options.userId });
	}

	protected override async handleUndoPre(guild: Guild, options: ModerationAction.Options, data: ModerationAction.Data<string>) {
		const nickname = (data.context as string) || null;
		await api().guilds.editMember(guild.id, options.userId, { nick: nickname }, { reason: options.reason || undefined });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: options.userId });
	}

	protected override async resolveOptionsExtraData(guild: Guild, options: ModerationAction.PartialOptions) {
		const member = await guild.members.fetch(options.userId);
		return { oldName: member.nickname };
	}
}
