module.exports = {
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

	// Util
	Duration: require('./lib/util/Duration'),
	LanguageHelp: require('./lib/util/LanguageHelp'),
	Leaderboard: require('./lib/util/Leaderboard'),
	PreciseTimeout: require('./lib/util/PreciseTimeout'),
	TimeParser: require('./lib/util/TimeParser'),
	util: require('./lib/util/util'),

	// Moderation
	AntiRaid: require('./lib/util/AntiRaid'),
	GuildSecurity: require('./lib/util/GuildSecurity'),
	Moderation: require('./lib/util/Moderation'),
	ModerationLog: require('./lib/util/ModerationLog'),
	NoMentionSpam: require('./lib/util/NoMentionSpam')
};
