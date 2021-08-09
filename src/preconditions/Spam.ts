import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isGuildMessage, seconds } from '#utils/common';
import { isModerator, isOwner } from '#utils/functions';
import { AsyncPreconditionResult, Precondition } from '@sapphire/framework';
import { RateLimitManager } from '@sapphire/ratelimits';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	private readonly ratelimit = new RateLimitManager(seconds(30), 1);

	public async run(message: Message): AsyncPreconditionResult {
		if (!isGuildMessage(message)) return this.ok();

		const channelId = await readSettings(message.guild, GuildSettings.Channels.Spam);
		if (!channelId || channelId === message.channel.id) return this.ok();

		if (isOwner(message.member) || (await isModerator(message.member))) return this.ok();

		const channel = message.guild.channels.cache.get(channelId);
		if (!channel) {
			await writeSettings(message.guild, [[GuildSettings.Channels.Spam, null]]);
			return this.ok();
		}

		const ratelimit = this.ratelimit.acquire(message.channel.id);
		if (ratelimit.limited) return this.error({ identifier: LanguageKeys.Preconditions.Spam, context: { channel: channel.toString() } });

		ratelimit.consume();
		return this.ok();
	}
}
