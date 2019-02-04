import { TextChannel } from 'discord.js';
import { RawEvent } from '../lib/structures/RawEvent';
import { WSMessageReactionRemove } from '../lib/types/Discord';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/namespaces/GuildSettings';
import { resolveEmoji } from '../lib/util/util';

export default class extends RawEvent {

	public async run(data: WSMessageReactionRemove) {
		const channel = this.client.channels.get(data.channel_id) as TextChannel;
		if (!channel || channel.type !== 'text' || !channel.readable) return;

		if (channel.id === channel.guild.settings.get(GuildSettings.Channels.Roles)) {
			try {
				await this.handleRoleChannel(channel, data);
			} catch (error) {
				this.client.emit(Events.Wtf, error);
			}
		}
	}

	private async handleRoleChannel(channel: TextChannel, data: WSMessageReactionRemove) {
		const messageReaction = channel.guild.settings.get(GuildSettings.Roles.MessageReaction) as GuildSettings.Roles.MessageReaction;
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
			this.client.emit(Events.ApiError, error);
		}
	}

}
