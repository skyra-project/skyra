const { Command, Serializer } = require('../../../index');
const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['READ_MESSAGE_HISTORY'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_SETROLEMESSAGE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETROLEMESSAGE_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '(message:message)'
		});

		this.createCustomResolver('message', async(arg, possible, msg) => {
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw msg.language.get('RESOLVER_INVALID_MSG', 'Message');

			const rolesChannel = msg.guild.settings.channels.roles;
			if (!rolesChannel) throw msg.language.get('COMMAND_SETMESSAGEROLE_CHANNELNOTSET');

			if (!msg.guild.channels.has(rolesChannel)) {
				await msg.guild.settings.reset('channels.roles');
				throw msg.language.get('COMMAND_SETMESSAGEROLE_CHANNELNOTSET');
			}
			if (rolesChannel !== msg.channel.id) throw msg.language.get('COMMAND_SETMESSAGEROLE_WRONGCHANNEL', `<#${rolesChannel}>`);
			if (msg.guild.settings.roles.messageReaction === arg) throw msg.language.get('CONFIGURATION_EQUALS');

			const message = await msg.channel.messages.fetch(arg).catch(() => null);
			if (message) return message;
			throw msg.language.get('SYSTEM_MESSAGE_NOT_FOUND');
		});
	}

	public async run(msg, [message]) {
		await msg.guild.settings.update('roles.messageReaction', message.id);
		return msg.sendLocale('COMMAND_SETMESSAGEROLE_SET');
	}

}
