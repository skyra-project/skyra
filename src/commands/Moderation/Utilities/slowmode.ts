import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types/Discord';
import { PermissionLevels } from '#lib/types/Enums';
import { Time } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { CreateResolvers } from '@skyra/decorators';
import type { TextChannel } from 'discord.js';

const MAXIMUM_TIME = (Time.Hour * 6) / 1000;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['sm'],
	bucket: 2,
	cooldown: 5,
	cooldownLevel: 'channel',
	description: LanguageKeys.Commands.Moderation.SlowmodeDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.SlowmodeExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['MANAGE_CHANNELS'],
	runIn: ['text'],
	usage: '<reset|off|seconds:integer|cooldown:cooldown>'
})
@CreateResolvers([
	['cooldown', async (arg, possible, message) => (await message.client.arguments.get('timespan')!.run(arg, possible, message)) / 1000]
])
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, [cooldown]: ['reset' | 'off' | number]) {
		const t = await message.fetchT();

		if (cooldown === 'reset' || cooldown === 'off' || cooldown < 0) cooldown = 0;
		else if (cooldown > MAXIMUM_TIME) throw t(LanguageKeys.Commands.Moderation.SlowmodeTooLong);
		const channel = message.channel as TextChannel;
		await channel.setRateLimitPerUser(cooldown);
		return cooldown === 0
			? message.send(t(LanguageKeys.Commands.Moderation.SlowmodeReset))
			: message.send(t(LanguageKeys.Commands.Moderation.SlowmodeSet, { cooldown: cooldown * 1000 }));
	}
}
