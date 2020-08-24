// Import all extensions and schemas
import './extensions/SkyraGuild';
import './schemas/Guilds';
// Import setup files
import './setup/PermissionsLevels';
import './setup/Canvas';

import { InfluxDB, QueryApi, WriteApi, WritePrecision } from '@influxdata/influxdb-client';
import { Colors } from '@klasa/console';
// Import all configuration
import {
	CLIENT_OPTIONS,
	ENABLE_INFLUX,
	EVLYN_PORT,
	INFLUX_OPTIONS,
	INFLUX_ORG,
	INFLUX_ORG_ANALYTICS_BUCKET,
	VERSION,
	WEBHOOK_DATABASE,
	WEBHOOK_ERROR,
	WEBHOOK_FEEDBACK
} from '@root/config';
import { mergeDefault } from '@sapphire/utilities';
import { Manager as LavalinkManager } from '@utils/Music/ManagerWrapper';
import { FSWatcher } from 'chokidar';
import { Webhook } from 'discord.js';
import { KlasaClient, KlasaClientOptions, Schema } from 'klasa';
import { DashboardClient } from 'klasa-dashboard-hooks';
import { container } from 'tsyringe';
/* eslint-disable @typescript-eslint/no-invalid-this */
// Import all dependencies
import { Client as VezaClient } from 'veza';

import { InviteStore } from './structures/InviteStore';
import { IPCMonitorStore } from './structures/IPCMonitorStore';
// Import all structures
import { GiveawayManager } from './structures/managers/GiveawayManager';
import { ScheduleManager } from './structures/managers/ScheduleManager';
// Import all types
import { Events } from './types/Enums';
import { UserTags } from './util/Cache/UserTags';
// Import all utils
import { clientOptions } from './util/constants';
import { ConnectFourManager } from './util/Games/ConnectFourManager';
import { Leaderboard } from './util/Leaderboard';
import { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { Twitch } from './util/Notifications/Twitch';
import { enumerable } from './util/util';
import { WebsocketHandler } from './websocket/WebsocketHandler';

const g = new Colors({ text: 'green' }).format('[IPC   ]');
const y = new Colors({ text: 'yellow' }).format('[IPC   ]');
const r = new Colors({ text: 'red' }).format('[IPC   ]');

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
	 * The IPC monitor store
	 */
	public ipcMonitors: IPCMonitorStore = new IPCMonitorStore(this);

	/**
	 * The Giveaway manager
	 */
	public giveaways: GiveawayManager = new GiveawayManager(this);

	/**
	 * The Schedule manager
	 */
	public schedules: ScheduleManager = new ScheduleManager(this);

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

	public fsWatcher: FSWatcher | null = null;

	public analytics: WriteApi | null = null;
	public analyticsReader: QueryApi | null = null;

	@enumerable(false)
	public influx: InfluxDB | null = ENABLE_INFLUX ? new InfluxDB(INFLUX_OPTIONS) : null;

	/**
	 * The ConnectFour manager
	 */
	@enumerable(false)
	public connectFour: ConnectFourManager = new ConnectFourManager(this);

	@enumerable(false)
	public userTags: UserTags = new UserTags(this);

	@enumerable(false)
	public llrCollectors: Set<LongLivingReactionCollector> = new Set();

	@enumerable(false)
	public lavalink: LavalinkManager = new LavalinkManager(this, this.options.lavalink);

	@enumerable(false)
	public twitch: Twitch = new Twitch();

	public ipc = new VezaClient('skyra-master')
		.on('disconnect', (client) => {
			this.emit(Events.Warn, `${y} Disconnected: ${client.name}`);
		})
		.on('ready', (client) => {
			this.emit(Events.Verbose, `${g} Ready ${client.name}`);
		})
		.on('error', (error, client) => {
			this.emit(Events.Error, `${r} Error from ${client.name}`, error);
		})
		.on('message', this.ipcMonitors.run.bind(this.ipcMonitors));

	public websocket = new WebsocketHandler(this);

	public constructor() {
		super(mergeDefault(clientOptions, CLIENT_OPTIONS) as KlasaClientOptions);

		// Register the API handler
		this.registerStore(this.ipcMonitors);

		if (!this.options.dev) {
			this.ipc.connectTo(EVLYN_PORT).catch((error: Error) => {
				this.console.error(error);
			});
		}

		if (ENABLE_INFLUX) {
			this.analytics = this.influx!.getWriteApi(INFLUX_ORG, INFLUX_ORG_ANALYTICS_BUCKET, WritePrecision.s);
			this.analyticsReader = this.influx!.getQueryApi(INFLUX_ORG);
		}

		container.registerInstance(SkyraClient, this);
	}

	public async login(token?: string) {
		await this.schedules.init();
		return super.login(token);
	}

	public static defaultMemberSchema = new Schema().add('points', 'Number', { configurable: false });
}

SkyraClient.use(DashboardClient);
