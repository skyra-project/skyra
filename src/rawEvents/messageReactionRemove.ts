import { TextChannel } from 'discord.js';
import { RawEvent } from '../lib/structures/RawEvent';
import { WSMessageReactionRemove } from '../lib/types/Discord';
import { GuildSettings } from '../lib/types/namespaces/GuildSettings';
import { resolveEmoji } from '../lib/util/util';

export default class extends RawEvent {

	public async run(data: WSMessageReactionRemove): Promise<void> {
		const channel = this.client.channels.get(data.channel_id) as TextChannel;
		if (!channel || channel.type !== 'text' || !channel.readable) return;

		if (channel.id === channel.guild.settings.get('channels.roles')) {
			try {
				await this.handleRoleChannel(channel, data);
			} catch (error) {
				this.client.emit('wtf', error);
			}
		}
	}

	public async handleRoleChannel(channel: TextChannel, data: WSMessageReactionRemove): Promise<void> {
		const messageReaction = channel.guild.settings.get('roles.messageReaction');
		if (!messageReaction || messageReaction !== data.message_id) return;

		const parsed = resolveEmoji(data.emoji);
		if (!parsed) return;

		const roleEntry = (channel.guild.settings.get(GuildSettings.Roles.Reactions) as GuildSettings.Roles.Reactions)
			.find((entry) => entry.emoji === parsed);
		if (!roleEntry) return;

		try {
			const member = await channel.guild.members.fetch(data.user_id);
			if (member.roles.has(roleEntry.role)) await member.roles.remove(roleEntry.role);
		} catch (error) {
			this.client.emit('apiError', error);
		}
	}

}
