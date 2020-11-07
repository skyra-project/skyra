import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { TextChannel } from 'discord.js';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Management.SetImageLogsDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.SetImageLogsExtended),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	usage: '<here|channel:textchannelname>'
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [channel]: [TextChannel | 'here']) {
		if (channel === 'here') channel = message.channel as TextChannel;
		const channelID = channel.id;

		const language = await message.guild.writeSettings((settings) => {
			const language = settings.getLanguage();

			// If it's the same value, throw:
			if (settings[GuildSettings.Channels.ImageLogs] === channelID) {
				throw language.get(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings[GuildSettings.Channels.ImageLogs] = channelID;

			return language;
		});

		return message.send(language.get(LanguageKeys.Commands.Management.SetImageLogsSet, { channel: channel.toString() }));
	}
}
