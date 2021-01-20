/* eslint-disable @typescript-eslint/no-invalid-this */
import { QueueClient } from '#lib/audio';
import { GuildSettings, SettingsManager } from '#lib/database';
import { AnalyticsData, ConnectFourManager, GiveawayManager, InviteStore, ScheduleManager } from '#lib/structures';
import { CLIENT_OPTIONS, ENABLE_INFLUX, VERSION, WEBHOOK_DATABASE, WEBHOOK_ERROR, WEBHOOK_FEEDBACK } from '#root/config';
import { Server } from '@sapphire/plugin-api';
import { I18nextHandler } from '@sapphire/plugin-i18next';
import { mergeDefault } from '@sapphire/utilities';
import { ClientOptions, Message, Webhook } from 'discord.js';
import { KlasaClient } from 'klasa';
import { join } from 'path';
import { GuildMemberFetchQueue } from './discord/GuildMemberFetchQueue';
import './extensions';
import './setup';
import { clientOptions, rootFolder } from './util/constants';
import { Leaderboard } from './util/Leaderboard';
import type { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { Twitch } from './util/Notifications/Twitch';
import { enumerable } from './util/util';
import { WebsocketHandler } from './websocket/WebsocketHandler';

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

	public websocket = new WebsocketHandler();

	public constructor() {
		// @ts-ignore Shut the fuck up TS
		super(mergeDefault(clientOptions, CLIENT_OPTIONS) as ClientOptions);
		this.audio = new QueueClient(this.options.audio, (guildID, packet) => {
			const guild = this.guilds.cache.get(guildID);
			return Promise.resolve(guild?.shard.send(packet));
		});
		this.analytics = ENABLE_INFLUX ? new AnalyticsData() : null;

		this.server = new Server(CLIENT_OPTIONS.api);
		this.registerStore(this.server.routes) //
			.registerStore(this.server.mediaParsers)
			.registerStore(this.server.middlewares);

		for (const store of [this.server.routes, this.server.mediaParsers, this.server.middlewares]) {
			store.registerPath(join(rootFolder, 'node_modules', '@sapphire', 'plugin-api', 'dist', store.name));
		}
		for (const store of this.stores) store.registerPath(join(this.userBaseDirectory, store.name));
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
