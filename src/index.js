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
	GuildConfiguration: require('./lib/structures/GuildConfiguration'),
	MemberConfiguration: require('./lib/structures/MemberConfiguration'),
	UserConfiguration: require('./lib/structures/UserConfiguration'),
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

	// Moderation
	AntiRaid: require('./lib/util/AntiRaid'),
	GuildSecurity: require('./lib/util/GuildSecurity'),
	Moderation: require('./lib/util/Moderation'),
	ModerationLog: require('./lib/util/ModerationLog'),
	NoMentionSpam: require('./lib/util/NoMentionSpam'),

	klasaUtil: klasa.util,
	discordUtil: discord.Util,

	versions: {
		get skyra() { return module.exports.version; },
		klasa: klasa.version,
		discord: discord.version
	}
};
