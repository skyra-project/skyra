import { ModerationEntity } from '@lib/database/entities/ModerationEntity';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { Moderation } from '@utils/constants';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(entry: ModerationEntity) {
		return Promise.all([this.sendMessage(entry), this.scheduleDuration(entry)]);
	}

	private async sendMessage(entry: ModerationEntity) {
		const { channel } = entry;
		if (channel === null || !channel.postable || !channel.embedable) return;

		const messageEmbed = await entry.prepareEmbed();
		try {
			await channel.send(messageEmbed);
		} catch (error) {
			if (
				error instanceof DiscordAPIError &&
				(error.code === RESTJSONErrorCodes.MissingAccess || error.code === RESTJSONErrorCodes.MissingPermissions)
			) {
				await entry.guild.settings.reset(GuildSettings.Channels.ModerationLogs);
			}
		}
	}

	private async scheduleDuration(entry: ModerationEntity) {
		const taskName = entry.duration === null ? null : entry.appealTaskName;
		if (taskName !== null) {
			await this.client.schedules
				.add(taskName, entry.duration! + Date.now(), {
					catchUp: true,
					data: {
						[Moderation.SchemaKeys.Case]: entry.caseID,
						[Moderation.SchemaKeys.User]: entry.userID,
						[Moderation.SchemaKeys.Guild]: entry.guildID,
						[Moderation.SchemaKeys.Duration]: entry.duration,
						[Moderation.SchemaKeys.ExtraData]: entry.extraData
					}
				})
				.catch((error) => this.client.emit(Events.Wtf, error));
		}
	}
}
