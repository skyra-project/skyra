import { writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Args, Argument, CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Management.SetIgnoreChannelsDescription,
	detailedDescription: LanguageKeys.Commands.Management.SetIgnoreChannelsExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick(UserCommand.hereOrTextChannelResolver);

		const [oldLength, newLength] = await writeSettings(message.guild, (settings) => {
			const ignoredChannels = settings.disabledChannels;
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

		const contentKey =
			oldLength < newLength ? LanguageKeys.Commands.Management.SetIgnoreChannelsSet : LanguageKeys.Commands.Management.SetIgnoreChannelsRemoved;
		const content = args.t(contentKey, { channel: channel.toString() });
		return send(message, content);
	}

	private static hereOrTextChannelResolver = Args.make<GuildTextBasedChannelTypes>((argument, context) => {
		if (argument === 'here') return Args.ok(context.message.channel as GuildTextBasedChannelTypes);
		return (container.stores.get('arguments').get('textOrNewsChannelName') as Argument<GuildTextBasedChannelTypes>).run(argument, context);
	});
}
