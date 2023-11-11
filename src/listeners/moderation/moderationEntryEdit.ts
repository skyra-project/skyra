import { GuildSettings, ModerationEntity, writeSettings } from '#lib/database';
import { resolveOnErrorCodes } from '#utils/common';
import { SchemaKeys } from '#utils/moderationConstants';
import { canSendEmbeds, type GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { RESTJSONErrorCodes, type Embed, type Message } from 'discord.js';

export class UserListener extends Listener {
	public run(old: ModerationEntity, entry: ModerationEntity) {
		return Promise.all([this.cancelTask(old, entry), this.sendMessage(old, entry), this.scheduleDuration(old, entry)]);
	}

	private async cancelTask(old: ModerationEntity, entry: ModerationEntity) {
		// If the task was invalidated or had its duration set to null, delete any pending task
		if ((!old.invalidated && entry.invalidated) || (old.duration !== null && entry.duration === null)) await entry.task?.delete();
	}

	private async sendMessage(old: ModerationEntity, entry: ModerationEntity) {
		// Handle invalidation
		if (!old.invalidated && entry.invalidated) return;

		// If both logs are equals, skip
		if (entry.equals(old)) return;

		const channel = await entry.fetchChannel();
		if (channel === null || !canSendEmbeds(channel)) return;

		const messageEmbed = await entry.prepareEmbed();
		const previous = this.fetchModerationLogMessage(entry, channel);

		const options = { embeds: [messageEmbed] };
		try {
			await resolveOnErrorCodes(
				previous === null ? channel.send(options) : previous.edit(options),
				RESTJSONErrorCodes.MissingAccess,
				RESTJSONErrorCodes.MissingPermissions
			);
		} catch (error) {
			await writeSettings(entry.guild, [[GuildSettings.Channels.Logs.Moderation, null]]);
		}
	}

	private fetchModerationLogMessage(entry: ModerationEntity, channel: GuildTextBasedChannelTypes) {
		if (entry.caseId === -1) throw new TypeError('UNREACHABLE.');

		for (const message of channel.messages.cache.values()) {
			if (this.validateModerationLogMessage(message, entry.caseId)) return message;
		}

		return null;
	}

	private validateModerationLogMessage(message: Message, caseId: number) {
		return (
			message.author.id === process.env.CLIENT_ID &&
			message.attachments.size === 0 &&
			message.embeds.length === 1 &&
			this.validateModerationLogMessageEmbed(message.embeds[0]) &&
			message.embeds[0].footer!.text === `Case ${caseId}`
		);
	}

	private validateModerationLogMessageEmbed(embed: Embed) {
		return (
			this.validateModerationLogMessageEmbedAuthor(embed.author) &&
			this.validateModerationLogMessageEmbedDescription(embed.description) &&
			this.validateModerationLogMessageEmbedColor(embed.color) &&
			this.validateModerationLogMessageEmbedFooter(embed.footer) &&
			this.validateModerationLogMessageEmbedTimestamp(embed.timestamp)
		);
	}

	private validateModerationLogMessageEmbedAuthor(author: Embed['author']) {
		return author !== null && typeof author.name === 'string' && /\(\d{17,19}\)^/.test(author.name) && typeof author.iconURL === 'string';
	}

	private validateModerationLogMessageEmbedDescription(description: Embed['description']) {
		return typeof description === 'string' && description.split('\n').length >= 3;
	}

	private validateModerationLogMessageEmbedColor(color: Embed['color']) {
		return typeof color === 'number';
	}

	private validateModerationLogMessageEmbedFooter(footer: Embed['footer']) {
		return footer !== null && typeof footer.text === 'string' && typeof footer.iconURL === 'string';
	}

	private validateModerationLogMessageEmbedTimestamp(timestamp: Embed['timestamp']) {
		return typeof timestamp === 'number';
	}

	private async scheduleDuration(old: ModerationEntity, entry: ModerationEntity) {
		if (old.duration === entry.duration) return;

		const previous = this.retrievePreviousSchedule(entry);
		if (previous !== null) await previous.delete();

		const taskName = entry.duration === null ? null : entry.appealTaskName;
		if (taskName !== null) {
			await this.container.schedule
				.add(taskName, entry.duration! + Date.now(), {
					catchUp: true,
					data: {
						[SchemaKeys.Case]: entry.caseId,
						[SchemaKeys.User]: entry.userId,
						[SchemaKeys.Guild]: entry.guildId,
						[SchemaKeys.Duration]: entry.duration
					}
				})
				.catch((error) => this.container.logger.fatal(error));
		}
	}

	private retrievePreviousSchedule(entry: ModerationEntity) {
		return (
			this.container.schedule.queue.find(
				(task) =>
					typeof task.data === 'object' &&
					task.data !== null &&
					task.data[SchemaKeys.Case] === entry.caseId &&
					task.data[SchemaKeys.Guild] === entry.guild.id
			) || null
		);
	}
}
