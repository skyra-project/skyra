import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { Events } from '#lib/types/Enums';
import { canSendMessages } from '#utils/functions';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { snowflakeAge } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { isNullishOrZero } from '@sapphire/utilities';
import type { TextChannel } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.RawReactionAdd })
export class UserEvent extends Event {
	public async run(data: LLRCData, emojiID: string) {
		if (data.channel.nsfw) return;

		const [channel, ignoreChannels, emoji, selfStar, maximumAge] = await readSettings(data.guild, [
			GuildSettings.Starboard.Channel,
			GuildSettings.Starboard.IgnoreChannels,
			GuildSettings.Starboard.Emoji,
			GuildSettings.Starboard.SelfStar,
			GuildSettings.Starboard.MaximumAge
		]);

		// If there is no channel, or channel is the starboard channel, or the emoji isn't the starboard one, skip:
		if (!channel || data.channel.id === channel || emojiID !== emoji) return;

		// If the message is too old, skip:
		if (!isNullishOrZero(maximumAge) && snowflakeAge(data.messageID) > maximumAge) return;

		// If the channel is ignored, skip:
		if (ignoreChannels.includes(data.channel.id)) return;

		const starboardChannel = data.guild.channels.cache.get(channel) as TextChannel | undefined;
		if (typeof starboardChannel === 'undefined' || !canSendMessages(starboardChannel)) {
			await writeSettings(data.guild, [[GuildSettings.Starboard.Channel, null]]);
			return;
		}

		// Process the starboard
		const { starboard } = data.guild;
		const sMessage = await starboard.fetch(data.channel, data.messageID);
		if (sMessage) await sMessage.increment(data.userID, selfStar);
	}
}
