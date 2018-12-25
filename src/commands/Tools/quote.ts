import { Command, Serializer, util : { getContent, getImage }, MessageEmbed; } from; '../../index';
const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 10,
			description: (language) => language.get('COMMAND_QUOTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_QUOTE_EXTENDED'),
			usage: '[channel:channel] (message:message)',
			usageDelim: ' '
		});

		this.createCustomResolver('message', async(arg, _, message, [channel = message.channel]) => {
			if (channel.type !== 'text') throw message.language.get('RESOLVER_INVALID_CHANNEL', 'Channel');
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw message.language.get('RESOLVER_INVALID_MSG', 'Message');
			const m = await channel.messages.fetch(arg).catch(() => null);
			if (m) return m;
			throw message.language.get('SYSTEM_MESSAGE_NOT_FOUND');
		});
	}

	public async run(msg, [, message]) {
		const embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 128 }))
			.setImage(getImage(message))
			.setTimestamp(message.createdAt);

		const content = getContent(message);
		if (content) embed.setDescription(content);

		return msg.sendEmbed(embed);
	}

}
