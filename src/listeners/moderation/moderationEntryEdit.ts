import { GuildSettings, writeSettings } from '#lib/database';
import type { ModerationManager } from '#lib/moderation';
import { getEmbed, getUndoTaskName } from '#lib/moderation/common';
import { resolveOnErrorCodes } from '#utils/common';
import { getModeration } from '#utils/functions';
import { SchemaKeys } from '#utils/moderationConstants';
import { canSendEmbeds, type GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { isNullish, isNumber } from '@sapphire/utilities';
import { RESTJSONErrorCodes, type Embed, type Message } from 'discord.js';

export class UserListener extends Listener {
	public run(old: ModerationManager.Entry, entry: ModerationManager.Entry) {
		return Promise.all([this.scheduleDuration(old, entry), this.sendMessage(old, entry)]);
	}

	private async scheduleDuration(old: ModerationManager.Entry, entry: ModerationManager.Entry) {
		// If the entry has been archived in this update, delete the task:
		if (entry.isArchived()) {
			await entry.task?.delete();
			return;
		}

		if (old.duration === entry.duration) return;

		const { task } = entry;
		if (isNullish(task)) {
			if (entry.duration !== null) await this.#createNewTask(entry);
		} else if (entry.duration === null) {
			// If the new duration is null, delete the previous task:
			await task.delete();
		} else {
			// If the new duration is not null, reschedule the previous task:
			await task.reschedule(entry.expiresTimestamp!);
		}
	}

	private async sendMessage(old: ModerationManager.Entry, entry: ModerationManager.Entry) {
		// Handle invalidation
		if (this.#isArchiveUpdate(old, entry)) return;

		const moderation = getModeration(entry.guild);
		const channel = await moderation.fetchChannel();
		if (channel === null || !canSendEmbeds(channel)) return;

		const t = await fetchT(entry.guild);
		const previous = this.fetchModerationLogMessage(entry, channel);
		const options = { embeds: [await getEmbed(t, entry)] };
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

	private fetchModerationLogMessage(entry: ModerationManager.Entry, channel: GuildTextBasedChannelTypes) {
		for (const message of channel.messages.cache.values()) {
			if (this.validateModerationLogMessage(message, entry.id)) return message;
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
		return isNumber(color);
	}

	private validateModerationLogMessageEmbedFooter(footer: Embed['footer']) {
		return footer !== null && typeof footer.text === 'string' && typeof footer.iconURL === 'string';
	}

	private validateModerationLogMessageEmbedTimestamp(timestamp: Embed['timestamp']) {
		return isNumber(timestamp);
	}

	#isArchiveUpdate(old: ModerationManager.Entry, entry: ModerationManager.Entry) {
		return !old.isArchived() && entry.isArchived();
	}

	async #createNewTask(entry: ModerationManager.Entry) {
		const taskName = getUndoTaskName(entry.type);
		if (isNullish(taskName)) return;

		await this.container.schedule.add(taskName, entry.expiresTimestamp!, {
			catchUp: true,
			data: {
				[SchemaKeys.Case]: entry.id,
				[SchemaKeys.User]: entry.userId,
				[SchemaKeys.Guild]: entry.guild.id,
				[SchemaKeys.Type]: entry.type,
				[SchemaKeys.Duration]: entry.duration,
				[SchemaKeys.ExtraData]: entry.extraData
			}
		});
	}
}
