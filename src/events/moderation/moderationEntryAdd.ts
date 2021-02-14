import { GuildSettings, ModerationEntity } from '#lib/database';
import { Moderation } from '#utils/constants';
import { resolveOnErrorCodes } from '#utils/util';
import { Event } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';

export class UserEvent extends Event {
	public run(entry: ModerationEntity) {
		return Promise.all([this.sendMessage(entry), this.scheduleDuration(entry)]);
	}

	private async sendMessage(entry: ModerationEntity) {
		const channel = await entry.fetchChannel();
		if (channel === null || !channel.postable || !channel.embedable) return;

		const messageEmbed = await entry.prepareEmbed();
		try {
			await resolveOnErrorCodes(channel.send(messageEmbed), RESTJSONErrorCodes.MissingAccess, RESTJSONErrorCodes.MissingPermissions);
		} catch (error) {
			await entry.guild.writeSettings([[GuildSettings.Channels.ModerationLogs, null]]);
		}
	}

	private async scheduleDuration(entry: ModerationEntity) {
		const taskName = entry.duration === null ? null : entry.appealTaskName;
		if (taskName !== null) {
			await this.context.client.schedules
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
				.catch((error) => this.context.client.logger.fatal(error));
		}
	}
}
