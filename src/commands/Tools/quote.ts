import { Serializer } from '@lib/database';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { cutText } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { getContent, getImage, isTextBasedChannel } from '@utils/util';
import { GuildChannel, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;
const MESSAGE_LINK_REGEXP = /^\/channels\/(\d{17,18})\/(\d{17,18})\/(\d{17,18})$/;

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Tools.QuoteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.QuoteExtended),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '[channel:channelname] (message:message)',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	public async init() {
		this.createCustomResolver('message', async (arg, _, message, [channel = message.channel as GuildChannel]: GuildChannel[]) => {
			// Try to find from URL, then use channel
			const messageUrl = await this.getFromUrl(message, arg);
			if (messageUrl) return messageUrl;

			if (!isTextBasedChannel(channel)) throw message.fetchLocale(LanguageKeys.Resolvers.InvalidChannel, { name: 'Channel' });
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw message.fetchLocale(LanguageKeys.Resolvers.InvalidMessage, { name: 'Message' });
			const m = await (channel as TextChannel).messages.fetch(arg).catch(() => null);
			if (m) return m;
			throw message.fetchLocale(LanguageKeys.System.MessageNotFound);
		});
	}

	public async run(message: KlasaMessage, [, remoteMessage]: [never, KlasaMessage]) {
		const embed = new MessageEmbed()
			.setAuthor(remoteMessage.author.tag, remoteMessage.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setColor(await DbSet.fetchColor(message))
			.setImage(getImage(remoteMessage)!)
			.setTimestamp(remoteMessage.createdAt);

		const content = getContent(remoteMessage);
		if (content)
			embed.setDescription(`[${await message.fetchLocale(LanguageKeys.Misc.JumpTo)}](${remoteMessage.url})\n${cutText(content, 1800)}`);

		return message.sendEmbed(embed);
	}

	private async getFromUrl(message: KlasaMessage, url: string) {
		let parsed: URL | undefined = undefined;
		try {
			parsed = new URL(url);
		} catch {
			return null;
		}

		// Only discordapp.com and discord.com urls are allowed.
		if (/^(ptb\.|canary\.)?discord(?:app)?\.com$/g.test(parsed.hostname)) return null;

		const extract = MESSAGE_LINK_REGEXP.exec(parsed.pathname);
		if (!extract) return null;

		const [, _guild, _channel, _message] = extract;
		const guild = this.client.guilds.cache.get(_guild);
		if (guild !== message.guild!) return null;

		const channel = guild.channels.cache.get(_channel);
		if (!channel) return null;
		if (!(channel instanceof TextChannel)) throw message.fetchLocale(LanguageKeys.Resolvers.InvalidChannel, { name: 'Channel' });
		if (!channel.readable) throw message.fetchLocale(LanguageKeys.System.MessageNotFound);
		if (!channel.permissionsFor(message.author)?.has(Permissions.FLAGS.VIEW_CHANNEL))
			throw message.fetchLocale(LanguageKeys.System.CannotAccessChannel);

		return channel.messages.fetch(_message);
	}
}
