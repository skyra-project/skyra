import { QueueClient, WebsocketHandler } from '#lib/audio';
import { GuildSettings, SettingsManager } from '#lib/database';
import { AnalyticsData, GiveawayManager, InviteStore, ScheduleManager } from '#lib/structures';
import { CLIENT_OPTIONS, WEBHOOK_ERROR } from '#root/config';
import { isGuildMessage } from '#utils/common';
import { enumerable } from '@sapphire/decorators';
import { SapphireClient, Store } from '@sapphire/framework';
import type { I18nContext } from '@sapphire/plugin-i18next';
import { TimerManager } from '@sapphire/time-utilities';
import { Message, Webhook } from 'discord.js';
import Redis from 'ioredis';
import { join } from 'path';
import { readSettings } from './database/settings/functions';
import { GuildMemberFetchQueue } from './discord/GuildMemberFetchQueue';
import { envIsDefined, envParseBoolean, envParseInteger, envParseString } from './env';
import './extensions';
import { WorkerManager } from './moderation/workers/WorkerManager';
import { Leaderboard } from './util/Leaderboard';
import type { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { Twitch } from './util/Notifications/Twitch';

export class SkyraClient extends SapphireClient {
	@enumerable(false)
	public dev = process.env.NODE_ENV !== 'production';

	/**
	 * The loaded Leaderboard singleton instance
	 */
	@enumerable(false)
	public leaderboard: Leaderboard = new Leaderboard(this);

	/**
	 * The Giveaway manager
	 */
	@enumerable(false)
	public giveaways: GiveawayManager = new GiveawayManager(this);

	/**
	 * The Schedule manager
	 */
	@enumerable(false)
	public schedules: ScheduleManager;

	/**
	 * The webhook to use for the error event
	 */
	@enumerable(false)
	public webhookError: Webhook | null = WEBHOOK_ERROR ? new Webhook(this, WEBHOOK_ERROR) : null;

	/**
	 * The invite store
	 */
	@enumerable(false)
	public invites: InviteStore = new InviteStore(this);

	@enumerable(false)
	public readonly audio: QueueClient | null;

	@enumerable(false)
	public readonly analytics: AnalyticsData | null;

	@enumerable(false)
	public readonly guildMemberFetchQueue: GuildMemberFetchQueue = new GuildMemberFetchQueue();

	@enumerable(false)
	public llrCollectors: Set<LongLivingReactionCollector> = new Set();

	@enumerable(false)
	public twitch: Twitch = new Twitch();

	@enumerable(false)
	public websocket = new WebsocketHandler();

	public constructor() {
		super(CLIENT_OPTIONS);

		// Workers
		this.context.workers = new WorkerManager();

		this.context.settings = new SettingsManager(this);

		// Analytics
		this.schedules = new ScheduleManager();
		this.context.schedule = this.schedules;

		this.analytics = envParseBoolean('INFLUX_ENABLED') ? new AnalyticsData() : null;

		if (envParseBoolean('AUDIO_ENABLED')) {
			this.audio = new QueueClient(this.options.audio!, (guildID, packet) => {
				const guild = this.guilds.cache.get(guildID);
				return Promise.resolve(guild?.shard.send(packet));
			});
			this.stores.registerUserDirectories(join(__dirname, '..', 'audio'));
		} else {
			this.audio = null;
		}

		if (envIsDefined('REDIS_AFK_DB') && envParseBoolean('REDIS_ENABLED')) {
			Store.injectedContext.afk = new Redis({
				host: envParseString('REDIS_HOST'),
				port: envParseInteger('REDIS_PORT'),
				db: envParseInteger('REDIS_AFK_DB'),
				password: envParseString('REDIS_PASSWORD'),
				lazyConnect: true
			});
		}
	}

	public get context() {
		return Store.injectedContext;
	}

	public async login(token?: string) {
		await this.context.workers.start();
		const loginResponse = await super.login(token);
		await this.schedules.init();
		return loginResponse;
	}

	public async destroy() {
		await this.context.workers.destroy();
		this.guildMemberFetchQueue.destroy();
		TimerManager.destroy();
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
	public fetchLanguage = (message: I18nContext) => {
		return message.guild ? readSettings(message.guild, GuildSettings.Language) : 'en-US';
	};
}
