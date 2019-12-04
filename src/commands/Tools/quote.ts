import { GuildChannel, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage, Serializer } from 'klasa';
import ChannelNameArgument from '../../arguments/channelname';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { cutText, getContent, getImage } from '../../lib/util/util';

const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;
const MESSAGE_LINK_REGEXP = /^\/channels\/(\d{17,18})\/(\d{17,18})\/(\d{17,18})$/;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_QUOTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_QUOTE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '[channel:channel] (message:message)',
			usageDelim: ' '
		});

		this.createCustomResolver('channel', async (arg, possible, message) => {
			const resolvedChannel = await this.channelNameArgument.run(arg, possible, message, channel => channel.type === 'text') as TextChannel;

			// Checks if the current user has view channel permissions for the resolved channel
			if (!resolvedChannel.permissionsFor(message.author)?.has(Permissions.FLAGS.VIEW_CHANNEL)) {
				throw message.language.tget('SYSTEM_CANNOT_ACCESS_CHANNEL');
			}

			return resolvedChannel;
		});

		this.createCustomResolver('message', async (arg, _, message, [channel = message.channel as GuildChannel]: GuildChannel[]) => {
			// Try to find from URL, then use channel
			const messageUrl = await this.getFromUrl(message, arg);
			if (messageUrl) return messageUrl;

			if (channel.type !== 'text') throw message.language.tget('RESOLVER_INVALID_CHANNEL', 'Channel');
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw message.language.tget('RESOLVER_INVALID_MESSAGE', 'Message');
			const m = await (channel as TextChannel).messages.fetch(arg).catch(() => null);
			if (m) return m;
			throw message.language.tget('SYSTEM_MESSAGE_NOT_FOUND');
		});
	}

	private get channelNameArgument() {
		return this.client.arguments.get('channelname') as ChannelNameArgument;
	}

	public async run(message: KlasaMessage, [, remoteMessage]: [never, KlasaMessage]) {
		const embed = new MessageEmbed()
			.setAuthor(remoteMessage.author.tag, remoteMessage.author.displayAvatarURL({ size: 128 }))
			.setImage(getImage(remoteMessage)!)
			.setTimestamp(remoteMessage.createdAt);

		const content = getContent(remoteMessage);
		if (content) embed.setDescription(`[${message.language.tget('JUMPTO')}](${remoteMessage.url})\n${cutText(content, 1800)}`);

		return message.sendEmbed(embed);
	}

	private async getFromUrl(message: KlasaMessage, url: string) {
		let parsed: URL;
		try {
			parsed = new URL(url);
		} catch {
			return null;
		}

		// Only discordapp.com urls are allowed.
		if (/^(beta\.|canary\.)?discordapp\.com$/g.test(parsed.hostname)) return null;

		const extract = MESSAGE_LINK_REGEXP.exec(parsed.pathname);
		if (!extract) return null;

		const [, _guild, _channel, _message] = extract;
		const guild = this.client.guilds.get(_guild);
		if (guild !== message.guild!) return null;

		const channel = guild.channels.get(_channel);
		if (!channel) return null;
		if (!(channel instanceof TextChannel)) throw message.language.tget('RESOLVER_INVALID_CHANNEL', 'Channel');
		if (!channel.readable) throw message.language.tget('SYSTEM_MESSAGE_NOT_FOUND');
		if (!channel.permissionsFor(message.author)?.has(Permissions.FLAGS.VIEW_CHANNEL)) throw message.language.tget('SYSTEM_CANNOT_ACCESS_CHANNEL');

		return channel.messages.fetch(_message);
	}

}
