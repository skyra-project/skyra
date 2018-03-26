const klasa = require('klasa');

module.exports = {
	rootFolder: __dirname,

	// Export everything from Klasa
	...klasa,

	// SkyraClient
	Skyra: require('./lib/Skyra'),
	config: require('./config'),
	version: require('./config').version,

	// Extensions
	SkyraGuild: require('./lib/extensions/SkyraGuild'),
	SkyraGuildMember: require('./lib/extensions/SkyraGuildMember'),

	// Structures
	GuildConfiguration: require('./lib/structures/GuildConfiguration'),
	MemberConfiguration: require('./lib/structures/MemberConfiguration'),
	UserConfiguration: require('./lib/structures/UserConfiguration'),
	Starboard: require('./lib/structures/Starboard'),
	StarboardMessage: require('./lib/structures/StarboardMessage'),

	ModerationCommand: require('./lib/structures/ModerationCommand'),

	// Custom API store and piece
	API: require('./lib/structures/API'),
	APIStore: require('./lib/structures/APIStore'),
	RawEvent: require('./lib/structures/RawEvent'),
	RawEventStore: require('./lib/structures/RawEventStore'),

	// IPC
	IPC: require('./lib/ipc/Controller'),

	// Util
	Color: require('./lib/util/Color'),
	FriendlyDuration: require('./lib/util/FriendlyDuration'),
	LanguageHelp: require('./lib/util/LanguageHelp'),
	Leaderboard: require('./lib/util/Leaderboard'),
	parseHTML: require('./lib/util/parseHTML'),
	PreciseTimeout: require('./lib/util/PreciseTimeout'),
	PromptList: require('./lib/util/PromptList'),
	toJSON: require('./lib/util/ToJSON'),
	databaseInit: require('./lib/util/databaseInit'),
	constants: require('./lib/util/constants'),
	util: require('./lib/util/util'),

	// Games
	ConnectFour: require('./lib/util/Games/ConnectFour'),
	ConnectFourManager: require('./lib/util/Games/ConnectFourManager'),
	Slotmachine: require('./lib/util/Games/Slotmachine'),

	// Overwatch
	overwatch: require('./lib/util/overwatch/index'),

	// Moderation
	AntiRaid: require('./lib/util/AntiRaid'),
	GuildSecurity: require('./lib/util/GuildSecurity'),
	Moderation: require('./lib/util/Moderation'),
	ModerationLog: require('./lib/util/ModerationLog'),
	NoMentionSpam: require('./lib/util/NoMentionSpam'),

	klasaUtil: klasa.util
};
