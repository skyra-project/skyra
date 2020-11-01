import { GuildMessage } from '@lib/types';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { Monitor } from 'klasa';

export default class extends Monitor {
	public async run(message: GuildMessage) {
		if (!message.guild || !(await message.guild!.readSettings(GuildSettings.Selfmod.NoMentionSpam.Enabled))) return;

		const mentions =
			message.mentions.users.filter((user) => !user.bot && user !== message.author).size +
			message.mentions.roles.size * this.client.options.nms.role! +
			Number(message.mentions.everyone) * this.client.options.nms.everyone!;

		if (!mentions) return;

		const rateLimit = message.guild.security.nms.acquire(message.author.id);

		try {
			for (let i = 0; i < mentions; i++) rateLimit.drip();
			// Reset time, don't let them relax
			rateLimit.resetTime();
			// @ts-expect-error 2341
			if (message.guild.settings.get(GuildSettings.NoMentionSpam.Alerts) && rateLimit.remaining / rateLimit.bucket < 0.2) {
				this.client.emit(Events.MentionSpamWarning, message);
			}
		} catch (err) {
			this.client.emit(Events.MentionSpamExceeded, message);
		}
	}
}
