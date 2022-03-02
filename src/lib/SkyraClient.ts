import { QueueClient, WebsocketHandler } from '#lib/audio';
import { GuildSettings, SettingsManager, UserRepository } from '#lib/database';
import { AnalyticsData, InviteStore, ScheduleManager } from '#lib/structures';
import { CLIENT_OPTIONS, WEBHOOK_ERROR } from '#root/config';
import { isGuildMessage } from '#utils/common';
import { mainFolder } from '#utils/constants';
import { Enumerable } from '@sapphire/decorators';
import { container, SapphireClient } from '@sapphire/framework';
import type { InternationalizationContext } from '@sapphire/plugin-i18next';
import { Message, WebhookClient } from 'discord.js';
import { join } from 'node:path';
import { readSettings } from './database/settings/functions';
import { GuildMemberFetchQueue } from './discord/GuildMemberFetchQueue';
import { envParseBoolean } from './env';
import { WorkerManager } from './moderation/workers/WorkerManager';
import { Leaderboard } from './util/Leaderboard';
import type { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { Twitch } from './util/Notifications/Twitch';

export class SkyraClient extends SapphireClient {
	@Enumerable(false)
	public dev = process.env.NODE_ENV !== 'production';

	/**
	 * The loaded Leaderboard singleton instance
	 */
	@Enumerable(false)
	public leaderboard = new Leaderboard();

	/**
	 * The Schedule manager
	 */
	@Enumerable(false)
	public schedules: ScheduleManager;

	/**
	 * The webhook to use for the error event
	 */
	@Enumerable(false)
	public webhookError: WebhookClient | null = WEBHOOK_ERROR ? new WebhookClient(WEBHOOK_ERROR) : null;

	/**
	 * The invite store
	 */
	@Enumerable(false)
	public invites = new InviteStore();

	@Enumerable(false)
	public readonly audio: QueueClient | null;

	@Enumerable(false)
	public readonly analytics: AnalyticsData | null;

	@Enumerable(false)
	public readonly guildMemberFetchQueue = new GuildMemberFetchQueue();

	@Enumerable(false)
	public llrCollectors = new Set<LongLivingReactionCollector>();

	@Enumerable(false)
	public twitch = new Twitch();

	@Enumerable(false)
	public websocket = new WebsocketHandler();

	public constructor() {
		super(CLIENT_OPTIONS);

		// Workers
		container.workers = new WorkerManager();

		container.settings = new SettingsManager();

		// Analytics
		this.schedules = new ScheduleManager();
		container.schedule = this.schedules;

		this.analytics = envParseBoolean('INFLUX_ENABLED') ? new AnalyticsData() : null;

		if (envParseBoolean('AUDIO_ENABLED')) {
			this.audio = new QueueClient(this.options.audio!, (guildId, packet) => {
				const guild = this.guilds.cache.get(guildId);
				return Promise.resolve(guild?.shard.send(packet));
			});
			this.stores.registerPath(join(mainFolder, 'audio'));
		} else {
			this.audio = null;
		}
	}

	public async login(token?: string) {
		await container.workers.start();
		const loginResponse = await super.login(token);
		await this.schedules.init();
		return loginResponse;
	}

	public async destroy() {
		await container.workers.destroy();
		this.guildMemberFetchQueue.destroy();
		this.invites.destroy();
		this.schedules.destroy();
		UserRepository.destroy();
		return super.destroy();
	}

	/**
	 * Retrieves the prefix for the guild.
	 * @param message The message that gives context.
	 */
	public fetchPrefix = async (message: Message) => {
		if (isGuildMessage(message)) return readSettings(message.guild, GuildSettings.Prefix);
		return [process.env.CLIENT_PREFIX, ''] as readonly string[];
	};

	/**
	 * Retrieves the language key for the message.
	 * @param message The message that gives context.
	 */
	public fetchLanguage = (message: InternationalizationContext) => {
		return message.guild ? readSettings(message.guild, GuildSettings.Language) : 'en-US';
	};
}
