import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.SetNickname;
type ValueType = null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	aliases: ['sn'],
	description: LanguageKeys.Commands.Moderation.SetNicknameDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.SetNicknameExtended,
	requiredClientPermissions: [PermissionFlagsBits.ManageNicknames],
	type: TypeVariation.SetNickname,
	requiredMember: true
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {
	protected override async resolveParameters(args: ModerationCommand.Args) {
		return {
			targets: await this.resolveParametersUser(args),
			nickname: args.finished ? null : await args.pick('string'),
			duration: await this.resolveParametersDuration(args),
			reason: await this.resolveParametersReason(args)
		};
	}

	protected override getHandleDataContext(_message: GuildMessage, context: HandlerParameters) {
		return context.nickname;
	}

	protected override getActionStatusKey(context: HandlerParameters) {
		return context.nickname === null ? LanguageKeys.Moderation.ActionIsNotActiveNickname : LanguageKeys.Moderation.ActionIsActiveNickname;
	}
}

interface HandlerParameters extends ModerationCommand.HandlerParameters<ValueType> {
	nickname: string | null;
}
