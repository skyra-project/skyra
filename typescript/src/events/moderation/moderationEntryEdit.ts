import { GuildSettings, ModerationEntity, writeSettings } from '#lib/database';
import { resolveOnErrorCodes } from '#utils/common';
import { canSendEmbeds } from '#utils/functions';
import { SchemaKeys } from '#utils/moderationConstants';
import { Event } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import type { Message, MessageEmbed, TextChannel } from 'discord.js';

export class UserEvent extends Event {
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
		try {
			await resolveOnErrorCodes(
				previous === null ? channel.send(messageEmbed) : previous.edit(messageEmbed),
				RESTJSONErrorCodes.MissingAccess,
				RESTJSONErrorCodes.MissingPermissions
			);
		} catch (error) {
			await writeSettings(entry.guild, [[GuildSettings.Channels.Logs.Moderation, null]]);
		}
	}

	private fetchModerationLogMessage(entry: ModerationEntity, channel: TextChannel) {
		if (entry.caseID === -1) throw new TypeError('UNREACHABLE.');

		for (const message of channel.messages.cache.values()) {
			if (this.validateModerationLogMessage(message, entry.caseID)) return message;
		}

		return null;
	}

	private validateModerationLogMessage(message: Message, caseID: number) {
		return (
			message.author.id === process.env.CLIENT_ID &&
			message.attachments.size === 0 &&
			message.embeds.length === 1 &&
			this.validateModerationLogMessageEmbed(message.embeds[0]) &&
			message.embeds[0].footer!.text === `Case ${caseID}`
		);
	}

	private validateModerationLogMessageEmbed(embed: MessageEmbed) {
		return (
			embed.type === 'rich' &&
			this.validateModerationLogMessageEmbedAuthor(embed.author) &&
			this.validateModerationLogMessageEmbedDescription(embed.description) &&
			this.validateModerationLogMessageEmbedColor(embed.color) &&
			this.validateModerationLogMessageEmbedFooter(embed.footer) &&
			this.validateModerationLogMessageEmbedTimestamp(embed.timestamp)
		);
	}

	private validateModerationLogMessageEmbedAuthor(author: MessageEmbed['author']) {
		return author !== null && typeof author.name === 'string' && /[^#]{2,32}#\d{4}/.test(author.name) && typeof author.iconURL === 'string';
	}

	private validateModerationLogMessageEmbedDescription(description: MessageEmbed['description']) {
		return typeof description === 'string' && description.split('\n').length >= 3;
	}

	private validateModerationLogMessageEmbedColor(color: MessageEmbed['color']) {
		return typeof color === 'number';
	}

	private validateModerationLogMessageEmbedFooter(footer: MessageEmbed['footer']) {
		return footer !== null && typeof footer.text === 'string' && typeof footer.iconURL === 'string';
	}

	private validateModerationLogMessageEmbedTimestamp(timestamp: MessageEmbed['timestamp']) {
		return typeof timestamp === 'number';
	}

	private async scheduleDuration(old: ModerationEntity, entry: ModerationEntity) {
		if (old.duration === entry.duration) return;

		const previous = this.retrievePreviousSchedule(entry);
		if (previous !== null) await previous.delete();

		const taskName = entry.duration === null ? null : entry.appealTaskName;
		if (taskName !== null) {
			await this.context.schedule
				.add(taskName, entry.duration! + Date.now(), {
					catchUp: true,
					data: {
						[SchemaKeys.Case]: entry.caseID,
						[SchemaKeys.User]: entry.userID,
						[SchemaKeys.Guild]: entry.guildID,
						[SchemaKeys.Duration]: entry.duration
					}
				})
				.catch((error) => this.context.client.logger.fatal(error));
		}
	}

	private retrievePreviousSchedule(entry: ModerationEntity) {
		return (
			this.context.schedule.queue.find(
				(task) =>
					typeof task.data === 'object' &&
					task.data !== null &&
					task.data[SchemaKeys.Case] === entry.caseID &&
					task.data[SchemaKeys.Guild] === entry.guild.id
			) || null
		);
	}
}
