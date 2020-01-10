import { Events } from '@lib/types/Enums';
import { Event } from 'klasa';
import { ModerationManagerEntry } from '@lib/structures/ModerationManagerEntry';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { DiscordAPIError, MessageEmbed, TextChannel, Message } from 'discord.js';
import { APIErrors, Moderation } from '@utils/constants';
import { CLIENT_ID } from '@root/config';

export default class extends Event {

	public run(entry: ModerationManagerEntry) {
		return Promise.all([
			this.sendMessage(entry),
			this.scheduleDuration(entry)
		]);
	}

	private async sendMessage(entry: ModerationManagerEntry) {
		const { channel } = entry;
		if (channel === null || !channel.postable || !channel.embedable) return;

		const messageEmbed = await entry.prepareEmbed();
		const previous = this.fetchModerationLogMessage(entry, channel);
		try {
			await (previous === null
				? channel.send(messageEmbed)
				: previous.edit(messageEmbed));
		} catch (error) {
			if (error instanceof DiscordAPIError && (error.code === APIErrors.MissingAccess || error.code === APIErrors.MissingPermissions)) {
				await entry.manager.guild.settings.reset(GuildSettings.Channels.ModerationLogs);
			}
		}
	}

	private fetchModerationLogMessage(entry: ModerationManagerEntry, channel: TextChannel) {
		if (entry.case === null) throw new TypeError('UNREACHABLE.');

		for (const message of channel.messages.values()) {
			if (this.validateModerationLogMessage(message, entry.case)) return message;
		}

		return null;
	}

	private validateModerationLogMessage(message: Message, caseID: number) {
		return message.author.id === CLIENT_ID
			&& message.attachments.size === 0
			&& message.embeds.length === 1
			&& this.validateModerationLogMessageEmbed(message.embeds[0])
			&& message.embeds[0].footer!.text === `Case ${caseID}`;
	}

	private validateModerationLogMessageEmbed(embed: MessageEmbed) {
		return embed.type === 'rich'
			&& this.validateModerationLogMessageEmbedAuthor(embed.author)
			&& this.validateModerationLogMessageEmbedDescription(embed.description)
			&& this.validateModerationLogMessageEmbedColor(embed.color)
			&& this.validateModerationLogMessageEmbedFooter(embed.footer)
			&& this.validateModerationLogMessageEmbedTimestamp(embed.timestamp);
	}

	private validateModerationLogMessageEmbedAuthor(author: MessageEmbed['author']) {
		return author !== null
			&& typeof author.name === 'string'
			&& /[^#]{2,32}#\d{4}/.test(author.name)
			&& typeof author.iconURL === 'string';
	}

	private validateModerationLogMessageEmbedDescription(description: MessageEmbed['description']) {
		return description.split('\n').length >= 3;
	}

	private validateModerationLogMessageEmbedColor(color: MessageEmbed['color']) {
		return typeof color === 'number';
	}

	private validateModerationLogMessageEmbedFooter(footer: MessageEmbed['footer']) {
		return footer !== null
			&& typeof footer.text === 'string'
			&& typeof footer.iconURL === 'string';
	}

	private validateModerationLogMessageEmbedTimestamp(timestamp: MessageEmbed['timestamp']) {
		return typeof timestamp === 'number';
	}

	private async scheduleDuration(entry: ModerationManagerEntry) {
		const previous = this.retrievePreviousSchedule(entry);
		if (previous !== null) await previous.delete();

		const taskName = entry.duration === null ? null : entry.appealTaskName;
		if (taskName !== null) {
			await this.client.schedule.create(taskName, entry.duration! + Date.now(), {
				catchUp: true,
				data: {
					[Moderation.SchemaKeys.Case]: entry.case,
					[Moderation.SchemaKeys.User]: entry.flattenedUser,
					[Moderation.SchemaKeys.Guild]: entry.manager.guild.id,
					[Moderation.SchemaKeys.Duration]: entry.duration
				}
			}).catch(error => this.client.emit(Events.Wtf, error));
		}
	}

	private retrievePreviousSchedule(entry: ModerationManagerEntry) {
		return this.client.schedule.tasks.find(task => task.data[Moderation.SchemaKeys.Case] === entry.case
			&& task.data[Moderation.SchemaKeys.Guild] === entry.guild.id) || null;
	}

}
