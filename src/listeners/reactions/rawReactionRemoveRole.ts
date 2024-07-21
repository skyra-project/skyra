import { readSettings } from '#lib/database';
import { Events } from '#lib/types';
import { resolveEmojiId } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import type { GatewayMessageReactionRemoveDispatch, TextChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.RawReactionRemove })
export class UserListener extends Listener {
	public async run(channel: TextChannel, data: GatewayMessageReactionRemoveDispatch['d']) {
		// If the channel is not a text channel then stop processing
		if (!isGuildBasedChannel(channel)) return;

		const emojiId = resolveEmojiId(data.emoji);
		const settings = await readSettings(channel.guild);
		const roleEntry = settings.reactionRoles.find(
			(entry) =>
				resolveEmojiId(entry.emoji) === emojiId &&
				entry.channel === data.channel_id &&
				(entry.message ? entry.message === data.message_id : true)
		);
		if (!roleEntry) return;

		try {
			const member = await channel.guild.members.fetch(data.user_id);
			if (member.roles.cache.has(roleEntry.role)) await member.roles.remove(roleEntry.role);
		} catch (error) {
			this.container.client.emit(Events.Error, error);
		}
	}
}
