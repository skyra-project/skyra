/* eslint-disable @typescript-eslint/no-invalid-this */
// Import all dependencies
import { mergeDefault } from '@klasa/utils';
import { Colors } from '@klasa/console';
import { KlasaClient, KlasaClientOptions, Schema } from 'klasa';
import { Manager as LavalinkManager } from '@utils/Music/ManagerWrapper';
import { Client as VezaClient } from 'veza';
import { InfluxDB, QueryApi, WriteApi, WritePrecision } from '@influxdata/influxdb-client';
import { Permissions, Webhook } from 'discord.js';
import { FSWatcher } from 'chokidar';
import { DashboardClient } from 'klasa-dashboard-hooks';

// Import all types
import { Events } from './types/Enums';

// Import all structures
import { GiveawayManager } from './structures/managers/GiveawayManager';
import { ScheduleManager } from './structures/managers/ScheduleManager';
import { IPCMonitorStore } from './structures/IPCMonitorStore';

// Import all utils
import { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { ConnectFourManager } from './util/Games/ConnectFourManager';
import { Twitch } from './util/Notifications/Twitch';
import { UserGateway } from './util/AntiUserGateway';
import { clientOptions } from './util/constants';
import { Leaderboard } from './util/Leaderboard';
import { UserTags } from './util/Cache/UserTags';
import { enumerable } from './util/util';

// Import all configuration
import {
	CLIENT_ID,
	CLIENT_OPTIONS,
	ENABLE_INFLUX,
	EVLYN_PORT,
	INFLUX_OPTIONS,
	INFLUX_ORG_ANALYTICS_BUCKET,
	INFLUX_ORG,
	VERSION,
	WEBHOOK_DATABASE,
	WEBHOOK_ERROR,
	WEBHOOK_FEEDBACK
} from '@root/config';

// Import all extensions and schemas
import './extensions/SkyraGuild';
import './schemas/Guilds';

// Import setup files
import './setup/PermissionsLevels';
import './setup/Canvas';
import { WebsocketHandler } from './websocket/WebsocketHandler';
import { InviteStore } from './structures/InviteStore';
import { container } from 'tsyringe';

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
	public influx: InfluxDB | null = ENABLE_INFLUX
		? new InfluxDB(INFLUX_OPTIONS)
		: null;

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

	/**
	 * The invite link for Skyra
	 * @since 0.0.1
	 * @override
	 */
	public get invite() {
		const permissions = new Permissions(this.constructor.basePermissions).add(...this.commands.map(command => command.requiredPermissions)).bitfield;
		return `https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=${permissions}&scope=bot`;
	}

	public ipc = new VezaClient('skyra-master')
		.on('disconnect', client => { this.emit(Events.Warn, `${y} Disconnected: ${client.name}`); })
		.on('ready', client => { this.emit(Events.Verbose, `${g} Ready ${client.name}`); })
		.on('error', (error, client) => { this.emit(Events.Error, `${r} Error from ${client.name}`, error); })
		.on('message', this.ipcMonitors.run.bind(this.ipcMonitors));

	public websocket = new WebsocketHandler(this);

	public constructor() {
		super(mergeDefault(clientOptions, CLIENT_OPTIONS) as KlasaClientOptions);

		// Register user gateway override
		this.gateways.register(new UserGateway(this, 'users'));

		// Register the API handler
		this.registerStore(this.ipcMonitors);

		if (!this.options.dev) {
			this.ipc.connectTo(EVLYN_PORT)
				.catch((error: Error) => { this.console.error(error); });
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

	public static defaultMemberSchema = new Schema()
		.add('points', 'Number', { configurable: false });

}

SkyraClient.use(DashboardClient);
