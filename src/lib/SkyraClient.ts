import { QueueClient, WebsocketHandler } from '#lib/audio';
import { GuildSettings, SettingsManager } from '#lib/database';
import { AnalyticsData, GiveawayManager, InviteStore, ScheduleManager } from '#lib/structures';
import { CLIENT_OPTIONS, WEBHOOK_ERROR } from '#root/config';
import { SapphireClient, Store } from '@sapphire/framework';
import { I18nContext } from '@sapphire/plugin-i18next';
import { TimerManager } from '@sapphire/time-utilities';
import { Message, Webhook } from 'discord.js';
import { join } from 'path';
import { GuildMemberFetchQueue } from './discord/GuildMemberFetchQueue';
import { envParseBoolean } from './env';
import './extensions';
import { Leaderboard } from './util/Leaderboard';
import type { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { Twitch } from './util/Notifications/Twitch';
import { enumerable } from './util/util';

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
	 * The settings manager
	 */
	@enumerable(false)
	public settings: SettingsManager = new SettingsManager(this);

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
	public readonly guildMemberFetchQueue: GuildMemberFetchQueue = new GuildMemberFetchQueue(this);

	@enumerable(false)
	public llrCollectors: Set<LongLivingReactionCollector> = new Set();

	@enumerable(false)
	public twitch: Twitch = new Twitch();

	@enumerable(false)
	public websocket = new WebsocketHandler();

	public constructor() {
		super(CLIENT_OPTIONS);
		this.schedules = new ScheduleManager(this);
		Store.injectedContext.schedule = this.schedules;
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
	}

	public async login(token?: string) {
		await this.schedules.init();
		return super.login(token);
	}

	public destroy() {
		TimerManager.destroy();
		return super.destroy();
	}

	/**
	 * Retrieves the prefix for the guild.
	 * @param message The message that gives context.
	 */
	public fetchPrefix = async (message: Message) => {
		if (!message.guild) return [process.env.CLIENT_PREFIX, ''] as readonly string[];
		return (await message.guild?.readSettings(GuildSettings.Prefix)) ?? process.env.CLIENT_PREFIX;
	};

	/**
	 * Retrieves the language key for the message.
	 * @param message The message that gives context.
	 */
	public fetchLanguage = (message: I18nContext) => {
		return message.guild ? message.guild.readSettings(GuildSettings.Language) : 'en-US';
	};
}
