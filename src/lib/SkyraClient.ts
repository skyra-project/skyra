/* eslint-disable @typescript-eslint/no-invalid-this */
// Import all dependencies
import { container } from 'tsyringe';
import { DashboardClient } from 'klasa-dashboard-hooks';
import { KlasaClient, KlasaClientOptions, KlasaMessage } from 'klasa';
import { mergeDefault } from '@sapphire/utilities';
import { Webhook } from 'discord.js';

// Import all structures
import { GiveawayManager } from './structures/managers/GiveawayManager';
import { ScheduleManager } from './structures/managers/ScheduleManager';

// Import all utils
import { clientOptions } from './util/constants';
import { ConnectFourManager } from './util/Games/ConnectFourManager';
import { enumerable } from './util/util';
import { Leaderboard } from './util/Leaderboard';
import { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { Twitch } from './util/Notifications/Twitch';

// Import all configuration
import { CLIENT_OPTIONS, ENABLE_INFLUX, VERSION, WEBHOOK_DATABASE, WEBHOOK_ERROR, WEBHOOK_FEEDBACK } from '#root/config';

// Import all extensions and schemas
import './extensions';

// Import setup files
import './setup/PermissionsLevels';
import './setup/Canvas';
import { InviteStore } from './structures/InviteStore';
import { WebsocketHandler } from './websocket/WebsocketHandler';
import { AnalyticsData } from '#utils/Tracking/Analytics/structures/AnalyticsData';
import { QueueClient } from '#lib/audio';
import { GuildSettings, SettingsManager } from '#lib/database';
import { GuildMemberFetchQueue } from './discord/GuildMemberFetchQueue';

export class SkyraClient extends KlasaClient {
	/**
	 * The version of Skyra
	 */
	public version = VERSION;

	/**
	 * The loaded Leaderboard singleton instance
	 */
	public leaderboard: Leaderboard = new Leaderboard(this);

	/**
	 * The Giveaway manager
	 */
	public giveaways: GiveawayManager = new GiveawayManager(this);

	/**
	 * The Schedule manager
	 */
	public schedules: ScheduleManager = new ScheduleManager(this);

	/**
	 * The settings manager
	 */
	public settings: SettingsManager = new SettingsManager(this);

	/**
	 * The webhook to use for the error event
	 */
	public webhookError: Webhook = new Webhook(this, WEBHOOK_ERROR);

	/**
	 * The webhook to use for feedbacks
	 */
	public webhookFeedback: Webhook | null = WEBHOOK_FEEDBACK ? new Webhook(this, WEBHOOK_FEEDBACK) : null;

	/**
	 * The webhook to use for database errors
	 */
	public webhookDatabase: Webhook | null = WEBHOOK_DATABASE ? new Webhook(this, WEBHOOK_DATABASE) : null;

	/**
	 * The invite store
	 */
	public invites: InviteStore = new InviteStore(this);

	@enumerable(false)
	public readonly audio: QueueClient;

	@enumerable(false)
	public readonly analytics: AnalyticsData | null;

	@enumerable(false)
	public readonly guildMemberFetchQueue: GuildMemberFetchQueue = new GuildMemberFetchQueue(this);

	/**
	 * The ConnectFour manager
	 */
	@enumerable(false)
	public connectFour: ConnectFourManager = new ConnectFourManager(this);

	@enumerable(false)
	public llrCollectors: Set<LongLivingReactionCollector> = new Set();

	@enumerable(false)
	public twitch: Twitch = new Twitch();

	public websocket = new WebsocketHandler(this);

	public constructor() {
		// @ts-expect-error 2589 https://github.com/microsoft/TypeScript/issues/34933
		super(mergeDefault(clientOptions, CLIENT_OPTIONS) as KlasaClientOptions);
		this.audio = new QueueClient(this.options.audio, (guildID, packet) => {
			const guild = this.guilds.cache.get(guildID);
			return Promise.resolve(guild?.shard.send(packet));
		});
		this.analytics = ENABLE_INFLUX ? new AnalyticsData() : null;

		container.registerInstance(SkyraClient, this).registerInstance('SkyraClient', this);
	}

	public async login(token?: string) {
		await this.schedules.init();
		return super.login(token);
	}

	/**
	 * Retrieves the prefix for the guild.
	 * @param message The message that gives context.
	 */
	public fetchPrefix(message: KlasaMessage) {
		if (!message.guild) return this.options.prefix;
		return message.guild.readSettings(GuildSettings.Prefix);
	}

	/**
	 * Retrieves the language key for the message.
	 * @param message The message that gives context.
	 */
	public fetchLanguage(message: KlasaMessage) {
		if (!message.guild) return null;
		return message.guild.readSettings(GuildSettings.Language);
	}
}

SkyraClient.use(DashboardClient);
