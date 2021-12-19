import { envParseBoolean } from '#lib/env';
import type { YoutubeServiceHandler } from '#lib/grpc';
import { time } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages } from '@sapphire/discord.js-utilities';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { TextBasedChannels } from 'discord.js';

@ApplyOptions<ListenerOptions>({ enabled: envParseBoolean('GRPC_ENABLED') && envParseBoolean('GRPC_YOUTUBE_ENABLED') })
export class UserListener extends Listener {
	public run(notification: YoutubeServiceHandler.UploadNotification) {
		for (const context of notification.guildInfoList) {
			void this.handleGuild(context, notification.video!);
		}
	}

	private async handleGuild(context: YoutubeServiceHandler.GuildInformation, video: YoutubeServiceHandler.Video) {
		const guild = this.container.client.guilds.cache.get(context.guildId);
		if (!guild) return;

		const channel = guild.channels.cache.get(context.channelId) as TextBasedChannels | undefined;
		if (!canSendMessages(channel)) return;

		try {
			await channel!.send(this.replaceText(context.message, video));
		} catch (error) {
			this.container.logger.error(error);
		}
	}

	private replaceText(content: string, video: YoutubeServiceHandler.Video) {
		return content.replace(contentReplacer, (match, id) => {
			switch (id) {
				case 'stream.title':
				case 'video.title':
				case 'title':
					return video.title;
				case 'stream.url':
				case 'video.url':
				case 'url':
					return video.url;
				case 'stream.time':
				case 'video.time':
				case 'time':
					return time(video.time?.seconds ?? 0);
				case 'channel.name':
					return video.channelInfo?.channelName ?? 'Unknown';
				case 'channel.url':
					return video.channelInfo?.channelUrl ?? 'Unknown';
				default:
					return match;
			}
		});
	}
}

const contentReplacer = /{{((?:(?:stream|video).)?(?:title|url|time)|channel\.(?:name|url))}}/g;
