const { Language, version } = require('klasa');
const { LanguageHelp, Duration, util, klasaUtil, constants: { EMOJIS: { SHINY } } } = require('../index');

const builder = new LanguageHelp()
	.setExplainedUsage('⚙ | ***Explained usage***')
	.setPossibleFormats('🔢 | ***Possible formats***')
	.setExamples('🔗 | ***Examples***')
	.setReminder('⏰ | ***Reminder***');

const TIMES = {
	YEAR: {
		1: 'year',
		DEFAULT: 'years'
	},
	MONTH: {
		1: 'month',
		DEFAULT: 'months'
	},
	WEEK: {
		1: 'week',
		DEFAULT: 'weeks'
	},
	DAY: {
		1: 'day',
		DEFAULT: 'days'
	},
	HOUR: {
		1: 'hour',
		DEFAULT: 'hours'
	},
	MINUTE: {
		1: 'minute',
		DEFAULT: 'minutes'
	},
	SECOND: {
		1: 'second',
		DEFAULT: 'seconds'
	}
};

const PERMS = {
	ADMINISTRATOR: 'Administrator',
	VIEW_AUDIT_LOG: 'View Audit Log',
	MANAGE_GUILD: 'Manage Server',
	MANAGE_ROLES: 'Manage Roles',
	MANAGE_CHANNELS: 'Manage Channels',
	KICK_MEMBERS: 'Kick Members',
	BAN_MEMBERS: 'Ban Members',
	CREATE_INSTANT_INVITE: 'Create Instant Invite',
	CHANGE_NICKNAME: 'Change Nickname',
	MANAGE_NICKNAMES: 'Manage Nicknames',
	MANAGE_EMOJIS: 'Manage Emojis',
	MANAGE_WEBHOOKS: 'Manage Webhooks',
	VIEW_CHANNEL: 'Read Messages',
	SEND_MESSAGES: 'Send Messages',
	SEND_TTS_MESSAGES: 'Send TTS Messages',
	MANAGE_MESSAGES: 'Manage Messages',
	EMBED_LINKS: 'Embed Links',
	ATTACH_FILES: 'Attach Files',
	READ_MESSAGE_HISTORY: 'Read Message History',
	MENTION_EVERYONE: 'Mention Everyone',
	USE_EXTERNAL_EMOJIS: 'Use External Emojis',
	ADD_REACTIONS: 'Add Reactions',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	MUTE_MEMBERS: 'Mute Members',
	DEAFEN_MEMBERS: 'Deafen Members',
	MOVE_MEMBERS: 'Move Members',
	USE_VAD: 'Use Voice Activity'
};

const random = num => Math.round(Math.random() * num);

const EIGHT_BALL = {
	WHEN: ['Soon™', 'Maybe tomorrow.', 'Maybe next year...', 'Right now.', 'In a few months.'],
	WHAT: ['A plane.', 'What? Ask again.', 'A gift.', 'Nothing.', 'A ring.', 'I do not know, maybe something.'],
	HOWMUCH: ['A lot.', 'A bit.', 'A few.', 'Ask me tomorrow.', 'I do not know, ask a physicist.', 'Nothing.', `Within ${random(10)} and ${random(1000)}L.`, `${random(10)}e${random(1000)}L.`, "2 or 3 liters, I don't remember.", 'Infinity.', '1010 liters.'],
	HOWMANY: ['A lot.', 'A bit.', 'A few.', 'Ask me tomorrow.', "I don't know, ask a physicist.", 'Nothing.', `Within ${random(10)} and ${random(1000)}.`, `${random(10)}e${random(1000)}.`, '2 or 3, I do not remember.', 'Infinity', '1010.'],
	WHY: ['Maybe genetics.', 'Because somebody decided it.', 'For the glory of satan, of course!', 'I do not know, maybe destiny.', 'Because I said so.', 'I have no idea.', 'Harambe did nothing wrong.', 'Ask the owner of this server.', 'Ask again.', 'To get to the other side.', 'It says so in the Bible.'],
	WHO: ['A human.', 'A robot.', 'An airplane.', 'A bird.', 'A carbon composition.', 'A bunch of zeroes and ones.', 'I have no clue, is it material?', 'That is not logical.'],
	ELSE: ['Most likely.', 'Nope.', 'YES!', 'Maybe.']
};

function duration(time) { // eslint-disable-line no-unused-vars
	return Duration.duration(time, TIMES);
}

module.exports = class extends Language {

	constructor(...args) {
		super(...args);

		this.PERMISSIONS = PERMS;
		this.EIGHT_BALL = EIGHT_BALL;

		this.HUMAN_LEVELS = {
			0: 'None',
			1: 'Low',
			2: 'Medium',
			3: '(╯°□°）╯︵ ┻━┻',
			4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
		};

		this.duration = duration;

		this.language = {
			/**
			 * ################################
			 * #      FRAMEWORK MESSAGES      #
			 * #         KLASA 0.5.0d         #
			 * ################################
			 */

			DEFAULT: (key) => `${key} has not been localized for en-US yet.`,
			DEFAULT_LANGUAGE: 'Default Language',
			SETTING_GATEWAY_EXPECTS_GUILD: 'The parameter <Guild> expects either a Guild or a Guild Object.',
			SETTING_GATEWAY_VALUE_FOR_KEY_NOEXT: (data, key) => `The value ${data} for the key ${key} does not exist.`,
			SETTING_GATEWAY_VALUE_FOR_KEY_ALREXT: (data, key) => `The value ${data} for the key ${key} already exists.`,
			SETTING_GATEWAY_SPECIFY_VALUE: 'You must specify the value to add or filter.',
			SETTING_GATEWAY_KEY_NOT_ARRAY: (key) => `The key ${key} is not an Array.`,
			SETTING_GATEWAY_KEY_NOEXT: (key) => `The key ${key} does not exist in the current data schema.`,
			SETTING_GATEWAY_INVALID_TYPE: 'The type parameter must be either add or remove.',
			RESOLVER_INVALID_CUSTOM: (name, type) => `${name} must be a valid ${type}.`,
			RESOLVER_INVALID_PIECE: (name, piece) => `${name} must be a valid ${piece} name.`,
			RESOLVER_INVALID_MSG: (name) => `${name} must be a valid message id.`,
			RESOLVER_INVALID_USER: (name) => `${name} must be a mention or valid user id.`,
			RESOLVER_INVALID_MEMBER: (name) => `${name} must be a mention or valid user id.`,
			RESOLVER_INVALID_CHANNEL: (name) => `${name} must be a channel tag or valid channel id.`,
			RESOLVER_INVALID_EMOJI: (name) => `${name} must be a custom emoji tag or valid emoji id.`,
			RESOLVER_INVALID_GUILD: (name) => `${name} must be a valid guild id.`,
			RESOLVER_INVALID_ROLE: (name) => `${name} must be a role mention or role id.`,
			RESOLVER_INVALID_LITERAL: (name) => `Your option did not match the only possibility: ${name}`,
			RESOLVER_INVALID_BOOL: (name) => `${name} must be true or false.`,
			RESOLVER_INVALID_INT: (name) => `${name} must be an integer.`,
			RESOLVER_INVALID_FLOAT: (name) => `${name} must be a valid number.`,
			RESOLVER_INVALID_REGEX_MATCH: (name, pattern) => `${name} must follow this regex pattern \`${pattern}\`.`,
			RESOLVER_INVALID_URL: (name) => `${name} must be a valid url.`,
			RESOLVER_INVALID_DATE: (name) => `${name} must be a valid date.`,
			RESOLVER_INVALID_DURATION: (name) => `${name} must be a valid duration string.`,
			RESOLVER_INVALID_TIME: (name) => `${name} must be a valid duration or date string.`,
			RESOLVER_STRING_SUFFIX: ' characters',
			RESOLVER_MINMAX_EXACTLY: (name, min, suffix) => `${name} must be exactly ${min}${suffix}.`,
			RESOLVER_MINMAX_BOTH: (name, min, max, suffix) => `${name} must be between ${min} and ${max}${suffix}.`,
			RESOLVER_MINMAX_MIN: (name, min, suffix) => `${name} must be greater than ${min}${suffix}.`,
			RESOLVER_MINMAX_MAX: (name, max, suffix) => `${name} must be less than ${max}${suffix}.`,
			REACTIONHANDLER_PROMPT: 'Which page would you like to jump to?',
			COMMANDMESSAGE_MISSING: 'Missing one or more required arguments after end of input.',
			COMMANDMESSAGE_MISSING_REQUIRED: (name) => `${name} is a required argument.`,
			COMMANDMESSAGE_MISSING_OPTIONALS: (possibles) => `Missing a required option: (${possibles})`,
			COMMANDMESSAGE_NOMATCH: (possibles) => `Your option didn't match any of the possibilities: (${possibles})`,
			MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error, time) => `${tag} | **${error}** | You have **${time}** seconds to respond to this prompt with a valid argument. Type **"ABORT"** to abort this prompt.`, // eslint-disable-line max-len
			MONITOR_COMMAND_HANDLER_REPEATING_REPROMPT: (tag, name, time) => `${tag} | **${name}** is a repeating argument | You have **${time}** seconds to respond to this prompt with additional valid arguments. Type **"CANCEL"** to cancel this prompt.`, // eslint-disable-line max-len
			MONITOR_COMMAND_HANDLER_ABORTED: 'Aborted',
			INHIBITOR_COOLDOWN: (remaining) => `You have just used this command. You can use this command again in ${remaining} seconds.`,
			INHIBITOR_DISABLED: 'This command is currently disabled',
			INHIBITOR_MISSING_BOT_PERMS: (missing) => `Insufficient permissions, missing: **${missing}**`,
			INHIBITOR_NSFW: 'You may not use NSFW commands in this channel.',
			INHIBITOR_PERMISSIONS: 'You do not have permission to use this command',
			INHIBITOR_REQUIRED_CONFIGS: (configs) => `The guild is missing the **${configs.join(', ')}** guild setting${configs.length !== 1 ? 's' : ''} and thus the command cannot run.`,
			INHIBITOR_RUNIN: (types) => `This command is only available in ${types} channels`,
			INHIBITOR_RUNIN_NONE: (name) => `The ${name} command is not configured to run in any channel.`,
			COMMAND_BLACKLIST_DESCRIPTION: 'Blacklists or un-blacklists users and guilds from the bot.',
			COMMAND_BLACKLIST_SUCCESS: (usersAdded, usersRemoved, guildsAdded, guildsRemoved) => [
				usersAdded.length ? `**Users Added**\n${klasaUtil.codeBlock('', usersAdded.join(', '))}` : '',
				usersRemoved.length ? `**Users Removed**\n${klasaUtil.codeBlock('', usersRemoved.join(', '))}` : '',
				guildsAdded.length ? `**Guilds Added**\n${klasaUtil.codeBlock('', guildsAdded.join(', '))}` : '',
				guildsRemoved.length ? `**Guilds Removed**\n${klasaUtil.codeBlock('', guildsRemoved.join(', '))}` : ''
			].filter(val => val !== '').join('\n'),
			COMMAND_UNLOAD: (type, name) => `✅ Unloaded ${type}: ${name}`,
			COMMAND_UNLOAD_DESCRIPTION: 'Unloads the klasa piece.',
			COMMAND_TRANSFER_ERROR: '❌ That file has been transfered already or never existed.',
			COMMAND_TRANSFER_SUCCESS: (type, name) => `✅ Successfully transferred ${type}: ${name}`,
			COMMAND_TRANSFER_FAILED: (type, name) => `Transfer of ${type}: ${name} to Client has failed. Please check your Console.`,
			COMMAND_TRANSFER_DESCRIPTION: 'Transfers a core piece to its respective folder',
			COMMAND_RELOAD: (type, name) => `✅ Reloaded ${type}: ${name}`,
			COMMAND_RELOAD_ALL: (type) => `✅ Reloaded all ${type}.`,
			COMMAND_RELOAD_DESCRIPTION: 'Reloads a klasa piece, or all pieces of a klasa store.',
			COMMAND_REBOOT: 'Rebooting...',
			COMMAND_REBOOT_DESCRIPTION: 'Reboots the bot.',
			COMMAND_PING: 'Ping?',
			COMMAND_PING_DESCRIPTION: 'Runs a connection test to Discord.',
			COMMAND_PINGPONG: (diff, ping) => `Pong! (Roundtrip took: ${diff}ms. Heartbeat: ${ping}ms.)`,
			COMMAND_INVITE_SELFBOT: 'Why would you need an invite link for a selfbot...',
			COMMAND_INVITE: (client) => [
				`To add ${client.user.username} to your discord guild:`,
				client.invite,
				klasaUtil.codeBlock('', [
					'The above link is generated requesting the minimum permissions required to use every command currently.',
					'I know not all permissions are right for every server, so don\'t be afraid to uncheck any of the boxes.',
					'If you try to use a command that requires more permissions than the bot is granted, it will let you know.'
				].join(' ')),
				'Please file an issue at <https://github.com/dirigeants/klasa> if you find any bugs.'
			],
			COMMAND_INVITE_DESCRIPTION: 'Displays the join server link of the bot.',
			COMMAND_INFO: [
				"Klasa is a 'plug-and-play' framework built on top of the Discord.js library.",
				'Most of the code is modularized, which allows developers to edit Klasa to suit their needs.',
				'',
				'Some features of Klasa include:',
				'• Fast Loading times with ES7 Support (Async/Await)',
				'• Per-server configuration, that can be extended with your own code',
				'• Customizable Command system with automated usage parsing and easy to use reloading and downloading modules',
				'• "Monitors" which can watch messages and act on them, like a normal message event (Swear Filters, Spam Protection, etc)',
				'• "Inhibitors" which can prevent commands from running based on a set of parameters (Permissions, Blacklists, etc)',
				'• "Providers" which allow you to connect with an outside database of your choosing.',
				'• "Finalizers" which run on messages after a successful command.',
				'• "Extendables", code that acts passively. They add properties or methods to existing Discord.js classes.',
				'• "Languages", which allow you to localize your bot.',
				'',
				'We hope to be a 100% customizable framework that can cater to all audiences. We do frequent updates and bugfixes when available.',
				"If you're interested in us, check us out at https://klasa.js.org"
			],
			COMMAND_INFO_DESCRIPTION: 'Provides some information about this bot.',
			COMMAND_HELP_DESCRIPTION: 'Display help for a command.',
			COMMAND_HELP_NO_EXTENDED: 'No extended help available.',
			COMMAND_HELP_DM: '📥 | The list of commands you have access to has been sent to your DMs.',
			COMMAND_HELP_NODM: '❌ | You have DMs disabled, I couldn\'t send you the commands in DMs.',
			COMMAND_ENABLE: (type, name) => `+ Successfully enabled ${type}: ${name}`,
			COMMAND_ENABLE_DESCRIPTION: 'Re-enables or temporarily enables a command/inhibitor/monitor/finalizer. Default state restored on reboot.',
			COMMAND_DISABLE: (type, name) => `+ Successfully disabled ${type}: ${name}`,
			COMMAND_DISABLE_DESCRIPTION: 'Re-disables or temporarily disables a command/inhibitor/monitor/finalizer/event. Default state restored on reboot.',
			COMMAND_DISABLE_WARN: 'You probably don\'t want to disable that, since you wouldn\'t be able to run any command to enable it again',
			COMMAND_CONF_NOKEY: 'You must provide a key',
			COMMAND_CONF_NOVALUE: 'You must provide a value',
			COMMAND_CONF_GUARDED: (name) => `${util.toTitleCase(name)} may not be disabled.`,
			COMMAND_CONF_UPDATED: (key, response) => `Successfully updated the key **${key}**: \`${response}\``,
			COMMAND_CONF_KEY_NOT_ARRAY: 'This key is not array type. Use the action \'reset\' instead.',
			COMMAND_CONF_GET_NOEXT: (key) => `The key **${key}** does not seem to exist.`,
			COMMAND_CONF_GET: (key, value) => `The value for the key **${key}** is: \`${value}\``,
			COMMAND_CONF_RESET: (key, response) => `The key **${key}** has been reset to: \`${response}\``,
			COMMAND_CONF_SERVER_DESCRIPTION: 'Define per-server configuration.',
			COMMAND_CONF_SERVER: (key, list) => `**Server Configuration${key}**\n${list}`,
			COMMAND_CONF_USER_DESCRIPTION: 'Define per-user configuration.',
			COMMAND_CONF_USER: (key, list) => `**User Configuration${key}**\n${list}`,
			MESSAGE_PROMPT_TIMEOUT: 'The prompt has timed out.',
			COMMAND_LOAD: (time, type, name) => `✅ Successfully loaded ${type}: ${name}. (Took: ${time})`,
			COMMAND_LOAD_FAIL: 'The file does not exist, or an error occurred while loading your file. Please check your console.',
			COMMAND_LOAD_ERROR: (type, name, error) => `❌ Failed to load ${type}: ${name}. Reason:${klasaUtil.codeBlock('js', error)}`,
			COMMAND_LOAD_DESCRIPTION: 'Load a piece from your bot.',

			/**
			 * ################################
			 * #     COMMAND DESCRIPTIONS     #
			 * ################################
			 */

			/**
			 * ##############
			 * ANIME COMMANDS
			 */
			COMMAND_ANIME_DESCRIPTION: 'Search your favourite anime by title with this command.',
			COMMAND_ANIME_EXTENDED: builder.display('anime', {
				extendedHelp: `This command queries MyAnimeList to show data for the anime you request. In a near future, this command
					will allow you to navigate between the results so you can read the information of the anime.`,
				explainedUsage: [
					['query', `The anime's name you are looking for.`]
				],
				examples: ['One Piece']
			}),
			COMMAND_MANGA_DESCRIPTION: 'Search your favourite manga by title with this command.',
			COMMAND_MANGA_EXTENDED: builder.display('manga', {
				extendedHelp: `This command queries MyAnimeList to show data for the manga you request. In a near future, this command',
					'will allow you to navigate between the results so you can read the information of the manga.`,
				explainedUsage: [
					['query', `The manga's name you are looking for.`]
				],
				examples: ['Stone Ocean', 'One Piece']
			}),

			/**
			 * #####################
			 * ANNOUNCEMENT COMMANDS
			 */
			COMMAND_ANNOUNCEMENT_DESCRIPTION: 'Send new announcements, mentioning the announcement role.',
			COMMAND_ANNOUNCEMENT_EXTENDED: builder.display('announcement', {
				extendedHelp: `This command requires an announcement channel (**channels.announcement** in the configuration command)
					which tells Skyra where she should post the announcement messages. Question is, is this command needed?
					Well, nothing stops you from making your announcements by yourself, however, there are many people who hate
					being mentioned by at everyone/here. To avoid this, Skyra gives you the option of creating a subscriber role,
					which is unmentionable (to avoid people spam mentioning the role), and once you run this command,
					Skyra will set the role to be mentionable, post the message, and back to unmentionable.`,
				explainedUsage: [
					['announcement', 'The announcement text to post.']
				],
				examples: ['I am glad to announce that we have a bot able to safely send announcements for our subscribers!']
			}),
			COMMAND_SUBSCRIBE_DESCRIPTION: `Subscribe to this server's announcements.`,
			COMMAND_SUBSCRIBE_EXTENDED: builder.display('subscribe', {
				extendedHelp: `'This command serves the purpose of **giving** you the subscriber role, which must be configured by the
					server's administrators. When a moderator or administrator use the **announcement** command, you
					will be mentioned. This feature is meant to replace everyone/here tags and mention only the interested
					users.`
			}),
			COMMAND_UNSUBSCRIBE_DESCRIPTION: `Unsubscribe from this server's announcements.`,
			COMMAND_UNSUBSCRIBE_EXTENDED: builder.display('unsubscribe', {
				extendedHelp: `This command serves the purpose of **removing** you the subscriber role, which must be configured by the
					server's administrators. When a moderator or administrator use the **announcement** command, you
					will **not longer** be mentioned. This feature is meant to replace everyone/here tags and mention
					only the interested users.`
			}),

			/**
			 * ############
			 * FUN COMMANDS
			 */
			COMMAND_8BALL_DESCRIPTION: 'Skyra will read the Holy Bible to find the correct answer for your question.',
			COMMAND_8BALL_EXTENDED: builder.display('8ball', {
				extendedHelp: `This command provides you a random question based on your questions' type. Be careful, it may be too smart.`,
				explainedUsage: [
					['question', 'The Holy Question']
				],
				examples: ['Why did the chicken cross the road?']
			}),
			COMMAND_CHOICE_DESCRIPTION: 'Eeny, meeny, miny, moe, catch a tiger by the toe...',
			COMMAND_CHOICE_EXTENDED: builder.display('choice', {
				extendedHelp: `I have an existencial doubt... should I wash the dishes or throw them throught the window? The search
					continues. List me items separated by comma and I will choose one them. On a side note, I am not
					responsible of what happens next.`,
				explainedUsage: [
					['words', 'A list of words separated by comma.']
				],
				examples: ['Should Wash the dishes, Throw the dishes throught the window', 'Cat, Dog']
			}),
			COMMAND_CATFACT_DESCRIPTION: 'Let me tell you a misterious cat fact.',
			COMMAND_CATFACT_EXTENDED: builder.display('catfact', {
				extendedHelp: `Do you know cats are very curious, right? They certainly have a lot of fun and weird facts.
					This command queries catfact.ninja and retrieves a fact so you can read it.`
			}),
			COMMAND_DICE_DESCRIPTION: `Roll the dice, 'x' rolls and 'y' sides.`,
			COMMAND_DICE_EXTENDED: builder.display('dice', {
				extendedHelp: `The mechanics of this command are easy. You have a dice, then you roll it __x__ times, but the dice
					can also be configured to have __y__ sides. By default, this command rolls a dice with 6 sides once.
					However, you can change the amount of rolls for the dice, and this command will 'roll' (get a random
					number between 1 and the amount of sides). For example, rolling a dice with 6 sides 3 times will leave
					a random sequence of three random numbers between 1 and 6, for example: 3, 1, 6; And this command will
					return 10 as output.`,
				explainedUsage: [
					['rolls', 'Defaults to 1, amount of times the dice should roll.'],
					['sides', 'Defaults to 6, amount of sides the dice should have.']
				],
				examples: ['370 24', '100 6', '6'],
				reminder: 'If you write numbers out of the range between 1 and 1024, Skyra will default the number to 1 or 6.'
			}),
			COMMAND_ESCAPEROPE_DESCRIPTION: 'Use the escape rope from Pokemon.',
			COMMAND_ESCAPEROPE_EXTENDED: builder.display('escaperope', {
				extendedHelp: '**Skyra** used **Escape Rope**.'
			}),
			COMMAND_FOX_DESCRIPTION: 'Let me show you an image of a fox!',
			COMMAND_FOX_EXTENDED: builder.display('fox', {
				extendedHelp: `This command provides you a random image from PixaBay, always showing 'fox' results. However,
					it may not be exactly accurate and show you other kinds of foxes.`
			}),
			COMMAND_HOWTOFLIRT_DESCRIPTION: 'Captain America, you do not know how to flirt.',
			COMMAND_HOWTOFLIRT_EXTENDED: builder.display('howtoflirt', {
				extendedHelp: `Let me show you how to effectively flirt with somebody using the Tony Stark's style for Captain
					America, I can guarantee that you'll get him.`,
				explainedUsage: [
					['user', 'The user to flirt with.']
				],
				examples: ['Skyra']
			}),
			COMMAND_LOVE_DESCRIPTION: 'Lovemeter, online!',
			COMMAND_LOVE_EXTENDED: builder.display('love', {
				extendedHelp: `Hey! Wanna check the lovemeter? I know it's a ridiculous machine, but many humans love it!
					Don't be shy and try it!`,
				explainedUsage: [
					['user', 'The user to rate.']
				],
				examples: ['Skyra']
			}),
			COMMAND_NORRIS_DESCRIPTION: `Enjoy your day reading Chuck Norris' jokes.`,
			COMMAND_NORRIS_EXTENDED: builder.display('norris', {
				extendedHelp: `Did you know that Chuck norris does **not** call the wrong number, but you **answer** the wrong phone?
					Woah, mindblow. He also threw a carton of milk and created the Milky Way. This command queries chucknorris.io
					and retrieves a fact (do not assume they're false, not in front of him) so you can read it`
			}),
			COMMAND_RATE_DESCRIPTION: 'Let bots have opinions and rate somebody.',
			COMMAND_RATE_EXTENDED: builder.display('rate', {
				extendedHelp: `Just because I am a bot doesn't mean I cannot rate you properly. I can grade you with a random number
					generator to ease the process. Okay okay, it's not fair, but I mean... I can also give you a 💯.`,
				explainedUsage: [
					['user', 'The user to rate.']
				],
				examples: ['Skyra', 'me']
			}),
			COMMAND_XKCD_DESCRIPTION: 'Read comics from XKCD.',
			COMMAND_XKCD_EXTENDED: builder.display('xkcd', {
				extendedHelp: `**xkcd** is an archive for nerd comics filled with math, science, sarcasm and languages. If you don't
					provide any argument, I will get a random comic from xkcd. If you provide a number, I will retrieve
					the comic with said number. But if you provide a title/text/topic, I will fetch a comic that matches
					with your input and display it. For example, \`Skyra, xkcd Curiosity\` will show the comic number 1091.`,
				explainedUsage: [
					['query', 'Either the number of the comic, or a title to search for.']
				],
				examples: ['1091', 'Curiosity']
			}),

			/**
			 * ###################
			 * MANAGEMENT COMMANDS
			 */
			COMMAND_CREATEMUTE_DESCRIPTION: 'Prepare the mute system.',
			COMMAND_CREATEMUTE_EXTENDED: builder.display('createmute', {
				extendedHelp: `This command prepares the mute system by creating a role called 'muted', and configuring it to
					the guild configuration. This command also modifies all channels (where possible) permissions and disables
					the permission ${PERMS.SEND_MESSAGES} in text channels and ${PERMS.CONNECT} in voice channels for said role.`
			}),
			COMMAND_FETCH_DESCRIPTION: 'Read the context of a message.',
			COMMAND_FETCH_EXTENDED: builder.display('fetch', {
				extendedHelp: `This command fetches the context of a message given its id (you need to turn on the developer mode)
					and optionally a channel and limit. The channel defaults to the channel the message was sent, and limit
					defaults to 10. To do so, this command will (by default) show you the 10 messages around the one selected.`,
				explainedUsage: [
					['message', 'The message id (requires Developer Mode).'],
					['channel', '(OPTIONAL) The channel to fetch the message from. Defaults to the channel the message got sent.'],
					['limit', '(OPTIONAL) The amount of messages to retrieve. Defaults to 10.']
				],
				reminder: `Skyra needs the permissions **${PERMS.VIEW_CHANNEL}** and **${PERMS.READ_MESSAGE_HISTORY}** in order
					to be able to fetch the messages.`
			}),
			COMMAND_GIVEAWAY_DESCRIPTION: 'Start a new giveaway.',
			COMMAND_GIVEAWAY_EXTENDED: builder.display('giveaway', {
				extendedHelp: `This command is designed to manage giveaways. You can start them with this command by giving it the
					time and a title. When a giveaway has been created, Skyra will send a giveaway message and react to it with 🎉
					so the members of the server can participate on it. Once the timer ends, Skyra will retrieve all the users who
					reacted and send the owner of the giveaway a message in direct messages with the winner, and other 10 possible
					winners (in case of needing to re-roll).`,
				explainedUsage: [
					['time', 'The time the giveaway should last.'],
					['title', 'The title of the giveaway.']
				],
				examples: ['6h A hug from Skyra.']
			}),
			COMMAND_LIST_DESCRIPTION: 'Check the list of channels, roles, members or warnings for this guild.',
			COMMAND_LIST_EXTENDED: builder.display('list', {
				extendedHelp: `This command is designed to list (sorted) information for this guild with possible filters. For example,
					you can read all the channels with their ids or all the roles from the guild, sorted by their position and hierarchy
					position, respectively. However, this command also allows to display the members of a role or check the warnings given.`,
				explainedUsage: [
					['channels', 'Show a list of all channels for this guild.'],
					['roles', 'Show a list of all roles for this guild.'],
					['members', 'Show a list of all members for a role. If not provided, defaults to the author\'s highest role.'],
					['warnings', 'Show a list of all warnings for this guild, or all warnings given to a user.'],
					['input', 'If you take the members parameter, this parameter will select a role. In warnings this will select a member of the guild, otherwise it is ignored.']
				],
				examples: ['channels', 'warnings Skyra', 'members Moderators']
			}),
			COMMAND_MANAGEALIAS_DESCRIPTION: 'Manage aliases for commands for this server.',
			COMMAND_MANAGEALIAS_EXTENDED: builder.display('managealias', {
				extendedHelp: `Command aliases are custom aliases you can use to define a command with its parameters, for example, let's say
					the usage of a command is quite complicated or its parameters are very used. For example, let's say you want Skyra to
					recognize 'Skyra, ps4' as 'Skyra, roles claim ps4'. This is one of the things this system can do. However, you
					are also able to 'translate' them, i.e. you have a Spanish community and you want 'Skyra, suscribirse' as an alias of
					'Skyra, subscribe'.`,
				explainedUsage: [
					['add', 'Add an alias.'],
					['remove', 'Remove an alias.'],
					['list', 'List all aliases for this guild.'],
					['command', 'The command to define the alias to. (i.e. `ping`).'],
					['alias', 'The alias to apply for the aforementioned command.']
				],
				examples: ['add subscribe suscribirse', 'add "roles claim ps4" ps4']
			}),
			COMMAND_ROLEINFO_DESCRIPTION: 'Check the information for a role.',
			COMMAND_ROLEINFO_EXTENDED: builder.display('roleinfo', {
				extendedHelp: `The roleinfo command displays information for a role, such as its id, name, color, whether it's hoisted
					(displays separately) or not, it's role hierarchy position, whether it's mentionable or not, how many members have said
					role, and its permissions. It sends an embedded message with the colour of the role.`,
				explainedUsage: [
					['role', 'The role name, partial name, mention or id.']
				],
				examples: ['Administrator', 'Moderator']
			}),
			COMMAND_SERVERINFO_DESCRIPTION: 'Check the information of the guild.',
			COMMAND_SERVERINFO_EXTENDED: builder.display('serverinfo', {
				extendedHelp: `The serverinfo command displays information for the guild the message got sent. It shows the amount of channels,
					with the count for each category, the amount of members (given from the API), the owner with their user id, the amount of roles,
					region, creation date, verification level... between others.`,
				reminder: `The command may not show an accurate amount of users online and offline, that's intended to save server costs for caching
					many unnecesary members from the API. However, this should happen more likely in giant guilds.`
			}),

			/**
			 * ###################
			 * MANAGEMENT COMMANDS
			 */
			COMMAND_NICK_DESCRIPTION: `Change Skyra's nickname for this guild.`,
			COMMAND_NICK_EXTENDED: builder.display('nick', {
				extendedHelp: `This command allows you to change Skyra's nickname easily for the guild.`,
				reminder: `This command requires the ${PERMS.CHANGE_NICKNAME} permission. Make sure Skyra has it.`,
				explainedUsage: [
					['nick', `The new nickname. If you don't put any, it'll reset it instead.`]
				],
				examples: ['SkyNET', 'Assistant', '']
			}),

			/**
			 * #############
			 * MISC COMMANDS
			 */
			COMMAND_CUDDLE_DESCRIPTION: 'Cuddle somebody!',
			COMMAND_CUDDLE_EXTENDED: builder.display('cuddle', {
				extendedHelp: `Do you know something that I envy from humans? The warm feeling when somebody cuddles you. It's so cute ❤! I can
					imagine and draw a image of you cuddling somebody in the bed, I hope you like it!`,
				explainedUsage: [
					['user', 'The user to cuddle with.']
				],
				examples: ['Skyra']
			}),
			COMMAND_DELETTHIS_DESCRIPTION: '*Sees offensive post* DELETTHIS!',
			COMMAND_DELETTHIS_EXTENDED: builder.display('deletthis', {
				extendedHelp: `I see it! I see the hammer directly from your hand going directly to the user you want! Unless... unless it's me! If
					you try to tell me this, I'm going to take the MJOLNIR! Same if you do with my creator!`,
				explainedUsage: [
					['user', 'The user that should start deleting his post.']
				],
				examples: ['John Doe']
			}),
			COMMAND_DOG_DESCRIPTION: 'Cute doggos! ❤',
			COMMAND_DOG_EXTENDED: builder.display('dog', {
				extendedHelp: `Do **you** know how cute are dogs? They are so beautiful! This command uses a tiny selection of images
					From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are
					some images that, sadly, got deleted and I cannot retrieve them 💔.`
			}),
			COMMAND_F_DESCRIPTION: 'Press F to pay respects.',
			COMMAND_F_EXTENDED: builder.display('f', {
				extendedHelp: `This command generates an image... to pay respects reacting with 🇫. This command also makes Skyra
					react the image if she has permissions to react messages.`,
				explainedUsage: [
					['user', 'The user to pray respects to.']
				],
				examples: ['John Doe', 'Jake']
			}),
			COMMAND_GOODNIGHT_DESCRIPTION: 'Give somebody a nice Good Night!',
			COMMAND_GOODNIGHT_EXTENDED: builder.display('goodnight', {
				extendedHelp: `Let me draw you giving a goodnight kiss to the person who is going to sleep! Who doesn't like goodnight kisses?`,
				explainedUsage: [
					['user', 'The user to give the goodnight kiss.']
				],
				examples: ['Jake', 'DefinitivelyNotSleeping']
			}),
			COMMAND_GOOFYTIME_DESCRIPTION: `It's Goofy time!`,
			COMMAND_GOOFYTIME_EXTENDED: builder.display('goofytime', {
				extendedHelp: `IT'S GOOFY TIME! *Screams loudly in the background* NO, DAD! NO! This is a command based on the Goofy Time meme,
					what else would it be?`,
				explainedUsage: [
					['user', `The user who will say IT'S GOOFY TIME!`]
				],
				examples: ['TotallyNotADaddy']
			}),
			COMMAND_HUG_DESCRIPTION: 'Hugs!',
			COMMAND_HUG_EXTENDED: builder.display('hug', {
				extendedHelp: `What would be two people in the middle of the snow with coats and hugging each other? Wait! I get it!
					Mention somebody you want to hug with, and I'll try my best to draw it in a canvas!`,
				explainedUsage: [
					['user', 'The user to hug with.']
				],
				examples: ['Bear']
			}),
			COMMAND_INEEDHEALING_DESCRIPTION: `*Genji's voice* I NEED HEALING!`,
			COMMAND_INEEDHEALING_EXTENDED: builder.display('ineedhealing', {
				extendedHelp: `Do you know the worst nightmare for every single healer in Overwatch, specially for Mercy? YES! You know it,
					it's a cool cyborg ninja that looks like a XBOX and is always yelling "I NEED HEALING" loudly during the entire match.
					Well, don't expect so much, this command actually shows a medic with some tool in your chest.`,
				explainedUsage: [
					['healer', 'The healer you need to heal you.']
				],
				examples: ['Mercy']
			}),
			COMMAND_KITTY_DESCRIPTION: 'KITTENS!',
			COMMAND_KITTY_EXTENDED: builder.display('kitty', {
				extendedHelp: `Do **you** know how cute are kittens? They are so beautiful! This command uses a tiny selection of images
					From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are
					some images that, sadly, got deleted and I cannot retrieve them 💔.`
			}),
			COMMAND_PINGKYRA_DESCRIPTION: 'How dare you pinging me!?',
			COMMAND_PINGKYRA_EXTENDED: builder.display('pingkyra', {
				extendedHelp: `There are a few things that annoy kyra, one of them are **Windows 10's notifications**! Which also
					includes mentions from Discord, hence why this command exists.`,
				explainedUsage: [
					['pinger', 'The user who pinged Kyra.']
				],
				examples: ['IAmInnocent'],
				reminder: `If you mentioned kyra, you must self-execute this command against you.`
			}),
			COMMAND_SHINDEIRU_DESCRIPTION: 'Omae wa mou shindeiru.',
			COMMAND_SHINDEIRU_EXTENDED: builder.display('shindeiru', {
				extendedHelp: `"You are already dead" Japanese: お前はもう死んでいる; Omae Wa Mou Shindeiru, is an expression from the manga
					and anime series Fist of the North Star. This shows a comic strip of the character pronouncing the aforementioned words,
					which makes the opponent reply with "nani?" (what?).`,
				explainedUsage: [
					['user', `The person you're telling that phrase to.`]
				],
				examples: ['Jack']
			}),
			COMMAND_SLAP_DESCRIPTION: 'Slap another user using the Batman & Robin Meme.',
			COMMAND_SLAP_EXTENDED: builder.display('slap', {
				extendedHelp: `The hell are you saying? *Slaps*. This meme is based on a comic from Batman and Robin.`,
				explainedUsage: [
					['user', 'The user you wish to slap.']
				],
				examples: ['Jake'],
				reminder: `You try to slap me and I'll slap you instead.`
			}),
			COMMAND_THESEARCH_DESCRIPTION: 'Are we the only one in the universe, this man on earth probably knows.',
			COMMAND_THESEARCH_EXTENDED: builder.display('thesearch', {
				extendedHelp: `One man on Earth probably knows if there is intelligent life, ask and you shall receive an answer.`,
				explainedUsage: [
					['answer', 'The sentence that will reveal the truth.']
				],
				examples: ['Your waifu is not real.']
			}),
			COMMAND_TRIGGERED_DESCRIPTION: 'I am getting TRIGGERED!',
			COMMAND_TRIGGERED_EXTENDED: builder.display('triggered', {
				extendedHelp: `What? My commands are not enough userfriendly?! (╯°□°）╯︵ ┻━┻. This command generates a GIF image
					your avatar wiggling fast, with a TRIGGERED footer, probably going faster than I thought, I don't know.`,
				explainedUsage: [
					['user', 'The user that is triggered.']
				],
				examples: ['kyra']
			}),
			COMMAND_VAPORWAVE_DESCRIPTION: 'Vapowave characters!',
			COMMAND_VAPORWAVE_EXTENDED: builder.display('vaporwave', {
				extendedHelp: `Well, what can I tell you? This command turns your messages into unicode monospaced characters. That
					is, what humans call 'Ａ　Ｅ　Ｓ　Ｔ　Ｈ　Ｅ　Ｔ　Ｉ　Ｃ'. I wonder what it means...`, // eslint-disable-line no-irregular-whitespace
				explainedUsage: [
					['phrase', 'The phrase to convert']
				],
				examples: ['A E S T H E T I C']
			}),

			/**
			 * #############################
			 * MODERATION/UTILITIES COMMANDS
			 */

			COMMAND_CASE_DESCRIPTION: 'Get the information from a case given its index.',
			COMMAND_CASE_EXTENDED: builder.display('case', {
				extendedHelp: ``
			}),

			/**
			 * ###################
			 * MODERATION COMMANDS
			 */

			COMMAND_BALANCE_DESCRIPTION: 'Check your current balance.',
			COMMAND_BALANCE_EXTENDED: builder.display('balance', {
				extendedHelp: `The balance command retrieves your amount of ${SHINY}.`
			}),
			COMMAND_DAILY_DESCRIPTION: `Get your semi-daily ${SHINY}.`,
			COMMAND_DAILY_EXTENDED: builder.display('daily', {
				extendedHelp: `Shiiiiny!`,
				reminder: [
					'Skyra uses a virtual currency called Shiny, and it is used to buy stuff such as banners or bet it on slotmachines.',
					'You can claim dailies once every 12 hours.'
				].join('\n')
			}),
			COMMAND_LEADERBOARD_DESCRIPTION: 'Check the leaderboards.',
			COMMAND_LEADERBOARD_EXTENDED: builder.display('leaderboard', {
				extendedHelp: `The leaderboard command shows a list of users sorted by their local or global amount of points,
					by default, when using no arguments, it will show the local leaderboard. The leaderboards refresh after 10
					minutes.`,
				reminder: '"Local" leaderboards refer to the guild\'s top list. "Global" refers to all scores from all guilds.'
			}),
			COMMAND_LEVEL_DESCRIPTION: 'Check your global level.',
			COMMAND_LEVEL_EXTENDED: builder.display('level', {
				extendedHelp: `How much until I reach next level?`,
				explainedUsage: [
					['user', '(Optional) The user\'s profile to show. Defaults to the message\'s author.']
				]
			}),
			COMMAND_PAY_DESCRIPTION: `Pay somebody with your ${SHINY}.`,
			COMMAND_PAY_EXTENDED: builder.display('pay', {
				extendedHelp: `Businessmen! Today is payday!`,
				explainedUsage: [
					['money', `Amount of ${SHINY} to pay, you must have the amount you are going to pay.`],
					['user', 'The targetted user to pay. (Must be mention/id)']
				],
				examples: [
					'Skyra, pay 200 @kyra'
				]
			}),
			COMMAND_PROFILE_DESCRIPTION: 'Check your user profile.',
			COMMAND_PROFILE_EXTENDED: builder.display('profile', {
				extendedHelp: `This command sends a card image with some of your user profile such as your global rank, experience...
					Additionally, you are able to customize your colours with the 'setColor' command.`,
				explainedUsage: [
					['user', '(Optional) The user\'s profile to show. Defaults to the message\'s author.']
				]
			}),
			COMMAND_REMINDME_DESCRIPTION: 'Manage your reminders.',
			COMMAND_REMINDME_EXTENDED: builder.display('remindme', {
				extendedHelp: `This command allows you to set, delete and list reminders.`,
				explainedUsage: [
					['title', 'What you want me to remind you.'],
					['time', 'The time the reminder should last. If not provided, Skyra will ask for it in a prompt.']
				],
				examples: [
					'Skyra, remind me in 6h to fix this command.',
					'Skyra, reminder list',
					'Skyra, reminder delete jedbcuywb'
				]
			}),
			COMMAND_REPUTATION_DESCRIPTION: 'Give somebody a reputation point.',
			COMMAND_REPUTATION_EXTENDED: builder.display('reputation', {
				extendedHelp: `This guy is so helpful... I'll give him a reputation point!`,
				explainedUsage: [
					['user', 'The user to give a reputation point.']
				],
				reminder: 'You can give a reputation point once every 24 hours.'
			}),
			COMMAND_REPUTATIONS_DESCRIPTION: 'Check your amount of reputation points.',
			COMMAND_REPUTATIONS_EXTENDED: builder.display('reputations', {
				extendedHelp: `This command tells you the amount of reputation points. They are points you achieve from other users
					when they use the reputation command.`,
				reminder: 'You can give users a reputation point with the \'reputation\' command every 24 hours.'
			}),
			COMMAND_SETCOLOR_DESCRIPTION: 'Change your user profile\'s color.',
			COMMAND_SETCOLOR_EXTENDED: builder.display('setColor', {
				extendedHelp: `The balance command retrieves your amount of ${SHINY}.`,
				explainedUsage: [
					['color', 'A color resolvable.']
				],
				possibleFormats: [
					'HEX :: #dfdfdf',
					'RGB :: rgb(200, 200, 200)',
					'HSL :: hsl(350, 100, 100)',
					'B10 :: 14671839'
				]
			}),

			/**
			 * ##################
			 * OVERWATCH COMMANDS
			 */

			/**
			 * ###############
			 * SOCIAL COMMANDS
			 */

			/**
			 * ###############
			 * SYSTEM COMMANDS
			 */

			COMMAND_BACKUP_DESCRIPTION: 'Performs a backup of the database.',
			COMMAND_BACKUP_EXTENDED: builder.display('backup', {
				extendedHelp: `The backup command force-starts the backup task which runs twice a week.`
			}),
			COMMAND_CPPEVAL_DESCRIPTION: 'Evaluates arbitrary C++. Reserved for bot owner.',
			COMMAND_CPPEVAL_EXTENDED: builder.display('c++eval', {
				extendedHelp: `The C++eval command evaluates command as-in, and wraps it into a main method. No namespaces are exported.
					The --raw flag disables the code wrap, making it accept raw input.`,
				examples: [
					'std::cout << 2 + 2 - 1;'
				]
			}),
			COMMAND_CSEVAL_DESCRIPTION: 'Evaluates arbitrary C#. Reserved for bot owner.',
			COMMAND_CSEVAL_EXTENDED: builder.display('c#eval', {
				extendedHelp: `The C#eval command evaluates command as-in, and wraps it into a main method.
					The --raw flag disables the code wrap, making it accept raw input.
					Exported namespaces are:
						- System
						- System.Collections
						- System.Collections.Generic
						- System.Linq
						- System.Reflection`,
				// Please do not translate the namespaces
				examples: [
					'return new[] { 2, 2 }.Sum() - 1;',
					'return 2 + 2 - 1;'
				]
			}),
			COMMAND_DM_DESCRIPTION: 'Sends a Direct Message. Reserved for bot owner for replying purposes.',
			COMMAND_DM_EXTENDED: builder.display('dm', {
				extendedHelp: `The DM command is reserved for bot owner, and it's only used for very certain purposes, such as replying feedback
					messages sent by users.`
			}),
			COMMAND_EVAL_DESCRIPTION: 'Evaluates arbitrary Javascript. Reserved for bot owner.',
			COMMAND_EVAL_EXTENDED: builder.display('eval', {
				extendedHelp: `The eval command evaluates code as-in, any error thrown from it will be handled.
					It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.
					The --wait flag changes the time the eval will run. Defaults to 10 seconds. Accepts time in milliseconds.
					The --output and --output-to flag accept either 'file', 'log', 'haste' or 'hastebin'.
					The --delete flag makes the command delete the message that executed the message after evaluation.
					The --silent flag will make it output nothing.
					The --depth flag accepts a number, for example, --depth=2, to customize util.inspect's depth.
					The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword
					The --showHidden flag will enable the showHidden option in util.inspect.
					If the output is too large, it'll send the output as a file, or in the console if the bot does not have the ${PERMS.ATTACH_FILES} permission.`,
				examples: [
					'msg.author.username;',
					'1 + 1;'
				]
			}, true),
			COMMAND_EXEC_DESCRIPTION: 'Execute Order 66.',
			COMMAND_EXEC_EXTENDED: builder.display('exec', {
				extendedHelp: `You better not know about this.`
			}),
			COMMAND_PYEVAL_DESCRIPTION: 'Evaluates arbitrary Python code. Reserved for bot owner.',
			COMMAND_PYEVAL_EXTENDED: builder.display('pyeval', {
				extendedHelp: `The pyeval command evaluates command as-in. No namespaces are exported.
					The --py3 flag changes the eval mode from python 2.7 to python 3.6.`,
				examples: [
					'print(2 + 2 - 1)'
				]
			}),
			COMMAND_SETAVATAR_DESCRIPTION: `Set Skyra's avatar.`,
			COMMAND_SETAVATAR_EXTENDED: builder.display('setAvatar', {
				extendedHelp: `This command changes Skyra's avatar. You can send a URL or upload an image attachment to the channel.`
			}),
			COMMAND_DONATE_DESCRIPTION: 'Get information about how to donate to keep Skyra alive longer.',
			COMMAND_DONATE_EXTENDED: builder.display('donate', {
				extendedHelp: `
					Skyra Project started on 24th October 2016, if you are reading this, you are
					using the version 3.0.0 (Royal Update), which is the twelfth rewrite. I have
					improved a lot every single function from Skyra, and now, she is extremely fast.

					However, not everything is free, I need your help to keep Skyra alive in a VPS so
					you can enjoy her functions longer. I will be very thankful if you help me, really,
					I have been working on a lot of things, but she is my beautiful baby, take care of her ❤

					Do you want to support this amazing project? Feel free to do so! https://www.patreon.com/kyranet`
			}),
			COMMAND_ECHO_DESCRIPTION: 'Make Skyra send a message to this (or another) channel.',
			COMMAND_ECHO_EXTENDED: builder.display('echo', {
				extendedHelp: `This should be very obvious...`
			}),
			COMMAND_FEEDBACK_DESCRIPTION: `Send a feedback message to the bot's owner.`,
			COMMAND_FEEDBACK_EXTENDED: builder.display('feedback', {
				extendedHelp: `This command sends a message to a feedback channel where the bot's owner can read. You'll be replied
					as soon as an update comes.`
			}),
			COMMAND_STATS_DESCRIPTION: 'Provides some details about the bot and stats.',
			COMMAND_STATS_EXTENDED: builder.display('exec', {
				extendedHelp: `This should be very obvious...`
			}),

			/**
			 * #############
			 * TAGS COMMANDS
			 */
			COMMAND_TAGMANAGER_DESCRIPTION: `Manage this guilds' tags.`,
			COMMAND_TAGMANAGER_EXTENDED: builder.display('tagmanager', {
				extendedHelp: `This command gives you tag management (you can use it to add, remove or edit them).
					What are tags? Tags are chunk of texts stored under a name, which allows you, for example,
					you can do \`Skyra, tag rule1\` and get a response with what the rule number one of your server is.
					Besides that, tags are also used for memes, who doesn't like memes?`,
				explainedUsage: [
					['action', 'The action to perform: **add** to add new tags, **remove** to delete them, and **edit** to edit them.'],
					['tag', `The tag's name.`],
					['contents', 'Required for the actions **add** and **edit**, specifies the content for the tag.']
				],
				examples: [
					'add rule1 Respect other users. Harassment, hatespeech, etc... will not be tolerated.',
					'edit rule1 Just be respectful with the others.',
					'remove rule1'
				]
			}),
			COMMANDS_TAGS_DESCRIPTION: `List or get a tag.`,
			COMMANDS_TAGS_EXTENDED: builder.display('tags', {
				extendedHelp: `What are tags? Tags are chunk of texts stored under a name, which allows you, for example,
					you can do \`Skyra, tag rule1\` and get a response with what the rule number one of your server is.
					Besides that, tags are also used for memes, who doesn't like memes?`,
				explainedUsage: [
					['list', 'Show a list of all tags for this server.'],
					['tag', 'Show the content of the selected tag.']
				],
				examples: ['list', 'rule1']
			}),

			/**
			 * ##############
			 * TOOLS COMMANDS
			 */

			/**
			 * ################
			 * WEATHER COMMANDS
			 */
			COMMAND_WEATHER_DESCRIPTION: 'Check the weather status in a location.',
			COMMAND_WEATHER_EXTENDED: builder.display('weather', {
				extendedHelp: `This command uses Google Maps to get the coordinates of the place, this step also allows multilanguage
					support as it is... Google Search. Once this command got the coordinates, it queries DarkSky to retrieve
					information about the weather. Note: temperature is in **Celsius**`,
				explainedUsage: [
					['city', 'The locality, governing, country or continent to check the weather from.']
				],
				examples: ['Antarctica', 'Arizona']
			}),

			/**
			 * #################################
			 * #       COMMAND RESPONSES       #
			 * #################################
			 */

			/**
			 * ##############
			 * ANIME COMMANDS
			 */
			COMMAND_ANIME_TYPES: {
				TV: '📺 TV',
				MOVIE: '🎥 Movie',
				OVA: '📼 Original Video Animation',
				SPECIAL: '🎴 Special'
			},
			COMMAND_ANIME_QUERY_FAIL: 'I am sorry, but the API returned a bad answer. Are you sure you wrote the name correctly?',
			COMMAND_ANIME_INVALID_CHOICE: `That's an invalid choice. Please try again but with a different choice.`,
			COMMAND_ANIME_NO_CHOICE: 'Well, the time ended, try again later when you decide it!',
			COMMAND_ANIME_OUTPUT_DESCRIPTION: (entry, synopsis) => [
				`**English title:** ${entry.english}`,
				synopsis.length > 750 ? `${util.splitText(synopsis, 750)}... [continue reading](https://myanimelist.net/anime/${entry.id})` : synopsis
			],
			COMMAND_ANIME_OUTPUT_STATUS: (entry) => [
				`  ❯  Current status: **${entry.status}**`,
				`    • Started: **${entry.start_date}**\n${entry.end_date[0] === '0000-00-00' ? '' : `    • Finished: **${entry.end_date[0]}**`}`
			],
			COMMAND_ANIME_TITLES: {
				TYPE: 'Type',
				SCORE: 'Score',
				STATUS: 'Status',
				WATCH_IT: 'Watch it here:',
				READ_IT: 'Read it here:'
			},
			COMMAND_MANGA_OUTPUT_DESCRIPTION: (entry, synopsis) => [
				`**English title:** ${entry.english}`,
				synopsis.length > 750 ? `${util.splitText(synopsis, 750)}... [continue reading](https://myanimelist.net/manga/${entry.id})` : synopsis
			],
			COMMAND_MANGA_OUTPUT_STATUS: (entry) => [
				`  ❯  Current status: **${entry.status}**`,
				`    • Started: **${entry.start_date}**\n${entry.end_date[0] === '0000-00-00' ? '' : `    • Finished: **${entry.end_date[0]}**`}`
			],
			COMMAND_MANGA_TITLES: {
				MANGA: '📘 Manga',
				NOVEL: '📕 Novel',
				MANHWA: '🇰🇷 Manhwa',
				'ONE-SHOT': '☄ One Shot',
				SPECIAL: '🎴 Special'
			},

			/**
			 * #####################
			 * ANNOUNCEMENT COMMANDS
			 */

			/**
			 * ################
			 * GENERAL COMMANDS
			 */

			COMMAND_HELP_TITLE: (name, description) => `📃 | ***Help Message*** | __**${name}**__\n${description}\n`,
			COMMAND_HELP_USAGE: (usage) => `📝 | ***Command Usage***\n\`${usage}\`\n`,
			COMMAND_HELP_EXTENDED: (extendedHelp) => `🔍 | ***Extended Help***\n${extendedHelp}`,

			/**
			 * ##############
			 * FUN COMMANDS
			 */

			COMMAND_8BALL_OUTPUT: (author, question, response) => `🎱 Question by ${author}: *${question}*\n${response}`,
			COMMAND_8BALL_NOT_QUESTION: 'That does not seem to be a question...',
			COMMAND_8BALL_QUESTIONS: {
				QUESTION: '?',
				WHEN: 'when',
				WHAT: 'what',
				HOW_MUCH: 'how much',
				HOW_MANY: 'how many',
				WHY: 'why',
				WHO: 'who'
			},
			COMMAND_CATFACT_TITLE: 'Cat Fact',
			COMMAND_CHOICE_OUTPUT: (user, word) => `🕺 *Eeny, meeny, miny, moe, catch a tiger by the toe...* ${user}, I choose:${klasaUtil.codeBlock('', word)}`,
			COMMAND_CHOICE_MISSING: 'Please write at least two options separated by comma.',
			COMMAND_CHOICE_DUPLICATES: (words) => `Why would I accept duplicated words? '${words}'.`,
			COMMAND_DICE_OUTPUT: (sides, rolls, result) => `you rolled the **${sides}**-dice **${rolls}** times, you got: **${result}**`,
			// https://bulbapedia.bulbagarden.net/wiki/Escape_Rope
			COMMAND_ESCAPEROPE_OUTPUT: (user) => `**${user}** used **Escape Rope**`,
			COMMAND_LOVE_LESS45: 'Try again next time...',
			COMMAND_LOVE_LESS75: 'Good enough!',
			COMMAND_LOVE_LESS100: 'Good match!',
			COMMAND_LOVE_100: 'Perfect match!',
			COMMAND_LOVE_ITSELF: 'You are a special creature and you should love yourself more than anyone <3',
			COMMAND_LOVE_RESULT: 'Result',
			COMMAND_NORRIS_OUTPUT: 'Chuck Norris',
			COMMAND_RATE_OUTPUT: (user, rate, emoji) => `I would give **${user}** a **${rate}**/100 ${emoji}`,
			COMMAND_RATE_MYSELF: ['I love myself a lot 😊', 'myself'],
			COMMAND_XKCD_COMICS: (amount) => `There are only ${amount} comics.`,

			/**
			 * ###################
			 * MANAGEMENT COMMANDS
			 */

			COMMAND_NICK_SET: (nickname) => `Changed the nickname to **${nickname}**.`,
			COMMAND_NICK_CLEARED: 'Nickname cleared.',

			/**
			 * #############
			 * MISC COMMANDS
			 */

			COMMAND_VAPORWAVE_OUTPUT: (string) => `There is your converted message:\n${string}`,

			/**
			 * #############################
			 * MODERATION/UTILITIES COMMANDS
			 */

			COMMAND_PERMISSIONS: (username, id) => `Permissions for ${username} (${id})`,
			COMMAND_RAID_DISABLED: 'The Anti-RAID system is not enabled in this server.',
			COMMAND_RAID_MISSING_KICK: 'As I do not have the KICK MEMBERS permission, I keep the Anti-RAID unactivated.',
			COMMAND_RAID_LIST: 'List of users in the RAID queue',
			COMMAND_RAID_CLEAR: 'Successfully cleared the RAID list.',
			COMMAND_RAID_COOL: 'Successfully deactivated the RAID.',
			COMMAND_FLOW: (amount) => `${amount} messages have been sent within the last minute.`,
			COMMAND_TIME_TIMED: 'The selected moderation case has already been timed.',
			COMMAND_TIME_UNDEFINED_TIME: 'You must specify a time.',
			COMMAND_TIME_UNSUPPORTED_TIPE: 'The type of action for the selected case cannot be reverse, therefore this action is unsupported.',
			COMMAND_TIME_NOT_SCHEDULED: 'This task is not scheduled.',
			COMMAND_TIME_ABORTED: (title) => `Successfully aborted the schedule for ${title}`,
			COMMAND_TIME_SCHEDULED: (title, user, time) => `✅ Successfully scheduled a moderation action type **${title}** for the user ${user.tag} (${user.id}) with a duration of ${duration(time)}`,

			/**
			 * ###################
			 * MODERATION COMMANDS
			 */

			COMMAND_BAN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **BANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_BAN_NOT_BANNABLE: 'The target is not bannable for me.',
			COMMAND_KICK_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **KICKED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_KICK_NOT_KICKABLE: 'The target is not kickable for me.',
			COMMAND_LOCKDOWN_LOCK: (channel) => `The channel ${channel} is now locked.`,
			COMMAND_LOCKDOWN_LOCKING: (channel) => `Locking the channel ${channel}...`,
			COMMAND_LOCKDOWN_OPEN: (channel) => `The lockdown for the channel ${channel} has been released.`,
			COMMAND_MUTE_CONFIGURE_CANCELLED: 'Prompt aborted, the Mute role creation has been cancelled.',
			COMMAND_MUTE_CONFIGURE: 'Do you want me to create and configure the Mute role now?',
			COMMAND_MUTE_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **MUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_MUTE_MUTED: 'The target user is already muted.',
			COMMAND_MUTE_USER_NOT_MUTED: 'This user is not muted.',
			COMMAND_PRUNE: (amount, total) => `Successfully deleted ${amount} messages from ${total}.`,
			COMMAND_REASON_NOT_EXISTS: 'The selected modlog does not seem to exist.',
			COMMAND_SOFTBAN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **SOFTBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_UNBAN_MESSAGE: (user, reason, banReason, log) => `|\`🔨\`| [Case::${log}] **UNBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}${banReason ? `\nReason for Ban:${banReason}` : ''}`,
			COMMAND_UNBAN_MISSING_PERMISSION: `I will need the ${PERMS.BAN_MEMBERS} permission to be able to unban.`,
			COMMAND_UNMUTE_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **UNMUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_UNMUTE_MISSING_PERMISSION: `I will need the ${PERMS.MANAGE_ROLES} permission to be able to unmute.`,
			COMMAND_UNWARN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **APPEALED WARN**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_VMUTE_MISSING_PERMISSION: `I will need the ${PERMS.MUTE_MEMBERS} permission to be able to voice unmute.`,
			COMMAND_VMUTE_USER_NOT_MUTED: 'This user is not voice muted.',
			COMMAND_VOICEKICK_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **VOICE KICKED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_WARN_DM: (moderator, guild, reason) => `You have been warned by ${moderator} in ${guild} for the reason: ${reason}`,
			COMMAND_WARN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **WARNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_FILTER_UNDEFINED_WORD: 'You must write what do you want me to filter.',
			COMMAND_FILTER_FILTERED: (filtered) => `This word is ${filtered ? 'already' : 'not'} filtered.`,
			COMMAND_FILTER_ADDED: (word) => `| ✅ | Success! Added the word ${word} to the filter.`,
			COMMAND_FILTER_REMOVED: (word) => `| ✅ | Success! Removed the word ${word} from the filter.`,
			COMMAND_FILTER_RESET: '| ✅ | Success! The filter has been reset.',

			/**
			 * ##################
			 * OVERWATCH COMMANDS
			 */

			/**
			 * ###############
			 * SOCIAL COMMANDS
			 */

			COMMAND_AUTOROLE_POINTS_REQUIRED: 'You must input a valid amount of points.',
			COMMAND_AUTOROLE_UPDATE_UNCONFIGURED: 'This role is not configured as an autorole. Use the add type instead.',
			COMMAND_AUTOROLE_UPDATE: (role, points, before) => `Updated autorole: ${role.name} (${role.id}). Points required: ${points} (before: ${before})`,
			COMMAND_AUTOROLE_REMOVE: (role, before) => `Removed the autorole: ${role.name} (${role.id}), which required ${before} points.`,
			COMMAND_AUTOROLE_ADD: (role, points) => `Added new autorole: ${role.name} (${role.id}). Points required: ${points}`,
			COMMAND_AUTOROLE_LIST_EMPTY: 'There is no role configured as an autorole in this server.',
			COMMAND_AUTOROLE_UNKNOWN_ROLE: (role) => `Unknown role: ${role}`,

			COMMAND_BALANCE: (user, amount) => `The user ${user} has a total of ${amount}${SHINY}`,
			COMMAND_BALANCE_SELF: (amount) => `You have a total of ${amount}${SHINY}`,

			COMMAND_BANNER_LIST_EMPTY: (prefix) => `You do not have an available banner. Check \`${prefix}banner buylist\` for a list of banners you can buy.`,
			COMMAND_BANNER_SET_INPUT_NULL: 'You must specify a banner id to set.',
			COMMAND_BANNER_SET_NOT_BOUGHT: 'You do not have this banner.',
			COMMAND_BANNER_SET: (banner) => `|\`✅\`| **Success**. You have set your banner to: __${banner}__`,
			COMMAND_BANNER_BUY_INPUT_NULL: 'You must specify a banner id to buy.',
			COMMAND_BANNER_BUY_NOT_EXISTS: (prefix) => `This banner id does not exist. Please check \`${prefix}banner buylist\` for a list of banners you can buy.`,
			COMMAND_BANNER_BUY_BOUGHT: (prefix, banner) => `You already have this banner, you may want to use \`${prefix}banner set ${banner}\` to make it visible in your profile.`,
			COMMAND_BANNER_BUY_MONEY: (money, cost) => `You do not have enough money to buy this banner. You have ${money}${SHINY}, the banner costs ${cost}${SHINY}`,
			COMMAND_BANNER_BUY: (banner) => `|\`✅\`| **Success**. You have bought the banner: __${banner}__`,
			COMMAND_BANNER_BUY_PAYMENT_CANCELLED: '|`❌`| The payment has been cancelled.',
			COMMAND_BANNER_PROMPT: {
				AUTHOR: 'Author',
				TITLE: 'Title',
				PRICE: 'Price'
			},
			COMMAND_C4_SKYRA: 'I am sorry, I know you want to play with me, but if I do, I will not be able to help other people! 💔',
			COMMAND_C4_BOT: 'I am sorry, but I do not think they would like to stop doing what they are doing and play with humans.',
			COMMAND_C4_SELF: 'You must be so sad to play against yourself. Try again with another user.',
			COMMAND_C4_PROGRESS: 'I am sorry, but there is a game in progress in this channel, try again when it finishes.',
			COMMAND_C4_PROMPT: (challenger, challengee) => `Dear ${challengee}, you have been challenged by ${challenger} in a Connect-Four match. Reply with **yes** to accept!`,
			COMMAND_C4_PROMPT_TIMEOUT: 'I am sorry, but the challengee did not reply on time.',
			COMMAND_C4_PROMPT_DENY: 'I am sorry, but the challengee refused to play.',
			COMMAND_C4_START: (player, table) => `Let's play! Turn for: **${player}**.\n${table}`,
			COMMAND_C4_GAME_TIMEOUT: '**The match concluded in a draw due to lack of a response (60 seconds)**',
			COMMAND_C4_GAME_COLUMN_FULL: 'This column is full. Please try another.',
			COMMAND_C4_GAME_WIN: (user, table) => `**${user}** won!\n${table}`,
			COMMAND_C4_GAME_DRAW: (table) => `This match concluded in a **draw**!\n${table}`,
			COMMAND_C4_GAME_NEXT: (player, table) => `Turn for: **${player}**.\n${table}`,
			COMMAND_DAILY_TIME: (time) => `Next dailies are available in ${duration(time)}`,
			COMMAND_DAILY_TIME_SUCCESS: (amount) => `Yay! You earned ${amount}${SHINY}! Next dailies in: 12 hours.`,
			COMMAND_DAILY_GRACE: (remaining) => [
				`Would you like to claim the dailies early? The remaining time will be added up to a normal 12h wait period.`,
				`Remaining time: ${duration(remaining, true)}`
			].join('\n'),
			COMMAND_DAILY_GRACE_ACCEPTED: (amount, remaining) => `Successfully claimed ${amount}${SHINY}! Next dailies in: ${duration(remaining)}`,
			COMMAND_DAILY_GRACE_DENIED: 'Got it! Come back soon!',
			COMMAND_LEVEL: {
				LEVEL: 'Level',
				EXPERIENCE: 'Experience',
				NEXT_IN: 'Next level in'
			},
			COMMAND_MYLEVEL: (points, next) => `You have a total of ${points} points.${next}`,
			COMMAND_MYLEVEL_NEXT: (remaining, next) => `\nPoints for next rank: **${remaining}** (at ${next} points).`,
			COMMAND_PAY_MISSING_MONEY: (needed, has) => `I am sorry, but you need ${needed}${SHINY} and you have ${has}${SHINY}`,
			COMMAND_PAY_PROMPT: (user, amount) => `You are about to pay ${user} ${amount}${SHINY}, are you sure you want to proceed?`,
			COMMAND_PAY_PROMPT_ACCEPT: (user, amount) => `Payment accepted, ${amount}${SHINY} has been sent to ${user}'s profile.`,
			COMMAND_PAY_PROMPT_DENY: 'Payment denied.',
			COMMAND_PAY_SELF: 'If I taxed this, you would lose money, therefore, do not try to pay yourself.',
			COMMAND_SOCIAL_PAY_BOT: 'Oh, sorry, but money is meaningless for bots, I am pretty sure a human would take advantage of it better.',
			COMMAND_PROFILE: {
				GLOBAL_RANK: 'Global Rank',
				CREDITS: 'Credits',
				REPUTATION: 'Reputation',
				EXPERIENCE: 'Experience',
				LEVEL: 'Level'
			},
			COMMAND_REMINDME_INPUT: 'You must tell me what do you want me to remind you and when.',
			COMMAND_REMINDME_INPUT_PROMPT: 'How long should your new reminder last?',
			COMMAND_REMINDME_TIME: 'Your reminder must be at least one minute long.',
			COMMAND_REMINDME_CREATE: (id) => `A reminder with ID \`${id}\` has been created.`,
			COMMAND_REMINDME_DELETE_PARAMS: ['delete', 'remove'],
			COMMAND_REMINDME_DELETE_INVALID_PARAMETERS: 'To delete a previously created reminder, you must type either \'delete\' or \'remove\' followed by the ID.',
			COMMAND_REMINDME_DELETE: task => `The reminder with ID \`${task.id}\` and with a remaining time of **${duration(task.timestamp - Date.now())}** has been successfully deleted.`,
			COMMAND_REMINDME_LIST_PARAMS: ['list', 'all'],
			COMMAND_REMINDME_LIST_EMPTY: 'You do not have any active reminder',
			COMMAND_REMINDME_INVALID_ID: 'I am sorry, but the ID provided does not seem to be valid.',
			COMMAND_REMINDME_NOTFOUND: 'I cannot find something here. The reminder either never existed or it ended.',

			COMMAND_REPUTATION_TIME: (remaining) => `You can give a reputation point in ${duration(remaining)}`,
			COMMAND_REPUTATION_USABLE: 'You can give a reputation point now.',
			COMMAND_REPUTATION_USER_NOTFOUND: 'You must mention a user to give a reputation point.',
			COMMAND_REPUTATION_SELF: 'You cannot give a reputation point to yourself.',
			COMMAND_REPUTATION_BOTS: 'You cannot give a reputation point to bots.',
			COMMAND_REPUTATION_GIVE: (user) => `You have given a reputation point to **${user}**!`,
			COMMAND_REPUTATIONS: (points) => `You have a total of ${points} reputation points.`,
			COMMAND_SCOREBOARD_POSITION: (position) => `Your placing position is: ${position}`,
			COMMAND_SETCOLOR: (color) => `Color changed to ${color}`,
			COMMAND_SLOTMACHINES_MONEY: (money) => `I am sorry, but you do not have enough money to pay your bet! Your current account balance is ${money}${SHINY}`,
			COMMAND_SLOTMACHINES_WIN: (roll, winnings) => `**You rolled:**\n${roll}\n**Congratulations!**\nYou won ${winnings}${SHINY}!`,
			COMMAND_SLOTMACHINES_LOSS: (roll) => `**You rolled:**\n${roll}\n**Mission failed!**\nWe'll get em next time!`,
			COMMAND_SOCIAL_PROFILE_NOTFOUND: 'I am sorry, but this user profile does not exist.',
			COMMAND_SOCIAL_PROFILE_BOT: 'I am sorry, but Bots do not have a __Member Profile__.',
			COMMAND_SOCIAL_PROFILE_DELETE: (user, points) => `|\`✅\`| **Success**. Deleted the __Member Profile__ for **${user}**, which had ${points} points.`,
			COMMAND_SOCIAL_POINTS: 'May you specify the amount of points you want to add or remove?',
			COMMAND_SOCIAL_UPDATE: (action, amount, user, before, now) => `You have just ${action === 'add' ? 'added' : 'removed'} ${amount} ${amount === 1 ? 'point' : 'points'} to the __Member Profile__ for ${user}. Before: ${before}; Now: ${now}.`,

			/**
			 * ###############
			 * SYSTEM COMMANDS
			 */

			COMMAND_EVAL_TIMEOUT: (seconds) => `TIMEOUT: Took longer than ${seconds} seconds.`,
			COMMAND_EVAL_ERROR: (time, output, type) => `**Error**:${output}\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_OUTPUT: (time, output, type) => `**Output**:${output}\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_OUTPUT_CONSOLE: (time, type) => `Sent the result to console.\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_OUTPUT_FILE: (time, type) => `Sent the result as a file.\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_OUTPUT_HASTEBIN: (time, url, type) => `Sent the result to hastebin: ${url}\n**Type**:${type}\n${time}\n`,

			COMMAND_STATS: (STATS, UPTIME, USAGE) => [
				'= STATISTICS =',
				`• Users      :: ${STATS.USERS}`,
				`• Guilds     :: ${STATS.GUILDS}`,
				`• Channels   :: ${STATS.CHANNELS}`,
				`• Discord.js :: ${STATS.VERSION}`,
				`• Node.js    :: ${STATS.NODE_JS}`,
				`• Klasa      :: ${version}`,
				'',
				'= UPTIME =',
				`• Host       :: ${UPTIME.HOST}`,
				`• Total      :: ${UPTIME.TOTAL}`,
				`• Client     :: ${UPTIME.CLIENT}`,
				'',
				'= HOST USAGE =',
				`• CPU Load   :: ${USAGE.CPU_LOAD}`,
				`• RAM +Node  :: ${USAGE.RAM_TOTAL}`,
				`• RAM Usage  :: ${USAGE.RAM_USED}`
			],

			/**
			 * #############
			 * TAGS COMMANDS
			 */

			/**
			 * ##############
			 * TOOLS COMMANDS
			 */

			/**
			 * ################
			 * WEATHER COMMANDS
			 */

			/**
			 * #################################
			 * #           INHIBITORS          #
			 * #################################
			 */

			INHIBITOR_SPAM: (channel) => `Can we move to ${channel} please? This command might be too spammy and can ruin other people's conversations.`,

			/**
			 * #################################
			 * #             UTILS             #
			 * #################################
			 */

			COMMAND_DM_NOT_SENT: 'I cannot send you a message in DMs, did you block me?',
			COMMAND_DM_SENT: 'I have sent you the message in DMs.',
			COMMAND_ROLE_HIGHER_SKYRA: 'The selected member has higher or equal role position than me.',
			COMMAND_ROLE_HIGHER: 'The selected member has higher or equal role position than you.',
			COMMAND_SUCCESS: 'Successfully executed the command.',
			COMMAND_TOSKYRA: 'Eww... I thought you loved me! 💔',
			COMMAND_USERSELF: 'Why would you do that to yourself?',

			SYSTEM_FETCHING: '`Fetching...`',
			SYSTEM_PROCESSING: '`Processing...`',
			SYSTEM_HIGHEST_ROLE: 'This role\'s hierarchy position is higher or equal than me, I am not able to grant it to anyone.',
			SYSTEM_CHANNEL_NOT_POSTABLE: 'I am not allowed to send messages to this channel.',
			SYSTEM_FETCHBANS_FAIL: `Failed to fetch bans. Do I have the ${PERMS.BAN_MEMBERS} permission?`,
			SYSTEM_LOADING: '`Loading... please wait.`',
			SYSTEM_ERROR: 'Something happened!',
			SYSTEM_MESSAGE_NOT_FOUND: 'I am sorry, but either you wrote the message ID incorrectly, or it got deleted.',

			LISTIFY_PAGE: (page, pageCount, results) => `Page ${page} / ${pageCount} | ${results} Total`,

			GUILD_SETTINGS_CHANNELS_MOD: 'You need to configure a modlog channel. Use `Skyra, conf set channels.modlog #modlogs`.',
			GUILD_SETTINGS_ROLES_MUTED: 'You need to configure a muted role. Use `Skyra, conf set roles.muted rolename`.',
			GUILD_MUTE_NOT_FOUND: 'I failed to fetch the modlog that sets this user as muted. Either you did not mute this user or all the mutes are appealed.',
			GUILD_BANS_EMPTY: 'There are no bans registered in this server.',
			GUILD_BANS_NOT_FOUND: 'Please, write a valid user ID or tag.',
			CHANNEL_NOT_READABLE: `I am sorry, but I need the permission **${PERMS.VIEW_CHANNEL}**`,

			USER_NOT_IN_GUILD: 'This user is not in this server.',

			EVENTS_GUILDMEMBERADD: 'User Joined',
			EVENTS_GUILDMEMBERADD_MUTE: 'Muted User joined',
			EVENTS_GUILDMEMBERADD_RAID: 'Raid Detected',
			EVENTS_GUILDMEMBERREMOVE: 'User left',
			EVENTS_GUILDMEMBER_UPDATE_NICKNAME: (previous, current) => `Updated the nickname from **${previous}** to **${current}**`,
			EVENTS_GUILDMEMBER_ADDED_NICKNAME: (previous, current) => `Added a new nickname **${current}**`,
			EVENTS_GUILDMEMBER_REMOVED_NICKNAME: (previous) => `Removed the nickname **${previous}**`,
			EVENTS_GUILDMEMBER_UPDATE_ROLES: (removed, added) => `${removed.length > 0
				? `Removed the role${removed.length > 1 ? 's' : ''}: ${removed.join(', ')}\n` : ''}${added.length > 0
				? `Added the role${added.length > 1 ? 's' : ''}: ${added.join(', ')}` : ''}`,
			EVENTS_MESSAGE_UPDATE: 'Message Edited',
			EVENTS_MESSAGE_DELETE: 'Message Deleted',
			EVENTS_MESSAGE_DELETE_MSG: (msg) => msg.substring(0, 1900),
			EVENTS_COMMAND: (command) => `Command Used: ${command}`,
			EVENTS_STREAM_START: (member) => `The user **${member.user.tag}** is now live! **${member.presence.activity.name}**\n${member.presence.activity.url}`,
			EVENTS_STREAM_STOP: (member) => `The user **${member.user.tag}** is not longer live!`,
			EVENTS_STARBOARD_SELF: (user) => `Dear ${user}, you cannot star your own messages.`,
			EVENTS_STARBOARD_BOT: (user) => `Dear ${user}, you cannot star bot messages.`,
			EVENTS_STARBOARD_EMPTY: (user) => `Dear ${user}, you cannot star empty messages.`,

			SETTINGS_DELETE_CHANNELS_DEFAULT: 'Reseated the value for `channels.default`',
			SETTINGS_DELETE_ROLES_INITIAL: 'Reseated the value for `roles.initial`',
			SETTINGS_DELETE_ROLES_MUTE: 'Reseated the value for `roles.muted`',

			GUILD_WARN_NOT_FOUND: 'I failed to fetch the modlog for appealing. Either it does not exist, is not type of warning, or it is appealed.',
			GUILD_MEMBER_NOT_VOICECHANNEL: 'I cannot execute this action in a member that is not connected to a voice channel.',

			PROMPTLIST_MULTIPLE_CHOICE: (list, amount) => `There are ${amount} results. Please choose a number between 1 and ${amount}, or write **abort** to abort the prompt.\n${list}`,
			PROMPTLIST_ATTEMPT_FAILED: (list, attempt, maxAttempts) => `Invalid input. Attempt **${attempt}** out of **${maxAttempts}**\n${list}`,
			PROMPTLIST_ABORT: 'abort',
			PROMPTLIST_ABORTED: 'Successfully aborted the prompt.',

			EVENTS_ERROR_WTF: 'What a Terrible Failure! I am very sorry!',
			EVENTS_ERROR_STRING: (mention, message) => `Dear ${mention}, ${message}`
		};
	}

	async init() { } // eslint-disable-line no-empty-function

};
