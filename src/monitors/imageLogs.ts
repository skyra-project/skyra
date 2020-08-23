import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { CLIENT_ID } from '@root/config';
import { isNumber } from '@sapphire/utilities';
import { MessageLogsEnum } from '@utils/constants';
import { fetch, FetchResultTypes, IMAGE_EXTENSION } from '@utils/util';
import { MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage, Monitor } from 'klasa';
import { extname } from 'path';

const MAXIMUM_SIZE = 300;
// 1024 = 1 kilobyte
// 1024 * 1024 = 1 megabyte
const MAXIMUM_LENGTH = 1024 * 1024;

export default class extends Monitor {
	public async run(message: KlasaMessage) {
		for (const image of this.getAttachments(message)) {
			const dimensions = this.getDimensions(image.width, image.height);

			// Create a new image url with search params.
			const url = new URL(image.proxyURL);
			url.searchParams.append('width', dimensions.width.toString());
			url.searchParams.append('height', dimensions.height.toString());

			// Fetch the image.
			const result = await fetch(url, FetchResultTypes.Result).catch((error) => {
				this.client.emit(Events.Error, `ImageLogs[${error}] ${url}`);
				return null;
			});
			if (result === null) continue;

			// Retrieve the content length.
			const contentLength = result.headers.get('content-length');
			if (contentLength === null) continue;

			// Parse the content length, validate it, and check if it's lower than the threshold.
			const parsedContentLength = parseInt(contentLength, 10);
			if (!isNumber(parsedContentLength)) continue;
			if (parsedContentLength > MAXIMUM_LENGTH) continue;

			try {
				// Download the image and send it to the image logs.
				const buffer = await result.buffer();
				const filename = `image${extname(url.pathname)}`;

				this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Image, message.guild, () =>
					new MessageEmbed()
						.setColor(Colors.Yellow)
						.setAuthor(
							`${message.author.tag} (${message.author.id})`,
							message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
						)
						.setDescription(`[${message.language.get('jumpTo')}](${message.url})`)
						.setFooter(`#${(message.channel as TextChannel).name}`)
						.attachFiles([new MessageAttachment(buffer, filename)])
						.setImage(`attachment://${filename}`)
						.setTimestamp()
				);
			} catch (error) {
				this.client.emit(Events.Wtf, `ImageLogs[${error}] ${url}`);
			}
		}
	}

	public shouldRun(message: KlasaMessage) {
		return (
			this.enabled &&
			message.attachments.size !== 0 &&
			message.guild !== null &&
			message.author !== null &&
			message.webhookID === null &&
			!message.system &&
			message.author.id !== CLIENT_ID &&
			message.guild.settings.get(GuildSettings.Channels.ImageLogs) !== null &&
			!message.guild.settings.get(GuildSettings.Selfmod.IgnoreChannels).includes(message.channel.id)
		);
	}

	private *getAttachments(message: KlasaMessage) {
		for (const attachment of message.attachments.values()) {
			if (!IMAGE_EXTENSION.test(attachment.url)) continue;

			yield {
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
