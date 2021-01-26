import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types/Discord';
import { PermissionLevels } from '#lib/types/Enums';
import { Time } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import type { TextChannel } from 'discord.js';

const MAXIMUM_DURATION = Time.Hour * 6;
const MAXIMUM_SECONDS = MAXIMUM_DURATION / Time.Second;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['sm'],
	bucket: 2,
	cooldown: 5,
	description: LanguageKeys.Commands.Moderation.SlowmodeDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.SlowmodeExtended,
	permissionLevel: PermissionLevels.Moderator,
	permissions: ['MANAGE_CHANNELS'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const cooldown = await args
			.pick('reset')
			.then(() => 0)
			.catch(() => args.pick('integer', { minimum: 1, maximum: MAXIMUM_SECONDS }))
			.catch(() => args.rest('timespan', { minimum: 1, maximum: MAXIMUM_DURATION }))
			.then((value) => Math.trunc(value / 1000));

		const channel = message.channel as TextChannel;
		await channel.setRateLimitPerUser(cooldown);
		return cooldown === 0
			? message.send(args.t(LanguageKeys.Commands.Moderation.SlowmodeReset))
			: message.send(args.t(LanguageKeys.Commands.Moderation.SlowmodeSet, { cooldown: cooldown * 1000 }));
	}
}
