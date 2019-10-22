/**
 * import { Pool } from 'pg';
 * import { mergeDefault } from '@klasa/utils';
 * import { CLIENT_OPTIONS } from '../config';
 * import { join } from 'path';
 * import { readJSON, outputJSON } from 'fs-nextra';
 * import { RawBannerSettings } from '../src/lib/types/settings/raw/RawBannerSettings';
 * import { RawGiveawaySettings } from '../src/lib/types/settings/raw/RawGiveawaySettings';
 * import { RawGuildSettings } from '../src/lib/types/settings/raw/RawGuildSettings';
 * import { RawMemberSettings } from '../src/lib/types/settings/raw/RawMemberSettings';
 * import { RawModerationSettings } from '../src/lib/types/settings/raw/RawModerationSettings';
 * import { RawStarboardSettings } from '../src/lib/types/settings/raw/RawStarboardSettings';
 * import { RawUserSettings } from '../src/lib/types/settings/raw/RawUserSettings';
 * import { RawCommandCounterSettings } from '../src/lib/types/settings/raw/RawCommandCounterSettings';
 * import { AnyObject } from '../src/lib/types/util';
 * import { RawClientSettings } from '../src/lib/types/settings/raw/RawClientSettings';
 *
 * async function main() {
 * 	await migrateAll();
 *
 * 	const connection = mergeDefault({
 * 		host: 'localhost',
 * 		port: 5432,
 * 		database: 'klasa',
 * 		options: {
 * 			max: 20,
 * 			idleTimeoutMillis: 30000,
 * 			connectionTimeoutMillis: 2000
 * 		}
 * 	}, CLIENT_OPTIONS.providers!.postgres);
 * 	const pgsql = new Pool({
 * 		...connection.options,
 * 		host: connection.host,
 * 		port: connection.port,
 * 		user: connection.user,
 * 		password: connection.password,
 * 		database: connection.database
 * 	});
 *
 * 	// eslint-disable-next-line @typescript-eslint/unbound-method
 * 	pgsql.on('error', console.error);
 * 	const dbconnection = await pgsql.connect();
 * 	await uploadAll(pgsql);
 * 	dbconnection.release();
 * 	await pgsql.end();
 * }
 *
 * async function migrateAll() {
 * 	console.time('Migrating migrateBanners');
 * 	await migrateBanners();
 * 	console.timeEnd('Migrating migrateBanners');
 * 	console.time('Migrating migrateClientStorage');
 * 	await migrateClientStorage();
 * 	console.timeEnd('Migrating migrateClientStorage');
 * 	console.time('Migrating migrateCommandCounter');
 * 	await migrateCommandCounter();
 * 	console.timeEnd('Migrating migrateCommandCounter');
 * 	console.time('Migrating migrateGiveaway');
 * 	await migrateGiveaway();
 * 	console.timeEnd('Migrating migrateGiveaway');
 * 	console.time('Migrating migrateGuilds');
 * 	await migrateGuilds();
 * 	console.timeEnd('Migrating migrateGuilds');
 * 	console.time('Migrating migrateMembers');
 * 	await migrateMembers();
 * 	console.timeEnd('Migrating migrateMembers');
 * 	console.time('Migrating migrateModeration');
 * 	await migrateModeration();
 * 	console.timeEnd('Migrating migrateModeration');
 * 	console.time('Migrating migrateStarboard');
 * 	await migrateStarboard();
 * 	console.timeEnd('Migrating migrateStarboard');
 * 	console.time('Migrating migrateUsers');
 * 	await migrateUsers();
 * 	console.timeEnd('Migrating migrateUsers');
 * }
 *
 * async function uploadAll(pgsql: Pool) {
 * 	console.time('Uploading banners');
 * 	await upload(pgsql, 'banners', 'banners').catch(error => console.error('banners', error));
 * 	console.timeEnd('Uploading banners');
 * 	console.time('Uploading clientStorage');
 * 	await upload(pgsql, 'clientStorage', 'clientStorage').catch(error => console.error('clientStorage', error));
 * 	console.timeEnd('Uploading clientStorage');
 * 	console.time('Uploading commandCounter');
 * 	await upload(pgsql, 'commandCounter', 'command_counter').catch(error => console.error('command_counter', error));
 * 	console.timeEnd('Uploading commandCounter');
 * 	console.time('Uploading giveaway');
 * 	await upload(pgsql, 'giveaway', 'giveaway').catch(error => console.error('giveaway', error));
 * 	console.timeEnd('Uploading giveaway');
 * 	console.time('Uploading guilds');
 * 	await upload(pgsql, 'guilds', 'guilds').catch(error => console.error('guilds', error));
 * 	console.timeEnd('Uploading guilds');
 * 	console.time('Uploading members');
 * 	await upload(pgsql, 'members', 'members').catch(error => console.error('members', error));
 * 	console.timeEnd('Uploading members');
 * 	console.time('Uploading moderation');
 * 	await upload(pgsql, 'moderation', 'moderation').catch(error => console.error('moderation', error));
 * 	console.timeEnd('Uploading moderation');
 * 	console.time('Uploading starboard');
 * 	await upload(pgsql, 'starboard', 'starboard').catch(error => console.error('starboard', error));
 * 	console.timeEnd('Uploading starboard');
 * 	console.time('Uploading users');
 * 	await upload(pgsql, 'users', 'users').catch(error => console.error('users', error));
 * 	console.timeEnd('Uploading users');
 * }
 *
 * const rootData = join(__dirname, '..', '..', 'database', 'data');
 *
 * async function migrateBanners() {
 * 	const entries = await readJSON(join(rootData, 'banners.json')) as Banners[];
 * 	const transformed: RawBannerSettings[] = [];
 *
 * 	for (const bannerGroup of entries) {
 * 		for (const banner of bannerGroup.banners) {
 * 			transformed.push({
 * 				id: banner.id,
 * 				group: bannerGroup.id,
 * 				title: banner.title,
 * 				author_id: banner.author,
 * 				price: banner.price
 * 			});
 * 		}
 * 	}
 *
 * 	await outputJSON(join(rootData, 'banners.new.json'), transformed);
 * }
 *
 * async function migrateClientStorage() {
 * 	const entries = await readJSON(join(rootData, 'clientStorage.json')) as ClientStorage[];
 * 	const transformed: RawClientSettings[] = [];
 *
 * 	for (const entry of entries) {
 * 		transformed.push({
 * 			id: entry.id,
 * 			commandUses: entry.commandUses || 0,
 * 			guildBlacklist: entry.guildBlacklist || [],
 * 			userBlacklist: entry.userBlacklist || [],
 * 			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
 * 			// @ts-ignore 2339
 * 			schedules: (entry.schedules || []).map(schedule => typeof schedule.time === 'number' ? schedule : ({ ...schedule, time: schedule.time.epoch_time * 1000 })),
 * 			boosts_guilds: entry.boosts?.guilds || [],
 * 			boosts_users: entry.boosts?.users || []
 * 		});
 * 	}
 *
 * 	await outputJSON(join(rootData, 'clientStorage.new.json'), transformed);
 * }
 *
 * async function migrateCommandCounter() {
 * 	const entries = await readJSON(join(rootData, 'commandCounter.json')) as RawCommandCounterSettings[];
 * 	const transformed: RawCommandCounterSettings[] = [];
 *
 * 	for (const entry of entries) {
 * 		transformed.push({
 * 			id: entry.id,
 * 			uses: entry.uses
 * 		});
 * 	}
 *
 * 	await outputJSON(join(rootData, 'commandCounter.new.json'), transformed);
 * }
 *
 * async function migrateGiveaway() {
 * 	const entries = await readJSON(join(rootData, 'giveaway.json')) as Giveaway[];
 * 	const transformed: RawGiveawaySettings[] = [];
 *
 * 	for (const entry of entries) {
 * 		transformed.push({
 * 			title: entry.title,
 * 			ends_at: entry.endsAt,
 * 			guild_id: entry.guildID,
 * 			channel_id: entry.channelID,
 * 			message_id: entry.messageID,
 * 			minimum: entry.minimum,
 * 			minimum_winners: entry.minimumWinners
 * 		});
 * 	}
 *
 * 	await outputJSON(join(rootData, 'giveaway.new.json'), transformed);
 * }
 *
 * async function migrateGuilds() {
 * 	const entries = await readJSON(join(rootData, 'guilds.json')) as Guild[];
 * 	const transformed: RawGuildSettings[] = [];
 *
 * 	for (const entry of entries) {
 * 		transformed.push({
 * 			'id': entry.id,
 * 			'channels.announcements': entry.channels?.announcements || null,
 * 			'channels.farewell': entry.channels?.farewell || null,
 * 			'channels.greeting': entry.channels?.greeting || null,
 * 			'channels.image-logs': entry.channels?.['image-logs'] || null,
 * 			'channels.member-logs': entry.channels?.['member-logs'] || null,
 * 			'channels.message-logs': entry.channels?.['message-logs'] || null,
 * 			'channels.moderation-logs': entry.channels?.['moderation-logs'] || null,
 * 			'channels.nsfw-message-logs': entry.channels?.['nsfw-message-logs'] || null,
 * 			'channels.roles': entry.channels?.roles || null,
 * 			'channels.spam': entry.channels?.spam || null,
 * 			'command-autodelete': [],
 * 			'events.banAdd': entry.events?.banAdd || false,
 * 			'events.banRemove': entry.events?.banRemove || false,
 * 			'events.memberAdd': entry.events?.memberAdd || false,
 * 			'events.memberRemove': entry.events?.memberRemove || false,
 * 			'events.messageDelete': entry.events?.messageDelete || false,
 * 			'events.messageEdit': entry.events?.messageEdit || false,
 * 			'messages.farewell': entry.messages?.farewell || null,
 * 			'messages.greeting': entry.messages?.greeting || null,
 * 			'messages.ignoreChannels': entry.messages?.ignoreChannels || [],
 * 			'messages.join-dm': entry.messages?.['join-dm'] || null,
 * 			'messages.warnings': entry.messages?.warnings || false,
 * 			'no-mention-spam.alerts': entry['no-mention-spam']?.alerts || false,
 * 			'no-mention-spam.enabled': entry['no-mention-spam']?.enabled || false,
 * 			'no-mention-spam.mentionsAllowed': entry['no-mention-spam']?.mentionsAllowed || 20,
 * 			'no-mention-spam.timePeriod': entry['no-mention-spam']?.timePeriod || 8,
 * 			'permissions.roles': entry.permissions?.roles || [],
 * 			'permissions.users': entry.permissions?.users || [],
 * 			'roles.admin': entry.roles?.admin || null,
 * 			'roles.auto': entry.roles?.auto || [],
 * 			'roles.dj': entry.roles?.dj || null,
 * 			'roles.initial': entry.roles?.initial || null,
 * 			'roles.messageReaction': entry.roles?.messageReaction || null,
 * 			'roles.moderator': entry.roles?.moderator || null,
 * 			'roles.muted': entry.roles?.muted || null,
 * 			'roles.public': entry.roles?.public || [],
 * 			'roles.reactions': entry.roles?.reactions || [],
 * 			'roles.removeInitial': entry.roles?.removeInitial || false,
 * 			'roles.staff': entry.roles?.staff || null,
 * 			'roles.subscriber': entry.roles?.subscriber || null,
 * 			'roles.uniqueRoleSets': entry.roles?.uniqueRoleSets || [],
 * 			'selfmod.attachment': entry.selfmod?.attachment || false,
 * 			'selfmod.attachmentAction': entry.selfmod?.attachmentAction || 0,
 * 			'selfmod.attachmentDuration': entry.selfmod?.attachmentDuration || 20000,
 * 			'selfmod.attachmentMaximum': entry.selfmod?.attachmentMaximum || 20,
 * 			'selfmod.attachmentPunishmentDuration': entry.selfmod?.attachmentPunishmentDuration || null,
 * 			'selfmod.capitals.enabled': entry.selfmod?.capitals?.enabled || false,
 * 			'selfmod.capitals.hardAction': entry.selfmod?.capitals?.hardAction || 0,
 * 			'selfmod.capitals.hardActionDuration': entry.selfmod?.capitals?.hardActionDuration || null,
 * 			'selfmod.capitals.maximum': entry.selfmod?.capitals?.maximum || 50,
 * 			'selfmod.capitals.minimum': entry.selfmod?.capitals?.minimum || 15,
 * 			'selfmod.capitals.softAction': entry.selfmod?.capitals?.softAction || 0,
 * 			'selfmod.capitals.thresholdDuration': entry.selfmod?.capitals?.thresholdDuration || 60000,
 * 			'selfmod.capitals.thresholdMaximum': entry.selfmod?.capitals?.thresholdMaximum || 10,
 * 			'selfmod.filter.enabled': entry.selfmod?.filter?.enabled || false,
 * 			'selfmod.filter.hardAction': entry.selfmod?.filter?.hardAction || 0,
 * 			'selfmod.filter.hardActionDuration': entry.selfmod?.filter?.hardActionDuration || null,
 * 			'selfmod.filter.raw': entry.selfmod?.filter?.raw || [],
 * 			'selfmod.filter.softAction': entry.selfmod?.filter?.softAction || 0,
 * 			'selfmod.filter.thresholdDuration': entry.selfmod?.filter?.thresholdDuration || 60000,
 * 			'selfmod.filter.thresholdMaximum': entry.selfmod?.filter?.thresholdMaximum || 10,
 * 			'selfmod.ignoreChannels': entry.selfmod?.ignoreChannels || [],
 * 			'selfmod.invites.enabled': entry.selfmod?.invites?.enabled || false,
 * 			'selfmod.invites.hardAction': entry.selfmod?.invites?.hardAction || 0,
 * 			'selfmod.invites.hardActionDuration': entry.selfmod?.invites?.hardActionDuration || null,
 * 			'selfmod.invites.softAction': entry.selfmod?.invites?.softAction || 0,
 * 			'selfmod.invites.thresholdDuration': entry.selfmod?.invites?.thresholdDuration || 60000,
 * 			'selfmod.invites.thresholdMaximum': entry.selfmod?.invites?.thresholdMaximum || 10,
 * 			'selfmod.newlines.enabled': entry.selfmod?.newlines?.enabled || false,
 * 			'selfmod.newlines.hardAction': entry.selfmod?.newlines?.hardAction || 0,
 * 			'selfmod.newlines.hardActionDuration': entry.selfmod?.newlines?.hardActionDuration || null,
 * 			'selfmod.newlines.maximum': entry.selfmod?.newlines?.maximum || 20,
 * 			'selfmod.newlines.softAction': entry.selfmod?.newlines?.softAction || 0,
 * 			'selfmod.newlines.thresholdDuration': entry.selfmod?.newlines?.thresholdDuration || 60000,
 * 			'selfmod.newlines.thresholdMaximum': entry.selfmod?.newlines?.thresholdMaximum || 10,
 * 			'selfmod.raid': entry.selfmod?.raid || false,
 * 			'selfmod.raidthreshold': entry.selfmod?.raidthreshold || 10,
 * 			'social.achieve': entry.social?.achieve || false,
 * 			'social.achieveMessage': entry.social?.achieveMessage || null,
 * 			'social.ignoreChannels': entry.social?.ignoreChannels || [],
 * 			'starboard.channel': entry.starboard?.channel || null,
 * 			'starboard.emoji': entry.starboard?.emoji || '%E2%AD%90',
 * 			'starboard.ignoreChannels': entry.starboard?.ignoreChannels || [],
 * 			'starboard.minimum': entry.starboard?.minimum || 1,
 * 			'trigger.alias': entry.trigger?.alias || [],
 * 			'trigger.includes': entry.trigger?.includes || [],
 * 			'commandUses': entry.commandUses || 0,
 * 			'disableNaturalPrefix': entry.disableNaturalPrefix || false,
 * 			'disabledChannels': entry.disabledChannels || [],
 * 			'disabledCommands': entry.disabledCommands || [],
 * 			'disabledCommandsChannels': entry.disabledCommandsChannels || [],
 * 			'language': entry.language || 'en-US',
 * 			'prefix': entry.prefix || 's!',
 * 			'stickyRoles': entry.stickyRoles || [],
 * 			'tags': entry.tags || []
 * 		});
 * 	}
 *
 * 	await outputJSON(join(rootData, 'guilds.new.json'), transformed);
 * }
 *
 * async function migrateMembers() {
 * 	const entries = await readJSON(join(rootData, 'members.json')) as Member[];
 * 	const transformed: RawMemberSettings[] = [];
 *
 * 	for (const entry of entries) {
 * 		const [guildID, userID] = entry.id.split('.');
 * 		transformed.push({
 * 			guild_id: guildID,
 * 			user_id: userID,
 * 			point_count: entry.points || 0
 * 		});
 * 	}
 *
 * 	await outputJSON(join(rootData, 'members.new.json'), transformed);
 * }
 *
 * async function migrateModeration() {
 * 	const entries = await readJSON(join(rootData, 'moderation.json')) as Moderation[];
 * 	const transformed: RawModerationSettings[] = [];
 * 	const registeredCases = new Map<string, Set<number>>();
 *
 * 	for (const entry of entries) {
 * 		const guildCases = (t => t || registeredCases.set(entry.guildID, new Set()).get(entry.guildID)!)(registeredCases.get(entry.guildID));
 * 		if (guildCases.has(entry.caseID)) continue;
 * 		guildCases.add(entry.caseID);
 *
 * 		transformed.push({
 * 			case_id: entry.caseID,
 * 			created_at: entry.createdAt,
 * 			duration: typeof entry.duration === 'number' && entry.duration > 0 && entry.duration <= 31536000000 ? entry.duration : null,
 * 			extra_data: entry.extraData,
 * 			guild_id: entry.guildID,
 * 			moderator_id: entry.moderatorID,
 * 			reason: entry.reason || null,
 * 			user_id: entry.userID,
 * 			type: entry.type
 * 		});
 * 	}
 *
 * 	await outputJSON(join(rootData, 'moderation.new.json'), transformed);
 * }
 *
 * async function migrateStarboard() {
 * 	const entries = await readJSON(join(rootData, 'starboard.json')) as Starboard[];
 * 	const transformed: RawStarboardSettings[] = [];
 * 	const registeredStars = new Map<string, number>();
 *
 * 	for (const entry of entries) {
 * 		// Skip incomplete data
 * 		if (typeof entry.userID === 'undefined') continue;
 * 		if (typeof entry.guildID === 'undefined') continue;
 * 		const registeredStar = registeredStars.get(`${entry.guildID}.${entry.messageID}`);
 * 		if (typeof registeredStar === 'number') {
 * 			if (transformed[registeredStar].stars >= entry.stars) continue;
 * 			console.log(`Star: Replacing ${entry.guildID}.${entry.messageID} (${transformed[registeredStar].stars}) for one with ${entry.stars}`);
 * 			transformed[registeredStar] = {
 * 				enabled: !entry.disabled,
 * 				user_id: entry.userID,
 * 				message_id: entry.messageID,
 * 				channel_id: entry.channelID,
 * 				guild_id: entry.guildID,
 * 				star_message_id: entry.starMessageID,
 * 				stars: entry.stars
 * 			};
 * 		} else {
 * 			registeredStars.set(`${entry.guildID}.${entry.messageID}`, transformed.length);
 * 			transformed.push({
 * 				enabled: !entry.disabled,
 * 				user_id: entry.userID,
 * 				message_id: entry.messageID,
 * 				channel_id: entry.channelID,
 * 				guild_id: entry.guildID,
 * 				star_message_id: entry.starMessageID,
 * 				stars: entry.stars
 * 			});
 * 		}
 * 	}
 *
 * 	await outputJSON(join(rootData, 'starboard.new.json'), transformed);
 * }
 *
 * async function migrateUsers() {
 * 	const entries = await readJSON(join(rootData, 'users.json')) as User[];
 * 	const transformed: RawUserSettings[] = [];
 *
 * 	for (const entry of entries) {
 * 		transformed.push({
 * 			id: entry.id,
 * 			command_uses: entry.commandUses || 0,
 * 			banner_list: entry.bannerList || [],
 * 			badge_set: entry.badgeSet || [],
 * 			badge_list: [],
 * 			color: typeof entry.color === 'string' ? parseInt(entry.color, 16) : 0,
 * 			marry: entry.marry ? [entry.marry] : [],
 * 			money: Math.max(Math.round(entry.money || 0), 0),
 * 			point_count: Math.max(Math.round(entry.points || 0), 0),
 * 			reputation_count: Math.max(Math.round(entry.reputation || 0), 0),
 * 			theme_level: '1001',
 * 			theme_profile: entry.themeProfile || '0001',
 * 			next_daily: entry.timeDaily || null,
 * 			next_reputation: entry.timeReputation || null
 * 		});
 * 	}
 *
 * 	await outputJSON(join(rootData, 'users.new.json'), transformed);
 * }
 *
 * async function upload(pgsql: Pool, name: string, databaseName: string) {
 * 	const data = await readJSON(join(rootData, `${name}.new.json`)) as AnyObject[];
 * 	if (data.length === 0) return;
 *
 * 	const stringifiedData = JSON.stringify(data).replace(/'/g, "''");
 * 	await pgsql.query(`
 * 		INSERT INTO "${databaseName}"
 * 		SELECT * FROM json_populate_recordset(NULL::"${databaseName}", '${stringifiedData}')
 * 		ON CONFLICT DO NOTHING;
 * 	`);
 * }
 *
 * // eslint-disable-next-line @typescript-eslint/unbound-method
 * main().catch(console.error);
 *
 * interface Banners {
 * 	banners: Banner[];
 * 	id: string;
 * }
 *
 * interface Banner {
 * 	id: string;
 * 	resAuthor: string;
 * 	author: string;
 * 	price: number;
 * 	title: string;
 * }
 *
 * interface ClientStorage {
 * 	id: string;
 * 	commandUses?: number;
 * 	userBlacklist?: readonly string[];
 * 	guildBlacklist?: readonly string[];
 * 	schedules?: readonly object[];
 * 	boosts?: {
 * 		guilds?: readonly string[];
 * 		users?: readonly string[];
 * 	};
 * }
 *
 * interface Guild {
 * 	id: string;
 * 	prefix?: string;
 * 	language?: string;
 * 	disableNaturalPrefix?: boolean;
 * 	disabledCommands?: string[];
 * 	commandUses?: number;
 * 	tags?: object[];
 * 	permissions?: {
 * 		users?: object[];
 * 		roles?: object[];
 * 	};
 * 	channels?: {
 * 		announcements?: string | null;
 * 		greeting?: string | null;
 * 		farewell?: string | null;
 * 		'member-logs'?: string | null;
 * 		'message-logs'?: string | null;
 * 		'moderation-logs'?: string | null;
 * 		'nsfw-message-logs'?: string | null;
 * 		'image-logs'?: string | null;
 * 		roles?: string | string;
 * 		spam?: string | null;
 * 	};
 * 	'command-autodelete'?: object[];
 * 	disabledChannels?: string[];
 * 	disabledCommandsChannels?: object[];
 * 	events?: {
 * 		banAdd?: boolean;
 * 		banRemove?: boolean;
 * 		memberAdd?: boolean;
 * 		memberRemove?: boolean;
 * 		messageDelete?: boolean;
 * 		messageEdit?: boolean;
 * 	};
 * 	messages?: {
 * 		farewell?: string | null;
 * 		greeting?: string | null;
 * 		'join-dm'?: string | null;
 * 		warnings?: boolean;
 * 		ignoreChannels?: string[];
 * 	};
 * 	stickyRoles?: object[];
 * 	roles?: {
 * 		admin?: string | null;
 * 		auto?: object[];
 * 		initial?: string | null;
 * 		messageReaction?: string | null;
 * 		moderator?: string | null;
 * 		muted?: string | null;
 * 		public?: string[];
 * 		reactions?: object[];
 * 		removeInitial?: boolean;
 * 		staff?: string | null;
 * 		dj?: string | null;
 * 		subscriber?: string;
 * 		uniqueRoleSets?: object[];
 * 	};
 * 	selfmod?: {
 * 		attachment?: boolean;
 * 		attachmentMaximum?: number;
 * 		attachmentDuration?: number;
 * 		attachmentAction?: number;
 * 		attachmentPunishmentDuration?: number | null;
 * 		capitals?: {
 * 			enabled?: boolean;
 * 			minimum?: number;
 * 			maximum?: number;
 * 			softAction?: number;
 * 			hardAction?: number;
 * 			hardActionDuration?: null;
 * 			thresholdMaximum?: number;
 * 			thresholdDuration?: number;
 * 		};
 * 		newlines?: {
 * 			enabled?: boolean;
 * 			maximum?: number;
 * 			softAction?: number;
 * 			hardAction?: number;
 * 			hardActionDuration?: null;
 * 			thresholdMaximum?: number;
 * 			thresholdDuration?: number;
 * 		};
 * 		invites?: {
 * 			enabled?: boolean;
 * 			softAction?: number;
 * 			hardAction?: number;
 * 			hardActionDuration?: null;
 * 			thresholdMaximum?: number;
 * 			thresholdDuration?: number;
 * 		};
 * 		filter?: {
 * 			enabled?: boolean;
 * 			softAction?: number;
 * 			hardAction?: number;
 * 			hardActionDuration?: null;
 * 			thresholdMaximum?: number;
 * 			thresholdDuration?: number;
 * 			raw?: string[];
 * 		};
 * 		raid?: boolean;
 * 		raidthreshold?: number;
 * 		ignoreChannels?: string[];
 * 	};
 * 	'no-mention-spam'?: {
 * 		enabled?: boolean;
 * 		alerts?: boolean;
 * 		mentionsAllowed?: number;
 * 		timePeriod?: number;
 * 	};
 * 	social?: {
 * 		achieve?: boolean;
 * 		achieveMessage?: string | null;
 * 		ignoreChannels?: string[];
 * 	};
 * 	starboard?: {
 * 		channel?: string | null;
 * 		emoji?: string;
 * 		ignoreChannels?: string[];
 * 		minimum?: number;
 * 	};
 * 	trigger?: {
 * 		alias?: object[];
 * 		includes?: object[];
 * 	};
 * }
 *
 * interface Giveaway {
 * 	channelID: string;
 * 	title: string;
 * 	endsAt: number;
 * 	minimumWinners: number;
 * 	guildID: string;
 * 	minimum: number;
 * 	messageID: string;
 * 	id: string;
 * }
 *
 * interface Member {
 * 	points: number | null;
 * 	id: string;
 * }
 *
 * interface Moderation {
 * 	moderatorID: null | string;
 * 	extraData: string[] | null;
 * 	userID: string;
 * 	caseID: number;
 * 	id: string;
 * 	reason: null | string;
 * 	duration: number | null;
 * 	type: number;
 * 	guildID: string;
 * 	createdAt: number | null;
 * }
 *
 * interface Starboard {
 * 	channelID: string;
 * 	userID?: string;
 * 	guildID?: string;
 * 	disabled: boolean;
 * 	starMessageID: null | string;
 * 	stars: number;
 * 	messageID: string;
 * 	id: string;
 * }
 *
 * interface User {
 * 	points?: number;
 * 	id: string;
 * 	money?: number;
 * 	reputation?: number;
 * 	timeDaily?: number | null;
 * 	bannerList?: string[];
 * 	bias?: number;
 * 	marry?: null | string;
 * 	timeReputation?: number;
 * 	color?: string;
 * 	themeProfile?: string;
 * 	commandUses?: number;
 * 	badgeSet?: string[];
 * }
 */

export const DEPRECATED = false;
