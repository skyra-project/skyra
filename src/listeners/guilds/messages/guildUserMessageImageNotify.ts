import { readSettings } from '#lib/database';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events, type GuildMessage } from '#lib/types';
import { Colors } from '#utils/constants';
import { getLogPrefix } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { Listener } from '@sapphire/framework';
import { isNullish, isNullishOrEmpty, isNullishOrZero, isNumber } from '@sapphire/utilities';
import { AttachmentBuilder, type MessageCreateOptions, type TextChannel } from 'discord.js';
import { extname } from 'node:path';

const MAXIMUM_SIZE = 300;
// 1024 = 1 kilobyte
// 1024 * 1024 = 1 megabyte
const MAXIMUM_LENGTH = 1024 * 1024;

@ApplyOptions<Listener.Options>({ event: Events.GuildUserMessage })
export class UserListener extends Listener {
	private readonly LogPrefix = getLogPrefix(this);

	public async run(message: GuildMessage) {
		// If there are no attachments, do not post:
		if (message.attachments.size === 0) return;

		// If the message was edited, do not repost:
		if (message.editedTimestamp) return;

		const settings = await readSettings(message.guild);
		const logChannelId = settings.channelsLogsImage;
		if (isNullish(logChannelId) || settings.channelsIgnoreAll.includes(message.channel.id)) return;

		const t = getT(settings.language);
		for (const attachment of this.getAttachments(message)) {
			const dimensions = this.getDimensions(attachment.width, attachment.height);

			// Create a new image url with search params.
			const url = new URL(attachment.proxyURL);
			url.searchParams.append('width', dimensions.width.toString());
			url.searchParams.append('height', dimensions.height.toString());
			if (attachment.kind === 'video') url.searchParams.append('format', 'webp');

			// Fetch the image.
			const result = await fetch(url, FetchResultTypes.Result).catch((error) => {
				this.container.logger.error(`${this.LogPrefix} ${url} ${error}`);
				return null;
			});
			if (result === null) continue;

			// Retrieve the content length.
			const contentLength = result.headers.get('content-length');
			if (isNullishOrEmpty(contentLength)) continue;

			// Parse the content length, validate it, and check if it's lower than the threshold.
			const parsedContentLength = parseInt(contentLength, 10);
			if (!isNumber(parsedContentLength)) continue;
			if (parsedContentLength > MAXIMUM_LENGTH) continue;

			try {
				// Download the image and send it to the image logs.
				const buffer = Buffer.from(await (await result.blob()).arrayBuffer());
				const filename = `image${extname(url.pathname)}`;

				this.container.client.emit(Events.GuildMessageLog, message.guild, logChannelId, 'channelsLogsImage', (): MessageCreateOptions => {
					const embed = new EmbedBuilder()
						.setColor(Colors.Yellow)
						.setAuthor(getFullEmbedAuthor(message.author, message.url))
						.setDescription(`[${t(LanguageKeys.Misc.JumpTo)}](${message.url})`)
						.setFooter({ text: `#${(message.channel as TextChannel).name}` })
						.setImage(`attachment://${filename}`)
						.setTimestamp();

					return { embeds: [embed], files: [new AttachmentBuilder(buffer, { name: filename })] };
				});
			} catch (error) {
				this.container.logger.fatal(`${this.LogPrefix} ${url} ${error}`);
			}
		}
	}

	private *getAttachments(message: GuildMessage) {
		for (const attachment of message.attachments.values()) {
			// Skip if the attachment doesn't have a content type:
			if (isNullishOrEmpty(attachment.contentType)) continue;
			// Skip if the attachment doesn't have a size:
			if (isNullishOrZero(attachment.width) || isNullishOrZero(attachment.height)) continue;

			const [kind] = attachment.contentType.split('/', 1);
			if (kind !== 'image' && kind !== 'video') continue;

			yield {
				kind: kind as 'image' | 'video',
				url: attachment.url,
				proxyURL: attachment.proxyURL,
				height: attachment.height!,
				width: attachment.width!
			};
		}
	}

	private getDimensions(width: number, height: number) {
		if (width > height) {
			// Landscape
			// width -> MAX, height = ORIGINAL_HEIGHT / (ORIGINAL_WIDTH / MAX)
			// width -> MAX, height = ORIGINAL_HEIGHT / PROPORTION
			//
			// For 900x450, given MAX = 300
			// width: 300
			// height: 450 / (900 / 300) -> 450 / 3 -> 150
			// 900x450 -> 300x150 keeps 2:1 proportion
			const scaledHeight = Math.floor(height / (width / MAXIMUM_SIZE));
			return scaledHeight === 0 ? { width, height } : { width: MAXIMUM_SIZE, height: scaledHeight };
		}

		if (width < height) {
			// Portrait
			// width -> ORIGINAL_WIDTH / (ORIGINAL_HEIGHT / MAX), height -> MAX
			// width -> ORIGINAL_WIDTH / PROPORTION, height -> MAX
			//
			// For 450x900, given MAX = 300
			// width: 450 / (900 / 300) -> 450 / 3 -> 150
			// height: 300
			// 450x900 -> 150x300 keeps 1:2 proportion
			const scaledWidth = Math.floor(width / (height / MAXIMUM_SIZE));
			return scaledWidth === 0 ? { width, height } : { width: scaledWidth, height: MAXIMUM_SIZE };
		}

		// Square
		// width -> MAX, height -> MAX
		//
		// For 450x450, given MAX = 300
		// width: 300
		// height: 300
		// 450x450 -> 300x300 keeps 1:1 proportion
		return {
			width: MAXIMUM_SIZE,
			height: MAXIMUM_SIZE
		};
	}
}
