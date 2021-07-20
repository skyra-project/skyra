import { YoutubeSubscriptionHandler } from '#lib/grpc';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { wrap } from '#utils/util';
import { enabled, validateChannel } from '#utils/youtube';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['yt-unsub', 'yt-unsubscribe'],
	enabled,
	cooldown: 5,
	description: LanguageKeys.Commands.Notifications.YoutubeUnsubscribeDescription,
	extendedHelp: LanguageKeys.Commands.Notifications.YoutubeUnsubscribeExtended,
	permissionLevel: PermissionLevels.Administrator
})
export class UserSkyraCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const url = validateChannel(await args.pick('url'));
		const channel = args.finished ? message.channel : await args.pick('textOrNewsChannelName');

		const { success } = await wrap(
			this.context.grpc.youtubeSubscriptions.manageSubscription({
				guildId: message.guild.id,
				guildChannelId: channel.id,
				type: YoutubeSubscriptionHandler.Action.UNSUBSCRIBE,
				notificationMessage: '',
				youtubeChannelUrl: url
			})
		);

		const key = success
			? LanguageKeys.Commands.Notifications.YoutubeUnsubscribeSuccess
			: LanguageKeys.Commands.Notifications.YoutubeUnsubscribeFailed;
		return message.send(args.t(key, { url }));
	}
}
