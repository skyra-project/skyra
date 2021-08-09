import { GuildEntity, GuildSettings, readSettings } from '#lib/database';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { minutes } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { RateLimitManager } from '@sapphire/ratelimits';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';

@ApplyOptions<ListenerOptions>({ event: Events.GuildUserMessage })
export class UserListener extends Listener {
	private readonly rateLimits = new RateLimitManager(minutes(1), 1);

	public async run(message: GuildMessage) {
		const [enabled, multiplier] = await readSettings(message.guild, (settings) => [
			this.isEnabled(message, settings),
			settings[GuildSettings.Social.Multiplier]
		]);

		if (!enabled) return;
		if (this.isRateLimited(message.author.id)) return;

		// If boosted guild, increase rewards
		const set = this.container.db;
		const { guildBoost } = await set.clients.ensure();
		const add = Math.round((Math.random() * 4 + 4) * (guildBoost.includes(message.guild.id) ? 1.5 : 1));

		this.container.client.emit(Events.GuildUserMessageSocialPointsAddUser, message, Math.round(add));
		this.container.client.emit(Events.GuildUserMessageSocialPointsAddMember, message, Math.round(add * multiplier));
	}

	/**
	 * Checks whether or not the settings enable running the handler for the specified message.
	 * @param message The message that ran the event.
	 * @param settings The settings to check the data from.
	 * @returns Whether or not the handler should run.
	 */
	private isEnabled(message: GuildMessage, settings: GuildEntity) {
		// If the social module is not enabled, return false:
		if (!settings[GuildSettings.Social.Enabled]) return false;

		// If the channel is ignored, return false:
		if (settings[GuildSettings.Social.IgnoredChannels].includes(message.channel.id)) return false;

		// If the role is ignored, return false:
		if (hasAtLeastOneKeyInMap(message.member.roles.cache, settings[GuildSettings.Social.IgnoredRoles])) return false;

		// Else, it's enabled, return true
		return true;
	}

	private isRateLimited(userId: string) {
		const rateLimit = this.rateLimits.acquire(userId);
		if (rateLimit.limited) return true;

		rateLimit.consume();
		return false;
	}
}
