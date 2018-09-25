import { version as discordVersion } from 'discord.js';
import { version as klasaVersion } from 'klasa';

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
export * from './lib/types/klasa';

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
// Structures
export { default as GuildSettings } from './lib/structures/GuildSettings';
export { default as MemberSettings } from './lib/structures/MemberSettings';
export { default as UserSettings } from './lib/structures/UserSettings';
export { default as StarboardManager } from './lib/structures/StarboardManager';
export { default as StarboardMessage } from './lib/structures/StarboardMessage';

export { default as ModerationCommand } from './lib/structures/ModerationCommand';
export { default as WeebCommand } from './lib/structures/WeebCommand';

	// Custom API store and piece
export { default as API } from './lib/structures/API';
export { default as APIStore } from './lib/structures/APIStore';
export { default as RawEvent } from './lib/structures/RawEvent';
export { default as RawEventStore } from './lib/structures/RawEventStore';

	// Util
export { default as Color } from './lib/util/Color';
export { default as FriendlyDuration } from './lib/util/FriendlyDuration';
export { default as FuzzySearch } from './lib/util/FuzzySearch';
export { default as LanguageHelp } from './lib/util/LanguageHelp';
export { default as Leaderboard } from './lib/util/Leaderboard';
export { default as PreciseTimeout } from './lib/util/PreciseTimeout';
export { default as PromptList } from './lib/util/PromptList';
export { default as ToJSON } from './lib/util/ToJSON';
export { default as DatabaseInit } from './lib/util/DatabaseInit';
export { default as constants } from './lib/util/constants';
export { default as util } from './lib/util/util';

	// Util/External
export { default as rUnicodeEmoji } from './lib/util/External/rUnicodeEmoji';
export { default as levenshtein } from './lib/util/External/levenshtein';

	// Games
export { default as ConnectFour } from './lib/util/Games/ConnectFour';
export { default as ConnectFourManager } from './lib/util/Games/ConnectFourManager';
export { default as Slotmachine } from './lib/util/Games/Slotmachine';

	// Ratelimits
export { default as TimeoutManager } from './lib/util/Ratelimits/TimeoutManager';

	// Moderation
export { default as AntiRaid } from './lib/util/Security/AntiRaid';
export { default as GuildSecurity } from './lib/util/GuildSecurity';
export { default as ModerationManager } from './lib/structures/ModerationManager';
export { default as ModerationManagerEntry } from './lib/structures/ModerationManagerEntry';
export { default as NoMentionSpam } from './lib/util/Security/NoMentionSpam';

export { util as klasaUtil } from 'klasa';
export { Util as discordUtil } from 'discord.js';

export const versions: { skyra: string; klasa: string; discord: string } = {
	discord: discordVersion,
	klasa: klasaVersion,
	skyra: VERSION,
};
