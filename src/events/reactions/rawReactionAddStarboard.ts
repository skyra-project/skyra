import { GuildSettings } from '#lib/database';
import { Events } from '#lib/types/Enums';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { ApplyOptions } from '@sapphire/decorators';
import type { TextChannel } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.RawReactionAdd })
export default class extends Event {
	public async run(data: LLRCData, emojiID: string) {
		if (data.channel.nsfw) return;

		const [channel, ignoreChannels, emoji, selfStar] = await data.guild.readSettings([
			GuildSettings.Starboard.Channel,
			GuildSettings.Starboard.IgnoreChannels,
			GuildSettings.Starboard.Emoji,
			GuildSettings.Starboard.SelfStar
		]);
		if (data.channel.id === channel || emojiID !== emoji) return;
		if (!channel || ignoreChannels.includes(data.channel.id)) return;

		const starboardChannel = data.guild.channels.cache.get(channel) as TextChannel | undefined;
		if (typeof starboardChannel === 'undefined' || !starboardChannel.postable) {
			await data.guild.writeSettings([[GuildSettings.Starboard.Channel, null]]);
			return;
		}

		// Process the starboard
		const { starboard } = data.guild;
		const sMessage = await starboard.fetch(data.channel, data.messageID);
		if (sMessage) await sMessage.increment(data.userID, selfStar);
	}
}
