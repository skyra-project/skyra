import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, ModerationCommand, type HandledCommandContext } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { years } from '#utils/common';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['sn'],
	description: LanguageKeys.Commands.Moderation.SetNicknameDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.SetNicknameExtended,
	optionalDuration: true,
	requiredClientPermissions: [PermissionFlagsBits.ManageNicknames],
	requiredMember: true
})
export class UserModerationCommand extends ModerationCommand {
	protected override async resolveOverloads(args: ModerationCommand.Args) {
		return {
			targets: await args.repeat('user', { times: 10 }),
			nickname: args.finished ? null : await args.pick('string'),
			duration: this.optionalDuration ? await args.pick('timespan', { minimum: 0, maximum: years(5) }).catch(() => null) : null,
			reason: args.finished ? null : await args.rest('string')
		};
	}

	protected async handle(message: GuildMessage, context: HandledCommandContext & { nickname: string }) {
		return ModerationActions.setNickname.apply(
			message.guild,
			{ user: context.target, moderator: message.author, reason: context.reason, imageURL: getImage(message), duration: context.duration },
			await this.getActionData(message, context.args, context.target, context.nickname)
		);
	}
}
