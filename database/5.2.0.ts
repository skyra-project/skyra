// import { Pool } from 'pg';
// import { mergeDefault } from '@klasa/utils';
// import { CLIENT_OPTIONS } from '../config';
import { join } from 'path';
import { readJSON, outputJSON, copy } from 'fs-nextra';
import { RawBannerSettings } from '../src/lib/types/settings/raw/RawBannerSettings';
import { RawGiveawaySettings } from '../src/lib/types/settings/raw/RawGiveawaySettings';
import { RawMemberSettings } from '../src/lib/types/settings/raw/RawMemberSettings';
import { RawModerationSettings } from '../src/lib/types/settings/raw/RawModerationSettings';
import { RawStarboardSettings } from '../src/lib/types/settings/raw/RawStarboardSettings';
import { RawUserSettings } from '../src/lib/types/settings/raw/RawUserSettings';

async function main() {
	await migrate();

	// const connection = mergeDefault({
	// 	host: 'localhost',
	// 	port: 5432,
	// 	database: 'klasa',
	// 	options: {
	// 		max: 20,
	// 		idleTimeoutMillis: 30000,
	// 		connectionTimeoutMillis: 2000
	// 	}
	// }, CLIENT_OPTIONS.providers.postgres);
	// const pgsql = new Pool({
	// 	...connection.options,
	// 	host: connection.host,
	// 	port: connection.port,
	// 	user: connection.user,
	// 	password: connection.password,
	// 	database: connection.database
	// });

	// pgsql.on('error', console.error);
	// const dbconnection = await pgsql.connect();
	// dbconnection.release();
}

async function migrate() {
	await migrateBanners();
	await migrateClientStorage();
	await migrateCommandCounter();
	await migrateGiveaway();
	await migrateGuilds();
	await migrateMembers();
	await migrateModeration();
	await migrateStarboard();
	await migrateUsers();
}

const rootData = join(__dirname, '..', '..', 'database', 'data');

async function migrateBanners() {
	const entries = await readJSON(join(rootData, 'banners.json')) as Banners[];
	const transformed: RawBannerSettings[] = [];

	for (const bannerGroup of entries) {
		for (const banner of bannerGroup.banners) {
			transformed.push({
				author_id: banner.author,
				group: bannerGroup.id,
				id: banner.id,
				price: banner.price,
				title: banner.title
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
	await copy(join(rootData, 'commandCounter.json'), join(rootData, 'commandCounter.new.json'));
}

async function migrateGiveaway() {
	const entries = await readJSON(join(rootData, 'giveaway.json')) as Giveaway[];
	const transformed: RawGiveawaySettings[] = [];

	for (const entry of entries) {
		transformed.push({
			channel_id: entry.channelID,
			ends_at: entry.endsAt,
			guild_id: entry.guildID,
			message_id: entry.messageID,
			minimum: entry.minimum,
			minimum_winners: entry.minimumWinners,
			title: entry.title
		});
	}

	await outputJSON(join(rootData, 'giveaway.new.json'), transformed);
}

async function migrateGuilds() {
	await copy(join(rootData, 'guilds.json'), join(rootData, 'guilds.new.json'));
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

	for (const entry of entries) {
		transformed.push({
			case_id: entry.caseID,
			created_at: entry.createdAt,
			duration: entry.duration,
			extra_data: entry.extraData,
			guild_id: entry.guildID,
			moderator_id: entry.moderatorID,
			reason: entry.reason,
			type: entry.type,
			user_id: entry.userID
		});
	}

	await outputJSON(join(rootData, 'moderation.new.json'), transformed);
}

async function migrateStarboard() {
	const entries = await readJSON(join(rootData, 'starboard.json')) as Starboard[];
	const transformed: RawStarboardSettings[] = [];

	for (const entry of entries) {
		// Skip incomplete data
		if (typeof entry.userID === 'undefined') continue;
		if (typeof entry.guildID === 'undefined') continue;
		transformed.push({
			channel_id: entry.channelID,
			enabled: !entry.disabled,
			guild_id: entry.guildID,
			message_id: entry.messageID,
			star_message_id: entry.starMessageID,
			stars: entry.stars,
			user_id: entry.userID
		});
	}

	await outputJSON(join(rootData, 'starboard.new.json'), transformed);
}

async function migrateUsers() {
	const entries = await readJSON(join(rootData, 'users.json')) as User[];
	const transformed: RawUserSettings[] = [];

	for (const entry of entries) {
		transformed.push({
			badge_list: [],
			badge_set: entry.badgeSet || [],
			banner_list: entry.bannerList || [],
			color: typeof entry.color === 'string' ? parseInt(entry.color, 16) : 0,
			command_uses: entry.commandUses || 0,
			id: entry.id,
			marry: entry.marry ? [entry.marry] : [],
			money: entry.money || 0,
			next_daily: entry.timeDaily || null,
			next_reputation: entry.timeReputation || null,
			point_count: entry.points || 0,
			reputation_count: entry.reputation || 0,
			theme_level: '1001',
			theme_profile: entry.themeProfile || '0001'
		});
	}

	await outputJSON(join(rootData, 'users.new.json'), transformed);
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
