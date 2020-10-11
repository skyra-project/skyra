import { ModerationEntity } from '@lib/database/entities/ModerationEntity';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { CLIENT_ID } from '@root/config';
import { Moderation } from '@utils/constants';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
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

		const { channel } = entry;
		if (channel === null || !channel.postable || !channel.embedable) return;

		const messageEmbed = await entry.prepareEmbed();
		const previous = this.fetchModerationLogMessage(entry, channel);
		try {
			await (previous === null ? channel.send(messageEmbed) : previous.edit(messageEmbed));
		} catch (error) {
			if (
				error instanceof DiscordAPIError &&
				(error.code === RESTJSONErrorCodes.MissingAccess || error.code === RESTJSONErrorCodes.MissingPermissions)
			) {
				await entry.guild.settings.reset(GuildSettings.Channels.ModerationLogs);
			}
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
			message.author.id === CLIENT_ID &&
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
			await this.client.schedules
				.add(taskName, entry.duration! + Date.now(), {
					catchUp: true,
					data: {
						[Moderation.SchemaKeys.Case]: entry.caseID,
						[Moderation.SchemaKeys.User]: entry.userID,
						[Moderation.SchemaKeys.Guild]: entry.guildID,
						[Moderation.SchemaKeys.Duration]: entry.duration
					}
				})
				.catch((error) => this.client.emit(Events.Wtf, error));
		}
	}

	private retrievePreviousSchedule(entry: ModerationEntity) {
		return (
			this.client.schedules.queue.find(
				(task) =>
					typeof task.data === 'object' &&
					task.data !== null &&
					task.data[Moderation.SchemaKeys.Case] === entry.caseID &&
					task.data[Moderation.SchemaKeys.Guild] === entry.guild.id
			) || null
		);
	}
}
