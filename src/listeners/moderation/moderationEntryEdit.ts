import { ScheduleEntity, writeSettings } from '#lib/database';
import type { ModerationManager } from '#lib/moderation';
import { getEmbed, getUndoTaskName } from '#lib/moderation/common';
import type { GuildMessage } from '#lib/types';
import { resolveOnErrorCodes } from '#utils/common';
import { getModeration } from '#utils/functions';
import { SchemaKeys } from '#utils/moderationConstants';
import { isUserSelf } from '#utils/util';
import { canSendEmbeds, type GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { DiscordAPIError, RESTJSONErrorCodes, type Collection, type Embed, type Message, type Snowflake } from 'discord.js';

export class UserListener extends Listener {
	public run(old: ModerationManager.Entry, entry: ModerationManager.Entry) {
		return Promise.all([this.scheduleDuration(old, entry), this.sendMessage(old, entry)]);
	}

	private async scheduleDuration(old: ModerationManager.Entry, entry: ModerationManager.Entry) {
		// If the entry has been archived in this update, delete the task:
		if (entry.isArchived() || entry.isCompleted()) {
			await this.#tryDeleteTask(entry.task);
			return;
		}

		if (old.duration === entry.duration) return;

		const { task } = entry;
		if (isNullish(task)) {
			if (entry.duration !== null) await this.#createNewTask(entry);
		} else if (entry.duration === null) {
			// If the new duration is null, delete the previous task:
			await this.#tryDeleteTask(task);
		} else {
			// If the new duration is not null, reschedule the previous task:
			await task.reschedule(entry.expiresTimestamp!);
		}
	}

	private async sendMessage(old: ModerationManager.Entry, entry: ModerationManager.Entry) {
		if (entry.isArchived() || this.#isCompleteUpdate(old, entry)) return;

		const moderation = getModeration(entry.guild);
		const channel = await moderation.fetchChannel();
		if (channel === null || !canSendEmbeds(channel)) return;

		const t = await fetchT(entry.guild);
		const previous = await this.fetchModerationLogMessage(entry, channel);
		const options = { embeds: [await getEmbed(t, entry)] };
		try {
			await resolveOnErrorCodes(
				previous === null ? channel.send(options) : previous.edit(options),
				RESTJSONErrorCodes.MissingAccess,
				RESTJSONErrorCodes.MissingPermissions
			);
		} catch (error) {
			await writeSettings(entry.guild, { channelsLogsModeration: null });
		}
	}

	private async fetchModerationLogMessage(entry: ModerationManager.Entry, channel: GuildTextBasedChannelTypes) {
		const messages = await this.fetchChannelMessages(channel);
		for (const message of messages.values()) {
			if (this.#validateModerationLogMessage(message, entry.id)) return message;
		}

		return null;
	}

	/**
	 * Fetch 100 messages from the modlogs channel
	 */
	private async fetchChannelMessages(channel: GuildTextBasedChannelTypes, remainingRetries = 5): Promise<Collection<Snowflake, GuildMessage>> {
		try {
			return (await channel.messages.fetch({ limit: 100 })) as Collection<Snowflake, GuildMessage>;
		} catch (error) {
			if (error instanceof DiscordAPIError) throw error;
			return this.fetchChannelMessages(channel, --remainingRetries);
		}
	}

	#isCompleteUpdate(old: ModerationManager.Entry, entry: ModerationManager.Entry) {
		return !old.isCompleted() && entry.isCompleted();
	}

	async #tryDeleteTask(task: ScheduleEntity | null) {
		if (!isNullish(task) && !task.running) await task.delete();
	}

	#validateModerationLogMessage(message: Message, caseId: number) {
		return (
			isUserSelf(message.author.id) &&
			message.attachments.size === 0 &&
			message.embeds.length === 1 &&
			this.#validateModerationLogMessageEmbed(message.embeds[0]) &&
			message.embeds[0].footer!.text.includes(caseId.toString())
		);
	}

	#validateModerationLogMessageEmbed(embed: Embed) {
		return (
			this.#validateModerationLogMessageEmbedAuthor(embed.author) &&
			this.#validateModerationLogMessageEmbedDescription(embed.description) &&
			this.#validateModerationLogMessageEmbedColor(embed.color) &&
			this.#validateModerationLogMessageEmbedFooter(embed.footer) &&
			this.#validateModerationLogMessageEmbedTimestamp(embed.timestamp)
		);
	}

	#validateModerationLogMessageEmbedAuthor(author: Embed['author']) {
		return author !== null && typeof author.name === 'string' && /\(\d{17,19}\)$/.test(author.name) && typeof author.iconURL === 'string';
	}

	#validateModerationLogMessageEmbedDescription(description: Embed['description']) {
		return typeof description === 'string' && description.split('\n').length >= 3;
	}

	#validateModerationLogMessageEmbedColor(color: Embed['color']) {
		return !isNullish(color);
	}

	#validateModerationLogMessageEmbedFooter(footer: Embed['footer']) {
		return footer !== null && typeof footer.text === 'string' && typeof footer.iconURL === 'string';
	}

	#validateModerationLogMessageEmbedTimestamp(timestamp: Embed['timestamp']) {
		return !isNullish(timestamp);
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
