import { GuildSettings } from '#lib/database';
import { RateLimitManager } from '#lib/structures';
import { AsyncPreconditionResult, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	private readonly ratelimit = new RateLimitManager(30000, 1);

	public async run(message: Message): AsyncPreconditionResult {
		if (message.guild === null) return this.ok();

		const channelID = await message.guild.readSettings(GuildSettings.Channels.Spam);
		if (!channelID || channelID === message.channel.id) return this.ok();

		if (message.member!.isOwner() || (await message.member!.isModerator())) return this.ok();

		const channel = message.guild.channels.cache.get(channelID);
		if (!channel) {
			await message.guild.writeSettings([[GuildSettings.Channels.Spam, null]]);
			return this.ok();
		}

		const ratelimit = this.ratelimit.acquire(message.channel.id);
		if (ratelimit.limited) return this.error({});

		ratelimit.consume();
		return this.ok();
	}
}
