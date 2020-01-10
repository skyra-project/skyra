import { Events } from '@lib/types/Enums';
import { Event } from 'klasa';
import { ModerationManagerEntry } from '@lib/structures/ModerationManagerEntry';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { DiscordAPIError } from 'discord.js';
import { APIErrors, Moderation } from '@utils/constants';

export default class extends Event {

	public run(entry: ModerationManagerEntry) {
		return Promise.all([
			this.sendMessage(entry),
			this.scheduleDuration(entry)
		]);
	}

	private async sendMessage(entry: ModerationManagerEntry) {
		const { channel } = entry;
		if (channel === null || !channel.postable || !channel.embedable) return;

		const messageEmbed = await entry.prepareEmbed();
		try {
			await channel.send(messageEmbed);
		} catch (error) {
			if (error instanceof DiscordAPIError && (error.code === APIErrors.MissingAccess || error.code === APIErrors.MissingPermissions)) {
				await entry.manager.guild.settings.reset(GuildSettings.Channels.ModerationLogs);
			}
		}
	}

	private async scheduleDuration(entry: ModerationManagerEntry) {
		const taskName = entry.duration === null ? null : entry.appealTaskName;
		if (taskName !== null) {
			await this.client.schedule.create(taskName, entry.duration! + Date.now(), {
				catchUp: true,
				data: {
					[Moderation.SchemaKeys.Case]: entry.case,
					[Moderation.SchemaKeys.User]: entry.flattenedUser,
					[Moderation.SchemaKeys.Guild]: entry.manager.guild.id,
					[Moderation.SchemaKeys.Duration]: entry.duration
				}
			}).catch(error => this.client.emit(Events.Wtf, error));
		}
	}

}
