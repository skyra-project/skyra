import { GuildSettings } from '#lib/database';
import { GuildMessage } from '#lib/types';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { isNullishOrZero } from '#utils/comparators';
import { ApplyOptions } from '@skyra/decorators';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.GuildUserMessage })
export default class extends Event {
	public async run(message: GuildMessage) {
		if (!isNullishOrZero(message.editedTimestamp)) return;
		if (await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator)) return;

		const [enabled, globalIgnore, alerts, ratelimits] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Selfmod.NoMentionSpam.Enabled],
			settings[GuildSettings.Selfmod.IgnoreChannels],
			settings[GuildSettings.Selfmod.NoMentionSpam.Alerts],
			settings.nms
		]);
		if (!enabled) return;
		if (globalIgnore.includes(message.channel.id)) return;

		const mentions =
			message.mentions.users.reduce((acc, user) => (user.bot || user === message.author ? acc : acc + 1), 0) +
			message.mentions.roles.size * this.client.options.nms.role! +
			Number(message.mentions.everyone) * this.client.options.nms.everyone!;

		if (mentions === 0) return;

		const rateLimit = ratelimits.acquire(message.author.id);

		try {
			for (let i = 0; i < mentions; i++) rateLimit.drip();
			// Reset time, don't let them relax
			rateLimit.resetTime();
			// eslint-disable-next-line @typescript-eslint/dot-notation
			if (alerts && rateLimit['remaining'] / rateLimit.bucket <= 0.2) {
				this.client.emit(Events.MentionSpamWarning, message);
			}
		} catch (err) {
			this.client.emit(Events.MentionSpamExceeded, message);
		}
	}
}
