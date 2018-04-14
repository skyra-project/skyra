const { Command, Resolver } = require('../../../index');
const SNOWFLAKE_REGEXP = Resolver.regex.snowflake;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_SETMESSAGEROLE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SETMESSAGEROLE_EXTENDED'),
			permLevel: 6,
			runIn: ['text'],
			usage: '(message:message)'
		});

		this.createCustomResolver('message', async (arg, possible, msg) => {
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw msg.language.get('RESOLVER_INVALID_MSG', 'Message');

			const rolesChannel = msg.guild.configs.channels.roles;
			if (!rolesChannel) throw msg.language.get('COMMAND_SETMESSAGEROLE_CHANNELNOTSET');

			if (!msg.guild.channels.has(rolesChannel)) {
				await msg.guild.configs.reset('channels.roles');
				throw msg.language.get('COMMAND_SETMESSAGEROLE_CHANNELNOTSET');
			}
			if (!rolesChannel !== msg.channel.id) throw msg.language.get('COMMAND_SETMESSAGEROLE_WRONGCHANNEL');
			if (msg.guild.configs.roles.messageReaction === arg) throw msg.language.get('CONFIGURATION_EQUALS');

			const message = await msg.channel.messages.fetch(arg).catch(() => null);
			if (message) return message;
			throw msg.language.get('SYSTEM_MESSAGE_NOT_FOUND');
		});
	}

	async run(msg, [message]) {
		await msg.guild.configs.update('roles.messageReaction', message.id);
		return msg.sendMessage(msg.language.get('COMMAND_SETMESSAGEROLE_SET'));
	}

};
