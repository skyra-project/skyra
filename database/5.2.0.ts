import { Pool } from 'pg';
import { mergeDefault } from '@klasa/utils';
import { CLIENT_OPTIONS } from '../config';
import { join } from 'path';
import { readJSON, outputJSON } from 'fs-nextra';
import { RawBannerSettings } from '../src/lib/types/settings/raw/RawBannerSettings';
import { RawGiveawaySettings } from '../src/lib/types/settings/raw/RawGiveawaySettings';
import { RawMemberSettings } from '../src/lib/types/settings/raw/RawMemberSettings';
import { RawModerationSettings } from '../src/lib/types/settings/raw/RawModerationSettings';
import { RawStarboardSettings } from '../src/lib/types/settings/raw/RawStarboardSettings';
import { RawUserSettings } from '../src/lib/types/settings/raw/RawUserSettings';
import { RawCommandCounterSettings } from '../src/lib/types/settings/raw/RawCommandCounterSettings';
import { AnyObject } from '../src/lib/types/util';

async function main() {
	await migrateAll();

	const connection = mergeDefault({
		host: 'localhost',
		port: 5432,
		database: 'klasa',
		options: {
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000
		}
	}, CLIENT_OPTIONS.providers!.postgres);
	const pgsql = new Pool({
		...connection.options,
		host: connection.host,
		port: connection.port,
		user: connection.user,
		password: connection.password,
		database: connection.database
	});

	// eslint-disable-next-line @typescript-eslint/unbound-method
	pgsql.on('error', console.error);
	const dbconnection = await pgsql.connect();
	await uploadAll(pgsql);
	dbconnection.release();
	await pgsql.end();
}

async function migrateAll() {
	console.time('Migrating migrateBanners');
	await migrateBanners();
	console.timeEnd('Migrating migrateBanners');
	console.time('Migrating migrateClientStorage');
	await migrateClientStorage();
	console.timeEnd('Migrating migrateClientStorage');
	console.time('Migrating migrateCommandCounter');
	await migrateCommandCounter();
	console.timeEnd('Migrating migrateCommandCounter');
	console.time('Migrating migrateGiveaway');
	await migrateGiveaway();
	console.timeEnd('Migrating migrateGiveaway');
	console.time('Migrating migrateGuilds');
	await migrateGuilds();
	console.timeEnd('Migrating migrateGuilds');
	console.time('Migrating migrateMembers');
	await migrateMembers();
	console.timeEnd('Migrating migrateMembers');
	console.time('Migrating migrateModeration');
	await migrateModeration();
	console.timeEnd('Migrating migrateModeration');
	console.time('Migrating migrateStarboard');
	await migrateStarboard();
	console.timeEnd('Migrating migrateStarboard');
	console.time('Migrating migrateUsers');
	await migrateUsers();
	console.timeEnd('Migrating migrateUsers');
}

async function uploadAll(pgsql: Pool) {
	console.time('Uploading banners');
	await upload(pgsql, 'banners', 'banners');
	console.timeEnd('Uploading banners');
	// console.time('Uploading clientStorage');
	// await upload(pgsql, 'clientStorage', 'clientStorage');
	// console.timeEnd('Uploading clientStorage');
	console.time('Uploading commandCounter');
	await upload(pgsql, 'commandCounter', 'command_counter');
	console.timeEnd('Uploading commandCounter');
	console.time('Uploading giveaway');
	await upload(pgsql, 'giveaway', 'giveaway');
	console.timeEnd('Uploading giveaway');
	// console.time('Uploading guilds');
	// await upload(pgsql, 'guilds', 'guilds');
	// console.timeEnd('Uploading guilds');
	console.time('Uploading members');
	await upload(pgsql, 'members', 'members');
	console.timeEnd('Uploading members');
	console.time('Uploading moderation');
	await upload(pgsql, 'moderation', 'moderation');
	console.timeEnd('Uploading moderation');
	console.time('Uploading starboard');
	await upload(pgsql, 'starboard', 'starboard');
	console.timeEnd('Uploading starboard');
	console.time('Uploading users');
	await upload(pgsql, 'users', 'users');
	console.timeEnd('Uploading users');
}

const rootData = join(__dirname, '..', '..', 'database', 'data');

async function migrateBanners() {
	const entries = await readJSON(join(rootData, 'banners.json')) as Banners[];
	const transformed: RawBannerSettings[] = [];

	for (const bannerGroup of entries) {
		for (const banner of bannerGroup.banners) {
			transformed.push({
				id: banner.id,
				group: bannerGroup.id,
				title: banner.title,
				author_id: banner.author,
				price: banner.price
			});
		}
	}

	await outputJSON(join(rootData, 'banners.new.json'), transformed);
}

async function migrateClientStorage() {
	const entries = await readJSON(join(rootData, 'clientStorage.json')) as Partial<ClientStorage>[];
	const transformed: ClientStorage[] = [];

	for (const entry of entries) {
		transformed.push({
			boosts: {
				guilds: (entry.boosts && entry.boosts.guilds) || [],
				users: (entry.boosts && entry.boosts.users) || []
			},
			commandUses: entry.commandUses || 0,
			guildBlacklist: entry.guildBlacklist || [],
			userBlacklist: entry.userBlacklist || [],
			schedules: entry.schedules || []
		});
	}

	await outputJSON(join(rootData, 'clientStorage.new.json'), transformed);
}

async function migrateCommandCounter() {
	const entries = await readJSON(join(rootData, 'commandCounter.json')) as RawCommandCounterSettings[];
	const transformed: RawCommandCounterSettings[] = [];

	for (const entry of entries) {
		transformed.push({
			id: entry.id,
			uses: entry.uses
		});
	}

	await outputJSON(join(rootData, 'commandCounter.new.json'), transformed);
}

async function migrateGiveaway() {
	const entries = await readJSON(join(rootData, 'giveaway.json')) as Giveaway[];
	const transformed: RawGiveawaySettings[] = [];

	for (const entry of entries) {
		transformed.push({
			title: entry.title,
			ends_at: entry.endsAt,
			guild_id: entry.guildID,
			channel_id: entry.channelID,
			message_id: entry.messageID,
			minimum: entry.minimum,
			minimum_winners: entry.minimumWinners
		});
	}

	await outputJSON(join(rootData, 'giveaway.new.json'), transformed);
}

async function migrateGuilds() {
	const transformed = await readJSON(join(rootData, 'guilds.json'));
	await outputJSON(join(rootData, 'guilds.new.json'), transformed);
}

async function migrateMembers() {
	const entries = await readJSON(join(rootData, 'members.json')) as Member[];
	const transformed: RawMemberSettings[] = [];

	for (const entry of entries) {
		const [guildID, userID] = entry.id.split('.');
		transformed.push({
			guild_id: guildID,
			user_id: userID,
			point_count: entry.points || 0
		});
	}

	await outputJSON(join(rootData, 'members.new.json'), transformed);
}

async function migrateModeration() {
	const entries = await readJSON(join(rootData, 'moderation.json')) as Moderation[];
	const transformed: RawModerationSettings[] = [];
	const registeredCases = new Map<string, Set<number>>();

	for (const entry of entries) {
		const guildCases = (t => t || registeredCases.set(entry.guildID, new Set()).get(entry.guildID)!)(registeredCases.get(entry.guildID));
		if (guildCases.has(entry.caseID)) continue;
		guildCases.add(entry.caseID);

		transformed.push({
			case_id: entry.caseID,
			created_at: entry.createdAt,
			duration: typeof entry.duration === 'number' && entry.duration > 0 && entry.duration <= 31536000000 ? entry.duration : null,
			extra_data: entry.extraData,
			guild_id: entry.guildID,
			moderator_id: entry.moderatorID,
			reason: entry.reason,
			user_id: entry.userID,
			type: entry.type
		});
	}

	await outputJSON(join(rootData, 'moderation.new.json'), transformed);
}

async function migrateStarboard() {
	const entries = await readJSON(join(rootData, 'starboard.json')) as Starboard[];
	const transformed: RawStarboardSettings[] = [];
	const registeredStars = new Map<string, number>();

	for (const entry of entries) {
		// Skip incomplete data
		if (typeof entry.userID === 'undefined') continue;
		if (typeof entry.guildID === 'undefined') continue;
		const registeredStar = registeredStars.get(`${entry.guildID}.${entry.messageID}`);
		if (typeof registeredStar === 'number') {
			if (transformed[registeredStar].stars >= entry.stars) continue;
			console.log(`Star: Replacing ${entry.guildID}.${entry.messageID} (${transformed[registeredStar].stars}) for one with ${entry.stars}`);
			transformed[registeredStar] = {
				enabled: !entry.disabled,
				user_id: entry.userID,
				message_id: entry.messageID,
				channel_id: entry.channelID,
				guild_id: entry.guildID,
				star_message_id: entry.starMessageID,
				stars: entry.stars
			};
		} else {
			registeredStars.set(`${entry.guildID}.${entry.messageID}`, transformed.length);
			transformed.push({
				enabled: !entry.disabled,
				user_id: entry.userID,
				message_id: entry.messageID,
				channel_id: entry.channelID,
				guild_id: entry.guildID,
				star_message_id: entry.starMessageID,
				stars: entry.stars
			});
		}
	}

	await outputJSON(join(rootData, 'starboard.new.json'), transformed);
}

async function migrateUsers() {
	const entries = await readJSON(join(rootData, 'users.json')) as User[];
	const transformed: RawUserSettings[] = [];

	for (const entry of entries) {
		transformed.push({
			id: entry.id,
			command_uses: entry.commandUses || 0,
			banner_list: entry.bannerList || [],
			badge_set: entry.badgeSet || [],
			badge_list: [],
			color: typeof entry.color === 'string' ? parseInt(entry.color, 16) : 0,
			marry: entry.marry ? [entry.marry] : [],
			money: Math.round(entry.money || 0),
			point_count: Math.round(entry.points || 0),
			reputation_count: Math.round(entry.reputation || 0),
			theme_level: '1001',
			theme_profile: entry.themeProfile || '0001',
			next_daily: entry.timeDaily || null,
			next_reputation: entry.timeReputation || null
		});
	}

	await outputJSON(join(rootData, 'users.new.json'), transformed);
}

async function upload(pgsql: Pool, name: string, databaseName: string) {
	const data = await readJSON(join(rootData, `${name}.new.json`)) as AnyObject[];
	if (data.length === 0) return;

	const keys = Object.keys(data[0]);
	const stringifiedData = JSON.stringify(data).replace(/'/g, "''");
	await pgsql.query(/* sql */`
		WITH data_json (entries) as (
			VALUES ('${stringifiedData}'::json)
		)
		INSERT INTO "${databaseName}" ("${keys.join('", "')}")
		SELECT p.*
		FROM data_json l
			CROSS JOIN LATERAL json_populate_recordset(null::"${databaseName}", entries) as p
			ON CONFLICT DO NOTHING;
	`);
}

// eslint-disable-next-line @typescript-eslint/unbound-method
main().catch(console.error);

interface Banners {
	banners: Banner[];
	id: string;
}

interface Banner {
	id: string;
	resAuthor: string;
	author: string;
	price: number;
	title: string;
}

interface ClientStorage {
	commandUses: number;
	userBlacklist: readonly string[];
	guildBlacklist: readonly string[];
	schedules: readonly object[];
	boosts: {
		guilds: readonly string[];
		users: readonly string[];
	};
}

interface Giveaway {
	channelID: string;
	title: string;
	endsAt: number;
	minimumWinners: number;
	guildID: string;
	minimum: number;
	messageID: string;
	id: string;
}

interface Member {
	points: number | null;
	id: string;
}

interface Moderation {
	moderatorID: null | string;
	extraData: string[] | null;
	userID: string;
	caseID: number;
	id: string;
	reason: null | string;
	duration: number | null;
	type: number;
	guildID: string;
	createdAt: number | null;
}

interface Starboard {
	channelID: string;
	userID?: string;
	guildID?: string;
	disabled: boolean;
	starMessageID: null | string;
	stars: number;
	messageID: string;
	id: string;
}

interface User {
	points?: number;
	id: string;
	money?: number;
	reputation?: number;
	timeDaily?: number | null;
	bannerList?: string[];
	bias?: number;
	marry?: null | string;
	timeReputation?: number;
	color?: string;
	themeProfile?: string;
	commandUses?: number;
	badgeSet?: any[];
}
