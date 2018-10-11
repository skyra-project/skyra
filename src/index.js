const klasa = require('klasa');
const discord = require('discord.js');
const { join } = require('path');

// Load all dependencies
Object.keys(JSON.parse(require('fs').readFileSync('./package.json', 'utf8')).dependencies).forEach(mod => require(mod));

module.exports = {
	rootFolder: __dirname,
	assetsFolder: join(__dirname, '..', 'assets'),

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
	UserRichDisplay: require('./lib/structures/UserRichDisplay'),
	SettingsMenu: require('./lib/structures/SettingsMenu'),

	ModerationCommand: require('./lib/structures/ModerationCommand'),
	WeebCommand: require('./lib/structures/WeebCommand'),

	// Custom API store and piece
	API: require('./lib/structures/API'),
	APIStore: require('./lib/structures/APIStore'),
	RawEvent: require('./lib/structures/RawEvent'),
	RawEventStore: require('./lib/structures/RawEventStore'),

	// Util
	Adder: require('./lib/util/Adder'),
	LongLivingReactionCollector: require('./lib/util/LongLivingReactionCollector'),
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
