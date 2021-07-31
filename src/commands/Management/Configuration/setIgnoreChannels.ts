import { GuildSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import type { GuildTextBasedChannelTypes } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, container, IArgument } from '@sapphire/framework';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Management.SetIgnoreChannelsDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetIgnoreChannelsExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick(UserCommand.hereOrTextChannelResolver);

		const [oldLength, newLength] = await writeSettings(message.guild, (settings) => {
			const ignoredChannels = settings[GuildSettings.DisabledChannels];
			const oldLength = ignoredChannels.length;

			const channelId = channel.id;
			const index = ignoredChannels.indexOf(channelId);
			if (index === -1) {
				ignoredChannels.push(channelId);
			} else {
				ignoredChannels.splice(index, 1);
			}

			return [oldLength, ignoredChannels.length];
		});

		return message.send(
			args.t(
				oldLength < newLength
					? LanguageKeys.Commands.Management.SetIgnoreChannelsSet
					: LanguageKeys.Commands.Management.SetIgnoreChannelsRemoved,

				{
					channel: channel.toString()
				}
			)
		);
	}

	private static hereOrTextChannelResolver = Args.make<GuildTextBasedChannelTypes>((argument, context) => {
		if (argument === 'here') return Args.ok(context.message.channel as GuildTextBasedChannelTypes);
		return (container.stores.get('arguments').get('textOrNewsChannelName') as IArgument<GuildTextBasedChannelTypes>).run(argument, context);
	});
}
