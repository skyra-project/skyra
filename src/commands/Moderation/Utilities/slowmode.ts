import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types/Discord';
import { PermissionLevels } from '#lib/types/Enums';
import { hours, seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { TextChannel } from 'discord.js';

const MAXIMUM_DURATION = hours(6);

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['sm'],
	description: LanguageKeys.Commands.Moderation.SlowmodeDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.SlowmodeExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.ManageChannels],
	runIn: [CommandOptionsRunTypeEnum.GuildText]
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const cooldown = await args
			.pick('reset')
			.then(() => 0)
			.catch(() => args.rest('timespan', { minimum: 0, maximum: MAXIMUM_DURATION }));

		const channel = message.channel as TextChannel;
		await channel.setRateLimitPerUser(seconds.fromMilliseconds(cooldown));

		const content =
			cooldown === 0
				? args.t(LanguageKeys.Commands.Moderation.SlowmodeReset)
				: args.t(LanguageKeys.Commands.Moderation.SlowmodeSet, { cooldown });

		return send(message, content);
	}
}
