import './extensions';

import { QueueClient } from '#lib/audio';
import { GuildSettings, SettingsManager } from '#lib/database';
import { AnalyticsData, ConnectFourManager, GiveawayManager, InviteStore, ScheduleManager } from '#lib/structures';
import { CLIENT_OPTIONS, ENABLE_INFLUX, PREFIX, VERSION, WEBHOOK_DATABASE, WEBHOOK_ERROR, WEBHOOK_FEEDBACK } from '#root/config';
import { SapphireClient } from '@sapphire/framework';
import { I18nContext } from '@sapphire/plugin-i18next';
import { mergeDefault } from '@sapphire/utilities';
import { ClientOptions, Message, Webhook } from 'discord.js';
import { GuildMemberFetchQueue } from './discord/GuildMemberFetchQueue';
import { clientOptions } from './util/constants';
import { Leaderboard } from './util/Leaderboard';
import type { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { Twitch } from './util/Notifications/Twitch';
import { enumerable } from './util/util';
import { WebsocketHandler } from './websocket/WebsocketHandler';

export class SkyraClient extends SapphireClient {
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

	public websocket = new WebsocketHandler();

	public constructor() {
		// @ts-ignore Shut the fuck up TS
		super(mergeDefault(clientOptions, CLIENT_OPTIONS) as ClientOptions);
		this.audio = new QueueClient(this.options.audio, (guildID, packet) => {
			const guild = this.guilds.cache.get(guildID);
			return Promise.resolve(guild?.shard.send(packet));
		});
		this.analytics = ENABLE_INFLUX ? new AnalyticsData() : null;
	}

	public async login(token?: string) {
		await this.schedules.init();
		return super.login(token);
	}

	/**
	 * Retrieves the prefix for the guild.
	 * @param message The message that gives context.
	 */
	public fetchPrefix = async (message: Message) => {
		if (!message.guild) return [PREFIX, ''] as readonly string[];
		return (await message.guild?.readSettings(GuildSettings.Prefix)) ?? PREFIX;
	};

	/**
	 * Retrieves the language key for the message.
	 * @param message The message that gives context.
	 */
	public fetchLanguage = (message: I18nContext) => {
		return message.guild ? message.guild.readSettings(GuildSettings.Language) : 'en-US';
	};
}
