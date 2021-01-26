import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, IArgument, Store } from '@sapphire/framework';
import type { NewsChannel, TextChannel } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Management.SetIgnoreChannelsDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetIgnoreChannelsExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick(UserCommand.hereOrTextChannelResolver);

		const [oldLength, newLength] = await message.guild.writeSettings((settings) => {
			const ignoredChannels = settings[GuildSettings.DisabledChannels];
			const oldLength = ignoredChannels.length;

			const channelID = (channel as TextChannel).id;
			const index = ignoredChannels.indexOf(channelID);
			if (index === -1) {
				ignoredChannels.push(channelID);
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

	private static hereOrTextChannelResolver = Args.make<TextChannel | NewsChannel>((argument, context) => {
		if (argument === 'here') return Args.ok(context.message.channel as TextChannel);
		return (Store.injectedContext.stores.get('arguments').get('textOrNewsChannelName') as IArgument<TextChannel | NewsChannel>).run(
			argument,
			context
		);
	});
}
