import { GuildSettings, ModerationEntity, writeSettings } from '#lib/database';
import { resolveOnErrorCodes } from '#utils/common';
import { canSendEmbeds } from '#utils/functions';
import { SchemaKeys } from '#utils/moderationConstants';
import { Event } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';

export class UserEvent extends Event {
	public run(entry: ModerationEntity) {
		return Promise.all([this.sendMessage(entry), this.scheduleDuration(entry)]);
	}

	private async sendMessage(entry: ModerationEntity) {
		const channel = await entry.fetchChannel();
		if (channel === null || !canSendEmbeds(channel)) return;

		const messageEmbed = await entry.prepareEmbed();
		try {
			await resolveOnErrorCodes(channel.send(messageEmbed), RESTJSONErrorCodes.MissingAccess, RESTJSONErrorCodes.MissingPermissions);
		} catch (error) {
			await writeSettings(entry.guild, [[GuildSettings.Channels.Logs.Moderation, null]]);
		}
	}

	private async scheduleDuration(entry: ModerationEntity) {
		const taskName = entry.duration === null ? null : entry.appealTaskName;
		if (taskName !== null) {
			await this.context.schedule
				.add(taskName, entry.duration! + Date.now(), {
					catchUp: true,
					data: {
						[SchemaKeys.Case]: entry.caseID,
						[SchemaKeys.User]: entry.userID,
						[SchemaKeys.Guild]: entry.guildID,
						[SchemaKeys.Duration]: entry.duration,
						[SchemaKeys.ExtraData]: entry.extraData
					}
				})
				.catch((error) => this.context.client.logger.fatal(error));
		}
	}
}
