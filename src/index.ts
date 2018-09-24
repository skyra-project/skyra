export {
	Argument,
	ArgumentStore,
	Client,
	Colors,
	CommandPrompt,
	CommandStore,
	CommandUsage,
	Cron,
	Duration,
	EventStore,
	ExtendableStore,
	FinalizerStore,
	Gateway,
	GatewayDriver,
	GatewayStorage,
	InhibitorStore,
	KlasaClient,
	KlasaConsole,
	KlasaGuild,
	KlasaMessage,
	KlasaUser,
	LanguageStore,
	MonitorStore,
	Piece,
	Possible,
	ProviderStore,
	QueryBuilder,
	ReactionHandler,
	RichDisplay,
	RichMenu,
	Schedule,
	ScheduledTask,
	Schema,
	SchemaFolder,
	SchemaPiece,
	Settings,
	Serializer,
	SerializerStore,
	SQLProvider,
	Stopwatch,
	Store,
	Tag,
	TaskStore,
	TextPrompt,
	Timestamp,
	Type,
	Usage
} from 'klasa';
export {
	Activity,
	Base,
	BaseClient,
	CategoryChannel,
	Channel,
	ChannelStore,
	ClientApplication,
	Collection,
	Collector,
	DataResolver,
	DataStore,
	DiscordAPIError,
	DMChannel,
	Emoji,
	GroupDMChannel,
	Guild,
	GuildAuditLogs,
	GuildChannel,
	GuildChannelStore,
	GuildEmoji,
	GuildEmojiRoleStore,
	GuildEmojiStore,
	GuildMember,
	GuildMemberRoleStore,
	GuildMemberStore,
	GuildStore,
	Invite,
	Message,
	MessageAttachment,
	MessageCollector,
	MessageMentions,
	MessageReaction,
	MessageStore,
	PermissionOverwrites,
	Permissions,
	Presence,
	PresenceStore,
	ReactionCollector,
	ReactionEmoji,
	ReactionUserStore,
	RichPresenceAssets,
	Role,
	RoleStore,
	Shard,
	ShardClientUtil,
	ShardingManager,
	Snowflake,
	SnowflakeUtil,
	Structures,
	TextChannel,
	User,
	UserStore,
	VoiceChannel,
	VoiceRegion,
	Webhook,
	WebhookClient
} from 'discord.js';

import { join } from 'path';
import { VERSION } from '../config';

export const root: string = join(__dirname);
export const assets: string = join(__dirname, '..', 'assets');
export const version: string = VERSION;

// SkyraClient
export { default as Skyra } from './lib/Skyra';

// Extensions
export { default as SkyraGuild } from './lib/extensions/SkyraGuild';
export { default as SkyraGuildMember } from './lib/extensions/SkyraGuildMember';

module.exports = {
	assetsFolder: join(__dirname, '..', 'assets'),
	rootFolder: __dirname,

	// Export everything from Discord.js
	...discord,

	// Export everything from Klasa
	...klasa,

	// SkyraClient
	Skyra: require('./lib/Skyra'),
	config: require('../config'),
	version: require('../config').version,

	// Extensions
	SkyraGuild: require('./lib/extensions/SkyraGuild'),
	SkyraGuildMember: require('./lib/extensions/SkyraGuildMember'),

	// Structures
	GuildSettings: require('./lib/structures/GuildSettings'),
	MemberSettings: require('./lib/structures/MemberSettings'),
	UserSettings: require('./lib/structures/UserSettings'),
	StarboardManager: require('./lib/structures/StarboardManager'),
	StarboardMessage: require('./lib/structures/StarboardMessage'),

	ModerationCommand: require('./lib/structures/ModerationCommand'),
	WeebCommand: require('./lib/structures/WeebCommand'),

	// Custom API store and piece
	API: require('./lib/structures/API'),
	APIStore: require('./lib/structures/APIStore'),
	RawEvent: require('./lib/structures/RawEvent'),
	RawEventStore: require('./lib/structures/RawEventStore'),

	// Util
	Color: require('./lib/util/Color'),
	FriendlyDuration: require('./lib/util/FriendlyDuration'),
	FuzzySearch: require('./lib/util/FuzzySearch'),
	LanguageHelp: require('./lib/util/LanguageHelp'),
	Leaderboard: require('./lib/util/Leaderboard'),
	PreciseTimeout: require('./lib/util/PreciseTimeout'),
	PromptList: require('./lib/util/PromptList'),
	ToJSON: require('./lib/util/ToJSON'),
	DatabaseInit: require('./lib/util/DatabaseInit'),
	constants: require('./lib/util/constants'),
	util: require('./lib/util/util'),

	// Util/External
	rUnicodeEmoji: require('./lib/util/External/rUnicodeEmoji'),
	levenshtein: require('./lib/util/External/levenshtein'),

	// Games
	ConnectFour: require('./lib/util/Games/ConnectFour'),
	ConnectFourManager: require('./lib/util/Games/ConnectFourManager'),
	Slotmachine: require('./lib/util/Games/Slotmachine'),

	// Ratelimits
	TimeoutManager: require('./lib/util/Ratelimits/TimeoutManager'),

	// Moderation
	AntiRaid: require('./lib/util/Security/AntiRaid'),
	GuildSecurity: require('./lib/util/GuildSecurity'),
	ModerationManager: require('./lib/structures/ModerationManager'),
	ModerationManagerEntry: require('./lib/structures/ModerationManagerEntry'),
	NoMentionSpam: require('./lib/util/Security/NoMentionSpam'),

	klasaUtil: klasa.util,
	discordUtil: discord.Util,

	versions: {
		get skyra() { return module.exports.version; },
		klasa: klasa.version,
		discord: discord.version
	}
};
