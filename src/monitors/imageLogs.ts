import { MessageEmbed, TextChannel, MessageAttachment } from 'discord.js';
import { KlasaMessage, Monitor, util } from 'klasa';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '../lib/util/constants';
import { getAttachment, fetch } from '../lib/util/util';
import { extname } from 'path';

const MAXIMUM_SIZE = 300;
// 1024 = 1 kilobyte
// 1024 * 1024 = 1 megabyte
const MAXIMUM_LENGTH = 1024 * 1024;

export default class extends Monitor {

	public async run(message: KlasaMessage) {
		const image = getAttachment(message);
		if (image === null) return;

		const dimensions = this.getDimensions(image.width, image.height);
		const url = new URL(image.proxyURL);
		url.searchParams.append('width', dimensions.width.toString());
		url.searchParams.append('height', dimensions.height.toString());

		const result = await fetch(url, 'result');
		const contentLength = result.headers.get('content-length');
		if (contentLength === null) return;

		const parsedContentLength = parseInt(contentLength, 10);
		if (!util.isNumber(parsedContentLength)) return;
		if (parsedContentLength > MAXIMUM_LENGTH) return;

		const buffer = await result.buffer();
		const filename = `image${extname(url.pathname)}`;

		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Image, message.guild, () => new MessageEmbed()
			.setColor(0xEFAE45)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
			.setDescription(`[${message.language.tget('JUMPTO')}](${message.url})`)
			.setFooter(`#${(message.channel as TextChannel).name}`)
			.attachFiles([new MessageAttachment(buffer, filename)])
			.setImage(`attachment://${filename}`)
			.setTimestamp());
	}

	public shouldRun(message: KlasaMessage) {
		return this.enabled
			&& message.attachments.size !== 0
			&& message.guild !== null
			&& message.author !== null
			&& message.webhookID === null
			&& !message.system
			&& message.author.id !== this.client.user!.id
			&& message.guild.settings.get(GuildSettings.Channels.ImageLogs) !== null
			&& !message.guild.settings.get(GuildSettings.Selfmod.IgnoreChannels).includes(message.channel.id);
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
			return {
				width: MAXIMUM_SIZE,
				height: Math.floor(height / (width / MAXIMUM_SIZE))
			};
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
			return {
				width: Math.floor(width / (height / MAXIMUM_SIZE)),
				height: MAXIMUM_SIZE
			};
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
