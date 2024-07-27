import { writeSettingsTransaction } from '#lib/database';
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

		using trx = await writeSettingsTransaction(message.guild);

		const index = trx.settings.disabledChannels.indexOf(channel.id);
		const disabledChannels = index === -1 ? trx.settings.disabledChannels.concat(channel.id) : trx.settings.disabledChannels.toSpliced(index, 1);
		await trx.write({ disabledChannels }).submit();

		const added = index === -1;
		const contentKey = added ? LanguageKeys.Commands.Management.SetIgnoreChannelsSet : LanguageKeys.Commands.Management.SetIgnoreChannelsRemoved;
		const content = args.t(contentKey, { channel: channel.toString() });
		return send(message, content);
	}

	private static hereOrTextChannelResolver = Args.make<GuildTextBasedChannelTypes>((argument, context) => {
		if (argument === 'here') return Args.ok(context.message.channel as GuildTextBasedChannelTypes);
		return (container.stores.get('arguments').get('textOrNewsChannelName') as Argument<GuildTextBasedChannelTypes>).run(argument, context);
	});
}
