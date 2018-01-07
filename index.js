module.exports = {
	// SkyraClient
	Skyra: require('./lib/Skyra'),
	config: require('./config'),
	version: require('./config').version,

	// Structures
	GuildConfiguration: require('./lib/structures/GuildConfiguration'),
	UserConfiguration: require('./lib/structures/UserConfiguration'),
	Task: require('./lib/structures/Task'),
	TaskStore: require('./lib/structures/TaskStore'),

	// Util
	Clock: require('./lib/util/Clock'),
	Duration: require('./lib/util/Duration'),
	Leaderboard: require('./lib/util/Leaderboard'),
	PreciseTimeout: require('./lib/util/PreciseTimeout'),
	TimeParser: require('./lib/util/TimeParser'),
	util: require('./lib/util/util'),

	// Moderation
	AntiRaid: require('./lib/util/AntiRaid'),
	Moderation: require('./lib/util/Moderation'),
	ModerationLog: require('./lib/util/ModerationLog'),
	NoMentionSpam: require('./lib/util/NoMentionSpam')
};
