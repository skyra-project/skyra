/* eslint-disable @typescript-eslint/no-invalid-this */
// Import all dependencies
import { ClientOptions, Message, Webhook } from 'discord.js';
import { container } from 'tsyringe';
import { KlasaClient } from 'klasa';
import { I18nextHandler } from '@sapphire/plugin-i18next';
import { mergeDefault } from '@sapphire/utilities';

// Import all structures
import { GiveawayManager } from './structures/managers/GiveawayManager';
import { ScheduleManager } from './structures/managers/ScheduleManager';
import { InviteStore } from './structures/InviteStore';

// Import all utils
import { clientOptions } from './util/constants';
import { ConnectFourManager } from './structures/managers/ConnectFourManager';
import { enumerable } from './util/util';
import { Leaderboard } from './util/Leaderboard';
import type { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { Twitch } from './util/Notifications/Twitch';

// Import all configuration
import { CLIENT_OPTIONS, ENABLE_INFLUX, VERSION, WEBHOOK_DATABASE, WEBHOOK_ERROR, WEBHOOK_FEEDBACK } from '#root/config';

// Import all extensions and schemas
import './extensions';

// Import setup files
import './setup';
import { AnalyticsData } from '#lib/structures/AnalyticsData';
import { QueueClient } from '#lib/audio';
import { GuildSettings, SettingsManager } from '#lib/database';
import { WebsocketHandler } from './websocket/WebsocketHandler';
import { GuildMemberFetchQueue } from './discord/GuildMemberFetchQueue';
import { Server } from '@sapphire/plugin-api';
import { join } from 'path';

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

	/**
	 * The API server
	 */
	public server: Server;

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

	@enumerable(false)
	public i18n: I18nextHandler = new I18nextHandler(this.options.i18n);

	public websocket = new WebsocketHandler(this);

	public constructor() {
		// @ts-ignore Shut the fuck up TS
		super(mergeDefault(clientOptions, CLIENT_OPTIONS) as ClientOptions);
		this.audio = new QueueClient(this.options.audio, (guildID, packet) => {
			const guild = this.guilds.cache.get(guildID);
			return Promise.resolve(guild?.shard.send(packet));
		});
		this.analytics = ENABLE_INFLUX ? new AnalyticsData() : null;

		this.server = new Server(clientOptions.api);
		this.registerStore(this.server.routes) //
			.registerStore(this.server.mediaParsers)
			.registerStore(this.server.middlewares);

		this.events.registerPath(join(this.userBaseDirectory, 'events'));
		this.server.routes.registerPath(join(this.userBaseDirectory, 'routes'));
		this.server.middlewares.registerPath(join(this.userBaseDirectory, 'middlewares'));
		this.server.mediaParsers.registerPath(join(this.userBaseDirectory, 'mediaParsers'));

		container.registerInstance(SkyraClient, this).registerInstance('SkyraClient', this);
	}

	public async login(token?: string) {
		await this.i18n.init();
		await this.server.connect();
		await this.schedules.init();
		return super.login(token);
	}

	/**
	 * Retrieves the prefix for the guild.
	 * @param message The message that gives context.
	 */
	public fetchPrefix(message: Message) {
		if (!message.guild) return this.options.prefix;
		return message.guild.readSettings(GuildSettings.Prefix);
	}

	/**
	 * Retrieves the language key for the message.
	 * @param message The message that gives context.
	 */
	public async fetchLanguage(message: Message) {
		return message.guild ? message.guild.readSettings(GuildSettings.Language) : 'en-US';
	}
}
