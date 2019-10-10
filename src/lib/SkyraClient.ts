import { Collection, PermissionString, Webhook } from 'discord.js';
import { GatewayStorage, KlasaClient, KlasaClientOptions, Schema, util, Colors } from 'klasa';
import { BaseNodeOptions, Node as Lavalink } from 'lavalink';
import { MasterPool, R } from 'rethinkdb-ts';
import { Client as VezaClient } from 'veza';
import { VERSION, WEBHOOK_ERROR, DEV_LAVALINK, EVLYN_PORT } from '../../config';
import { IPCMonitorStore } from './structures/IPCMonitorStore';
import { MemberGateway } from './structures/MemberGateway';
import { clientOptions } from './util/constants';
import { ConnectFourManager } from './util/Games/ConnectFourManager';
import { Leaderboard } from './util/Leaderboard';
import { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { enumerable } from './util/util';

import './extensions/SkyraGuild';
import './extensions/SkyraGuildMember';
import { GiveawayManager } from './structures/GiveawayManager';
import { Databases } from './types/constants/Constants';
import { Events } from './types/Enums';
import { FSWatcher } from 'chokidar';

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
	 * The webhook to use for the error event
	 */
	public webhookError: Webhook = new Webhook(this, WEBHOOK_ERROR);

	public fsWatcher: FSWatcher | null = null;

	/**
	 * The ConnectFour manager
	 */
	@enumerable(false)
	public connectFour: ConnectFourManager = new ConnectFourManager(this);

	@enumerable(false)
	public usertags: Collection<string, string> = new Collection();

	@enumerable(false)
	public llrCollectors: Set<LongLivingReactionCollector> = new Set();

	@enumerable(false)
	public lavalink: Lavalink | null = DEV_LAVALINK
		? null
		: new Lavalink({
			send: (guildID: string, packet: object) => {
				const guild = this.guilds.get(guildID);
				if (guild) this.ws.shards.get(guild!.shardID)!.send(packet);
				else throw new Error('attempted to send a packet on the wrong shard');
			},
			...this.options.lavalink
		});

	public ipc = new VezaClient('skyra-master')
		.on('disconnect', client => { this.emit(Events.Warn, `${y} Disconnected: ${client.name}`); })
		.on('ready', client => { this.emit(Events.Verbose, `${g} Ready ${client.name}`); })
		.on('error', (error, client) => { this.emit(Events.Error, `${r} Error from ${client.name}`, error); })
		.on('message', this.ipcMonitors.run.bind(this.ipcMonitors));

	public constructor(options: KlasaClientOptions = {}) {
		super(util.mergeDefault(clientOptions, options));

		const { members = {} } = (this.options.settings.gateways || {});
		members.schema = 'schema' in members ? members.schema : SkyraClient.defaultMemberSchema;
		this.gateways
			.register(new MemberGateway(this, Databases.Members, members))
			.register(new GatewayStorage(this, Databases.Banners))
			.register(new GatewayStorage(this, Databases.Giveaway))
			.register(new GatewayStorage(this, Databases.Moderation))
			.register(new GatewayStorage(this, Databases.Polls))
			.register(new GatewayStorage(this, Databases.Starboard));

		// Register the API handler
		this.registerStore(this.ipcMonitors);

		if (!this.options.dev) {
			this.ipc.connectTo(EVLYN_PORT)
				.catch((error: Error) => { this.console.error(error); });
		}
	}

	public async fetchTag(id: string) {
		// Return from cache if exists
		const cache = this.usertags.get(id);
		if (cache) return cache;

		// Fetch the user and set to cache
		const user = await this.users.fetch(id);
		this.usertags.set(user.id, user.tag);
		return user.tag;
	}

	public async fetchUsername(id: string) {
		const tag = await this.fetchTag(id);
		return tag.slice(0, tag.indexOf('#'));
	}

	public static defaultMemberSchema = new Schema()
		.add('points', 'Number', { configurable: false });

}

SkyraClient.defaultUserSchema
	.add('badgeList', 'String', { array: true, configurable: false })
	.add('badgeSet', 'String', { array: true, configurable: false })
	.add('bannerList', 'String', { array: true, configurable: false })
	.add('color', 'String', { configurable: false })
	.add('marry', 'User', { configurable: false })
	.add('money', 'Float', { 'default': 0, 'min': 0, 'max': 2147483647, 'configurable': false })
	.add('points', 'Float', { 'default': 0, 'min': 0, 'max': 2147483647, 'configurable': false })
	.add('reputation', 'Integer', { 'default': 0, 'min': 0, 'max': 32767, 'configurable': false })
	.add('themeLevel', 'String', { 'default': '1001', 'configurable': false })
	.add('themeProfile', 'String', { 'default': '0001', 'configurable': false })
	.add('timeDaily', 'Integer', { 'default': 0, 'configurable': false })
	.add('timeReputation', 'Integer', { 'default': 0, 'configurable': false });

SkyraClient.defaultClientSchema
	.add('boosts', folder => folder
		.add('guilds', 'String', { array: true, min: 17, max: 19 })
		.add('users', 'User', { array: true }));

SkyraClient.defaultGuildSchema
	.add('prefix', 'string', { filter: (_: KlasaClient, value: string) => value.length > 10 })
	.add('tags', 'any', { array: true, configurable: false })
	.add('permissions', folder => folder
		.add('users', 'PermissionNode', { array: true, configurable: false })
		.add('roles', 'PermissionNode', { array: true, configurable: false }))
	.add('channels', folder => folder
		.add('announcements', 'TextChannel')
		.add('greeting', 'TextChannel')
		.add('farewell', 'TextChannel')
		.add('member-logs', 'TextChannel')
		.add('message-logs', 'TextChannel')
		.add('moderation-logs', 'TextChannel')
		.add('nsfw-message-logs', 'TextChannel')
		.add('image-logs', 'TextChannel')
		.add('roles', 'TextChannel')
		.add('spam', 'TextChannel'))
	.add('command-autodelete', 'any', { array: true })
	.add('disabledChannels', 'TextChannel', { array: true })
	.add('disabledCommandsChannels', 'any', { array: true, configurable: false })
	.add('events', folder => folder
		.add('banAdd', 'Boolean', { 'default': false })
		.add('banRemove', 'Boolean', { 'default': false })
		.add('memberAdd', 'Boolean', { 'default': false })
		.add('memberRemove', 'Boolean', { 'default': false })
		.add('messageDelete', 'Boolean', { 'default': false })
		.add('messageEdit', 'Boolean', { 'default': false }))
	.add('messages', folder => folder
		.add('farewell', 'String', { max: 2000 })
		.add('greeting', 'String', { max: 2000 })
		.add('join-dm', 'String', { max: 1500 })
		.add('warnings', 'Boolean', { 'default': false })
		.add('ignoreChannels', 'TextChannel', { array: true }))
	.add('stickyRoles', 'any', { array: true })
	.add('roles', folder => folder
		.add('admin', 'Role')
		.add('auto', 'any', { array: true })
		.add('initial', 'Role')
		.add('messageReaction', 'String', { min: 17, max: 18, configurable: false })
		.add('moderator', 'Role')
		.add('muted', 'Role')
		.add('public', 'Role', { array: true })
		.add('reactions', 'any', { array: true })
		.add('removeInitial', 'Boolean')
		.add('staff', 'Role')
		.add('subscriber', 'Role')
		.add('uniqueRoleSets', 'any', { array: true }))
	.add('selfmod', folder => folder
		.add('attachment', 'Boolean', { 'default': false })
		.add('attachmentMaximum', 'Integer', { 'default': 20, 'min': 0, 'max': 60 })
		.add('attachmentDuration', 'Integer', { 'default': 20000, 'min': 5000, 'max': 120000, 'configurable': false })
		.add('attachmentAction', 'Integer', { 'default': 0, 'configurable': false })
		.add('attachmentPunishmentDuration', 'Integer', { configurable: false })
		.add('capitals', capitals => capitals
			.add('enabled', 'Boolean', { 'default': false })
			.add('minimum', 'Integer', { 'default': 15, 'min': 5, 'max': 2000 })
			.add('maximum', 'Integer', { 'default': 50, 'min': 10, 'max': 100 })
			.add('softAction', 'Integer', { 'default': 0, 'configurable': false })
			.add('hardAction', 'Integer', { 'default': 0, 'configurable': false })
			.add('hardActionDuration', 'Integer', { min: 1000, configurable: false })
			.add('thresholdMaximum', 'Integer', { 'default': 10, 'min': 0, 'max': 60, 'configurable': false })
			.add('thresholdDuration', 'Integer', { 'default': 60000, 'min': 0, 'max': 120000, 'configurable': false }))
		.add('newlines', newline => newline
			.add('enabled', 'Boolean', { 'default': false })
			.add('maximum', 'Integer', { 'default': 20, 'min': 10, 'max': 2000 })
			.add('softAction', 'Integer', { 'default': 0, 'configurable': false })
			.add('hardAction', 'Integer', { 'default': 0, 'configurable': false })
			.add('hardActionDuration', 'Integer', { min: 1000, configurable: false })
			.add('thresholdMaximum', 'Integer', { 'default': 10, 'min': 0, 'max': 60, 'configurable': false })
			.add('thresholdDuration', 'Integer', { 'default': 60000, 'min': 0, 'max': 120000, 'configurable': false }))
		.add('invites', invites => invites
			.add('enabled', 'Boolean', { 'default': false })
			.add('softAction', 'Integer', { 'default': 0, 'configurable': false })
			.add('hardAction', 'Integer', { 'default': 0, 'configurable': false })
			.add('hardActionDuration', 'Integer', { min: 1000, configurable: false })
			.add('thresholdMaximum', 'Integer', { 'default': 10, 'min': 0, 'max': 60, 'configurable': false })
			.add('thresholdDuration', 'Integer', { 'default': 60000, 'min': 0, 'max': 120000, 'configurable': false }))
		.add('filter', filter => filter
			.add('raw', 'String', { array: true, configurable: false })
			.add('enabled', 'Boolean', { 'default': false })
			.add('softAction', 'Integer', { 'default': 0, 'configurable': false })
			.add('hardAction', 'Integer', { 'default': 0, 'configurable': false })
			.add('hardActionDuration', 'Integer', { min: 1000, configurable: false })
			.add('thresholdMaximum', 'Integer', { 'default': 10, 'min': 0, 'max': 60, 'configurable': false })
			.add('thresholdDuration', 'Integer', { 'default': 60000, 'min': 0, 'max': 120000, 'configurable': false }))
		.add('raid', 'Boolean')
		.add('raidthreshold', 'Integer', { 'default': 10, 'min': 2, 'max': 50 })
		.add('ignoreChannels', 'TextChannel', { array: true }))
	.add('no-mention-spam', folder => folder
		.add('enabled', 'Boolean', { 'default': false })
		.add('alerts', 'Boolean', { 'default': false })
		.add('mentionsAllowed', 'Integer', { 'default': 20 })
		.add('timePeriod', 'Integer', { 'default': 8 }))
	.add('social', folder => folder
		.add('achieve', 'Boolean', { 'default': false })
		.add('achieveMessage', 'String')
		.add('ignoreChannels', 'TextChannel', { array: true }))
	.add('starboard', folder => folder
		.add('channel', 'TextChannel')
		.add('emoji', 'String', { 'default': '%E2%AD%90', 'configurable': false })
		.add('ignoreChannels', 'TextChannel', { array: true })
		.add('minimum', 'Integer', { 'default': 1, 'min': 1, 'max': 20 }))
	.add('trigger', folder => folder
		.add('alias', 'any', { array: true, configurable: false })
		.add('includes', 'any', { array: true, configurable: false }));

declare module 'discord.js' {

	export interface Client {
		version: string;
		leaderboard: Leaderboard;
		ipcMonitors: IPCMonitorStore;
		giveaways: GiveawayManager;
		connectFour: ConnectFourManager;
		lavalink: Lavalink | null;
		usertags: Collection<string, string>;
		llrCollectors: Set<LongLivingReactionCollector>;
		ipc: VezaClient;
		webhookError: Webhook;
		fsWatcher: FSWatcher | null;
		fetchTag(id: string): Promise<string>;
		fetchUsername(id: string): Promise<string>;
	}

}

declare module 'klasa' {

	export interface Language {
		PERMISSIONS: Record<PermissionString, string>;
		HUMAN_LEVELS: Record<0 | 1 | 2 | 3 | 4, string>;
		duration(time: number): string;
	}

	export interface Provider {
		db: R;
		pool: MasterPool | null;
		ping(): Promise<number>;
		sync(table: string): Promise<{ synced: number }>;
		getRandom(table: string): Promise<unknown[]>;
	}

	export interface KlasaClientOptions {
		dev?: boolean;
		nms?: {
			role?: number;
			everyone?: number;
		};
		lavalink?: BaseNodeOptions;
	}

	export interface PieceDefaults {
		ipcMonitors?: PieceOptions;
		rawEvents?: PieceOptions;
	}

	export interface GatewaysOptions {
		members?: GatewayOptions;
	}

}
