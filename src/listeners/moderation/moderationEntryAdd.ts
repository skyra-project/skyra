import { GuildSettings, ModerationEntity, writeSettings } from '#lib/database';
import { resolveOnErrorCodes } from '#utils/common';
import { SchemaKeys } from '#utils/moderationConstants';
import { canSendEmbeds } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord.js';

export class UserListener extends Listener {
	public run(entry: ModerationEntity) {
		return Promise.all([this.sendMessage(entry), this.scheduleDuration(entry)]);
	}

	private async sendMessage(entry: ModerationEntity) {
		const channel = await entry.fetchChannel();
		if (channel === null || !canSendEmbeds(channel)) return;

		const messageEmbed = await entry.prepareEmbed();

		const options = { embeds: [messageEmbed] };
		try {
			await resolveOnErrorCodes(channel.send(options), RESTJSONErrorCodes.MissingAccess, RESTJSONErrorCodes.MissingPermissions);
		} catch (error) {
			await writeSettings(entry.guild, [[GuildSettings.Channels.Logs.Moderation, null]]);
		}
	}

	private async scheduleDuration(entry: ModerationEntity) {
		const taskName = entry.duration === null ? null : entry.appealTaskName;
		if (taskName !== null) {
			await this.container.schedule
				.add(taskName, entry.duration! + Date.now(), {
					catchUp: true,
					data: {
						[SchemaKeys.Case]: entry.caseId,
						[SchemaKeys.User]: entry.userId,
						[SchemaKeys.Guild]: entry.guildId,
						[SchemaKeys.Duration]: entry.duration,
						[SchemaKeys.ExtraData]: entry.extraData
					}
				})
				.catch((error) => this.container.logger.fatal(error));
		}
	}
}
