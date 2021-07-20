import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { sendLoadingMessage, wrap } from '#utils/util';
import { enabled } from '#utils/youtube';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['yt-subs', 'yt-subscriptions', 'yt-list'],
	enabled,
	cooldown: 5,
	description: LanguageKeys.Commands.Notifications.YoutubeSubscriptionsDescription,
	extendedHelp: LanguageKeys.Commands.Notifications.YoutubeSubscriptionsExtended,
	permissionLevel: PermissionLevels.Administrator
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const response = await sendLoadingMessage(message, args.t);

		const result = await wrap(this.context.grpc.youtubeSubscriptions.getSubscriptions({ guildId: message.guild.id }));
		if (!result.success) this.error(LanguageKeys.Commands.Notifications.YoutubeSubscriptionsFailed);
		if (result.value.subscriptionsList.length === 0) this.error(LanguageKeys.Commands.Notifications.YoutubeSubscriptionsEmpty);

		const display = new SkyraPaginatedMessage({ template: new MessageEmbed().setColor(await this.context.db.fetchColor(message)) });
		for (const entries of chunk(result.value.subscriptionsList, 15)) {
			const description = entries.map((entry) => `• ${entry.youtubeChannelTitle} → https://youtube.com/c/${entry.youtubeChannelId}`).join('\n');
			display.addPageEmbed((embed) => embed.setDescription(description));
		}

		await display.run(response, message.author);
		return response;
	}
}
