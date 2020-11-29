import { GuildSettings, ModerationEntity } from '#lib/database';
import { Events } from '#lib/types/Enums';
import { Moderation } from '#utils/constants';
import { resolveOnErrorCodes } from '#utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Event } from 'klasa';

export default class extends Event {
	public run(entry: ModerationEntity) {
		return Promise.all([this.send(entry), this.scheduleDuration(entry)]);
	}

	private async send(entry: ModerationEntity) {
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
