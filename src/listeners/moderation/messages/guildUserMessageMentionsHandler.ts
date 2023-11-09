import { GuildSettings, readSettings } from '#lib/database';
import { Events, type GuildMessage } from '#lib/types';
import { isModerator } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNullishOrZero } from '@sapphire/utilities';

@ApplyOptions<Listener.Options>({ event: Events.GuildUserMessage })
export class UserListener extends Listener {
	public async run(message: GuildMessage) {
		if (!isNullishOrZero(message.editedTimestamp)) return;
		if (await isModerator(message.member)) return;

		const [enabled, globalIgnore, alerts, ratelimits] = await readSettings(message.guild, (settings) => [
			settings[GuildSettings.Selfmod.NoMentionSpam.Enabled],
			settings[GuildSettings.Selfmod.IgnoreChannels],
			settings[GuildSettings.Selfmod.NoMentionSpam.Alerts],
			settings.nms
		]);
		if (!enabled) return;
		if (globalIgnore.includes(message.channel.id)) return;

		const mentions =
			message.mentions.users.reduce((acc, user) => (user.bot || user === message.author ? acc : acc + 1), 0) +
			message.mentions.roles.size * message.client.options.nms!.role! +
			Number(message.mentions.everyone) * message.client.options.nms!.everyone!;

		if (mentions === 0) return;

		const rateLimit = ratelimits.acquire(message.author.id);

		try {
			for (let i = 0; i < mentions; i++) rateLimit.consume();
			// Reset time, don't let them relax
			rateLimit.resetTime();
			// eslint-disable-next-line @typescript-eslint/dot-notation
			if (alerts && rateLimit['remaining'] / rateLimit.remaining <= 0.2) {
				message.client.emit(Events.MentionSpamWarning, message);
			}
		} catch (err) {
			message.client.emit(Events.MentionSpamExceeded, message);
		}
	}
}
