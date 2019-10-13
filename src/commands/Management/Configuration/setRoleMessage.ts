import { CommandStore, KlasaMessage, Serializer } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';
const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_SETROLEMESSAGE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SETROLEMESSAGE_EXTENDED'),
			permissionLevel: 6,
			requiredPermissions: ['READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '(message:message)'
		});

		this.createCustomResolver('message', async (arg, _, msg) => {
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw msg.language.tget('RESOLVER_INVALID_MSG', 'Message');

			const rolesChannel = msg.guild!.settings.get(GuildSettings.Channels.Roles);
			if (!rolesChannel) throw msg.language.tget('COMMAND_SETMESSAGEROLE_CHANNELNOTSET');

			if (!msg.guild!.channels.has(rolesChannel)) {
				await msg.guild!.settings.reset(GuildSettings.Channels.Roles);
				throw msg.language.tget('COMMAND_SETMESSAGEROLE_CHANNELNOTSET');
			}
			if (rolesChannel !== msg.channel.id) throw msg.language.tget('COMMAND_SETMESSAGEROLE_WRONGCHANNEL', `<#${rolesChannel}>`);
			if (msg.guild!.settings.get(GuildSettings.Roles.MessageReaction) === arg) throw msg.language.tget('CONFIGURATION_EQUALS');

			const message = await msg.channel.messages.fetch(arg).catch(() => null);
			if (message) return message;
			throw msg.language.tget('SYSTEM_MESSAGE_NOT_FOUND');
		});
	}

	public async run(message: KlasaMessage, [reactionMessage]: [KlasaMessage]) {
		await message.guild!.settings.update(GuildSettings.Roles.MessageReaction, reactionMessage.id);
		return message.sendLocale('COMMAND_SETMESSAGEROLE_SET');
	}

}
