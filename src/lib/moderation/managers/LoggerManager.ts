import { writeSettings, type GuildSettingsOfType } from '#lib/database';
import { LoggerTypeManager, type LoggerTypeContext } from '#lib/moderation/managers/LoggerTypeManager';
import { toErrorCodeResult } from '#utils/common';
import { getCodeStyle, getLogPrefix } from '#utils/functions/pieces';
import { EmbedBuilder } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import { isFunction, isNullish, isNullishOrEmpty, type Awaitable, type Nullish } from '@sapphire/utilities';
import { PermissionFlagsBits, RESTJSONErrorCodes, type Guild, type GuildBasedChannel, type MessageCreateOptions, type Snowflake } from 'discord.js';

export class LoggerManager {
	public readonly timeout = new LoggerTypeManager<TimeoutLoggerTypeContext>(this);
	public readonly prune = new LoggerTypeManager(this);

	#guild: Guild;

	public constructor(guild: Guild) {
		this.#guild = guild;
	}

	/**
	 * Whether or not the bot can view audit logs.
	 */
	public get canViewAuditLogs() {
		return this.#guild.members.me!.permissions.has(PermissionFlagsBits.ViewAuditLog);
	}

	/**
	 * Send a message to the specified channel.
	 * @param options The options to send the message.
	 * @returns Whether the message was sent.
	 */
	public async send(options: LoggerManagerSendOptions): Promise<boolean> {
		if (isNullish(options.channelId) || !this.#resolveSendCondition(options.condition)) {
			options.onAbort?.();
			return false;
		}

		const result = await toErrorCodeResult(this.#guild.channels.fetch(options.channelId));
		return result.match({
			ok: (channel) => this.#sendChannelOk(options, channel),
			err: (code) => this.#sendChannelErr(options, code)
		});
	}

	async #sendChannelOk(options: LoggerManagerSendOptions, channel: GuildBasedChannel | null) {
		// Unsupported channel type, should never happen:
		if (isNullish(channel) || !channel.isTextBased()) {
			options.onAbort?.();
			return false;
		}

		const messageOptions = this.#resolveMessageOptions(await options.makeMessage());

		let requiredPermissions = PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel;
		if (!isNullishOrEmpty(messageOptions.embeds)) requiredPermissions |= PermissionFlagsBits.EmbedLinks;
		if (!isNullishOrEmpty(messageOptions.files)) requiredPermissions |= PermissionFlagsBits.AttachFiles;

		const hasPermissions = channel.permissionsFor(await this.#guild.members.fetchMe()).has(requiredPermissions);
		if (!hasPermissions) return false;

		const result = await toErrorCodeResult(channel.send(messageOptions));
		return result //
			.inspectErr((code) => this.#logError(code, options.channelId!, 'Failed to send message in'))
			.isOk();
	}

	async #sendChannelErr(options: LoggerManagerSendOptions, code: RESTJSONErrorCodes) {
		options.onAbort?.();

		// If the channel was not found, clear the settings:
		if (code === RESTJSONErrorCodes.UnknownChannel) {
			await writeSettings(this.#guild, [[options.key, null]]);
		} else {
			this.#logError(code, options.channelId!, 'Failed to fetch channel');
		}

		return false;
	}

	#resolveSendCondition(condition: boolean | (() => boolean) | Nullish) {
		if (isNullish(condition)) return true;
		if (isFunction(condition)) return condition();
		return condition;
	}

	#resolveMessageOptions(options: LoggerManagerSendMessageOptions) {
		if (Array.isArray(options)) return { embeds: options };
		if (options instanceof EmbedBuilder) return { embeds: [options] };
		return options;
	}

	#logError(code: RESTJSONErrorCodes, channelId: Snowflake, content: string) {
		container.logger.error(`${LogPrefix} ${getCodeStyle(code)} ${content} ${channelId}`);
	}
}

export interface LoggerManagerSendOptions {
	/**
	 * The settings key to reset if the channel is not found.
	 */
	key: GuildSettingsOfType<string | Nullish>;
	/**
	 * The channel ID to send the message to, if any.
	 */
	channelId: string | Nullish;
	/**
	 * The condition to check before sending the message, if any.
	 */
	condition?: boolean | (() => boolean);
	/**
	 * Makes the options for the message to send.
	 * @returns The message options to send.
	 */
	makeMessage: () => Awaitable<LoggerManagerSendMessageOptions>;
	/**
	 * The function to call when the log operation was aborted before calling
	 * {@linkcode makeMessage}.
	 */
	onAbort?: () => void;
}

export type LoggerManagerSendMessageOptions = MessageCreateOptions | EmbedBuilder | EmbedBuilder[];

const LogPrefix = getLogPrefix('LoggerManager');

export interface TimeoutLoggerTypeContext extends LoggerTypeContext {
	oldValue: number | null;
	newValue: number | null;
}
