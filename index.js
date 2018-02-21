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

	ModerationCommand: require('./lib/structures/ModerationCommand'),

	// Custom API store and piece
	API: require('./lib/structures/API'),
	APIStore: require('./lib/structures/APIStore'),

	// IPC
	IPC: require('./lib/ipc/Controller'),

	// Util
	Duration: require('./lib/util/Duration'),
	LanguageHelp: require('./lib/util/LanguageHelp'),
	Leaderboard: require('./lib/util/Leaderboard'),
	parseHTML: require('./lib/util/parseHTML'),
	PreciseTimeout: require('./lib/util/PreciseTimeout'),
	PromptList: require('./lib/util/PromptList'),
	TimeParser: require('./lib/util/TimeParser'),
	toJSON: require('./lib/util/ToJSON'),
	util: require('./lib/util/util'),

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
