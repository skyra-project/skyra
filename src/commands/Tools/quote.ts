import { GuildChannel, MessageEmbed, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage, Serializer } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getContent, getImage } from '../../lib/util/util';
const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.get('COMMAND_QUOTE_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_QUOTE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '[channel:channel] (message:message)',
			usageDelim: ' '
		});

		this.createCustomResolver('message', async (arg, _, message, [channel = message.channel as GuildChannel]: GuildChannel[]) => {
			if (channel.type !== 'text') throw message.language.get('RESOLVER_INVALID_CHANNEL', 'Channel');
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw message.language.get('RESOLVER_INVALID_MSG', 'Message');
			const m = await (channel as TextChannel).messages.fetch(arg).catch(() => null);
			if (m) return m;
			throw message.language.get('SYSTEM_MESSAGE_NOT_FOUND');
		});
	}

	public async run(message: KlasaMessage, [, remoteMessage]: [TextChannel, KlasaMessage]) {
		const embed = new MessageEmbed()
			.setAuthor(remoteMessage.author.tag, remoteMessage.author.displayAvatarURL({ size: 128 }))
			.setImage(getImage(remoteMessage))
			.setTimestamp(remoteMessage.createdAt);

		const content = getContent(remoteMessage);
		if (content) embed.setDescription(content);

		return message.sendEmbed(embed);
	}

}
