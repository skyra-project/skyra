import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RateLimitManager } from '#lib/structures';
import { AsyncPreconditionResult, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	private readonly ratelimit = new RateLimitManager(30000, 1);

	public async run(message: Message): AsyncPreconditionResult {
		if (message.guild === null) return this.ok();

		const channelID = await readSettings(message.guild, GuildSettings.Channels.Spam);
		if (!channelID || channelID === message.channel.id) return this.ok();

		if (message.member!.isOwner() || (await message.member!.isModerator())) return this.ok();

		const channel = message.guild.channels.cache.get(channelID);
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
