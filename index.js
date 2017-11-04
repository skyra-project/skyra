module.exports = {
	Client: require('./lib/client'),

	Command: require('./lib/structures/Command'),
	CommandMessage: require('./lib/structures/CommandMessage'),
	Event: require('./lib/structures/Event'),
	Extendable: require('./lib/structures/Extendable'),
	Finalizer: require('./lib/structures/Finalizer'),
	Inhibitor: require('./lib/structures/Inhibitor'),
	Language: require('./lib/structures/Language'),
	Monitor: require('./lib/structures/Monitor'),
	PermissionLevels: require('./lib/structures/PermissionLevels'),

	console: {
		Colors: require('./lib/console/Colors'),
		Console: require('./lib/console/Console')
	},

	util: require('./lib/util/util'),
	ReactionHandler: require('./lib/util/ReactionHandler'),
	RichDisplay: require('./lib/util/RichDisplay'),
	RichMenu: require('./lib/util/RichMenu'),
	StopWatch: require('./lib/util/Stopwatch'),

	CommandStore: require('./lib/structures/CommandStore'),
	EventStore: require('./lib/structures/EventStore'),
	ExtendableStore: require('./lib/structures/ExtendableStore'),
	FinalizerStore: require('./lib/structures/FinalizerStore'),
	InhibitorStore: require('./lib/structures/InhibitorStore'),
	LanguageStore: require('./lib/structures/LanguageStore'),
	MonitorStore: require('./lib/structures/MonitorStore'),

	Piece: require('./lib/structures/interfaces/Piece'),
	Store: require('./lib/structures/interfaces/Store'),

	ArgResolver: require('./lib/parsers/ArgResolver'),
	Resolver: require('./lib/parsers/Resolver'),
	SettingResolver: require('./lib/parsers/SettingResolver'),
	ParsedUsage: require('./lib/usage/ParsedUsage'),
	Possible: require('./lib/usage/Possible'),
	Tag: require('./lib/usage/Tag'),
	version: '2.1.0 SSU',

	Providers: {
		json: require('./providers/json'),
		rethink: require('./providers/rethink')
	},

	Constants: require('./utils/constants'),
	Interfaces: {
		AdvancedSearch: require('./utils/interfaces/AdvancedSearch'),
		GlobalUser: require('./utils/interfaces/GlobalUser'),
		LocalMember: require('./utils/interfaces/LocalMember'),
		GuildSettings: require('./utils/interfaces/GuildSettings'),
		Moderation: require('./utils/interfaces/moderation')
	},
	Managers: {
		Clock: require('./utils/managers/clock'),
		SocialGlobal: require('./utils/managers/socialGlobal'),
		SocialLocal: require('./utils/managers/socialLocal'),
		Guild: require('./utils/managers/guilds')
	},
	announcement: require('./utils/announcement'),
	AntiRaid: require('./utils/anti-raid'),
	Assets: require('./utils/assets'),
	Canvas: require('./utils/canvas-constructor'),
	ModLog: require('./utils/createModlog'),
	Crypto: require('./utils/crypto'),
	Handler: require('./utils/handler'),
	hastebin: require('./utils/hastebin'),
	taskProcess: require('./utils/taskProcess'),
	Timer: require('./utils/timer'),

	colorResolver: require('./utils/color/index'),
	colorUtil: require('./utils/color'),

	overwatch: {
		main: require('./utils/overwatch'),
		playedHeroes: require('./utils/overwatch/playedheroes'),
		roles: require('./utils/overwatch/roles')
	},

	config: require('./config')
};
