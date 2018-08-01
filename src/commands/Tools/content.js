const { Command, Resolver, util: { getContent } } = require('../../index');
const SNOWFLAKE_REGEXP = Resolver.regex.snowflake;

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['source', 'msg-source', 'message-source'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_CONTENT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CONTENT_EXTENDED'),
			runIn: ['text'],
			usage: '[channel:channel] (message:message)',
			usageDelim: ' '
		});

		this.createCustomResolver('message', async (arg, possible, msg, [channel = msg.channel]) => {
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw msg.language.get('RESOLVER_INVALID_MSG', 'Message');
			const message = await channel.messages.fetch(arg).catch(() => null);
			if (message) return message;
			throw msg.language.get('SYSTEM_MESSAGE_NOT_FOUND');
		});
	}

	async run(msg, [, message]) {
		const attachments = message.attachments.size
			? `\n\n\n=============\n${message.attachments.map(att => `📁 <${att.url}>`).join('\n')}`
			: '';

		return msg.sendMessage(getContent(message) + attachments, { code: 'md' });
	}

};
