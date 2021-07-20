import { YoutubeSubscriptionHandler } from '#lib/grpc';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { wrap } from '#utils/util';
import { enabled, validateChannel } from '#utils/youtube';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['yt-sub', 'yt-subscribe'],
	enabled,
	cooldown: 5,
	description: LanguageKeys.Commands.Notifications.YoutubeSubscribeDescription,
	extendedHelp: LanguageKeys.Commands.Notifications.YoutubeSubscribeExtended,
	permissionLevel: PermissionLevels.Administrator
})
export class UserSkyraCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const url = validateChannel(await args.pick('url'));
		const channel = args.finished ? message.channel : await args.pick('textOrNewsChannelName');
		const content = args.finished ? args.t(LanguageKeys.Commands.Notifications.YoutubeSubscribeDefaultContent) : await args.rest('string');

		const { success } = await wrap(
			this.context.grpc.youtubeSubscriptions.manageSubscription({
				guildId: message.guild.id,
				guildChannelId: channel.id,
				type: YoutubeSubscriptionHandler.Action.SUBSCRIBE,
				notificationMessage: content,
				youtubeChannelUrl: url
			})
		);

		const key = success
			? LanguageKeys.Commands.Notifications.YoutubeSubscribeSuccess
			: LanguageKeys.Commands.Notifications.YoutubeSubscribeFailed;
		return message.send(args.t(key, { url }));
	}
}
