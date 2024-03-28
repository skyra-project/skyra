import { GuildSettings, writeSettings } from '#lib/database';
import type { ModerationManager } from '#lib/moderation';
import { getEmbed, getUndoTaskName } from '#lib/moderation/common';
import { resolveOnErrorCodes } from '#utils/common';
import { getModeration } from '#utils/functions';
import { SchemaKeys } from '#utils/moderationConstants';
import { canSendEmbeds } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { isNullishOrZero } from '@sapphire/utilities';
import { RESTJSONErrorCodes } from 'discord.js';

export class UserListener extends Listener {
	public run(entry: ModerationManager.Entry) {
		return Promise.all([this.sendMessage(entry), this.scheduleDuration(entry)]);
	}

	private async sendMessage(entry: ModerationManager.Entry) {
		const moderation = getModeration(entry.guild);
		const channel = await moderation.fetchChannel();
		if (channel === null || !canSendEmbeds(channel)) return;

		const t = await fetchT(entry.guild);
		const options = { embeds: [await getEmbed(t, entry)] };
		try {
			await resolveOnErrorCodes(channel.send(options), RESTJSONErrorCodes.MissingAccess, RESTJSONErrorCodes.MissingPermissions);
		} catch (error) {
			await writeSettings(entry.guild, [[GuildSettings.Channels.Logs.Moderation, null]]);
		}
	}

	private async scheduleDuration(entry: ModerationManager.Entry) {
		if (isNullishOrZero(entry.duration)) return;

		const taskName = getUndoTaskName(entry.type);
		if (taskName === null) return;

		await this.container.schedule
			.add(taskName, entry.expiresTimestamp!, {
				catchUp: true,
				data: {
					[SchemaKeys.Case]: entry.id,
					[SchemaKeys.User]: entry.userId,
					[SchemaKeys.Guild]: entry.guild.id,
					[SchemaKeys.Type]: entry.type,
					[SchemaKeys.Duration]: entry.duration,
					[SchemaKeys.ExtraData]: entry.extraData
				}
			})
			.catch((error) => this.container.logger.fatal(error));
	}
}
