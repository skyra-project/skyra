import { Serializer } from '@klasa/settings-gateway';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['srm'],
	bucket: 2,
	cooldown: 10,
	description: language => language.tget('COMMAND_SETROLEMESSAGE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_SETROLEMESSAGE_EXTENDED'),
	permissionLevel: PermissionLevels.Administrator,
	requiredPermissions: ['READ_MESSAGE_HISTORY'],
	runIn: ['text'],
	usage: '(message:message)'
})
@CreateResolvers([
	[
		'message', async (arg, _, msg) => {
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw msg.language.tget('RESOLVER_INVALID_MESSAGE', 'Message');

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
		}
	]
])
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [reactionMessage]: [KlasaMessage]) {
		await message.guild!.settings.update(GuildSettings.Roles.MessageReaction, reactionMessage.id, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_SETMESSAGEROLE_SET');
	}

}
