/* eslint object-curly-newline: "off", max-len: "off" */
const { Language, version, Timestamp } = require('klasa');
const { LanguageHelp, FriendlyDuration, util, klasaUtil, constants: { EMOJIS: { SHINY } } } = require('../index');

const builder = new LanguageHelp()
	.setExplainedUsage('⚙ | ***Explained usage***')
	.setPossibleFormats('🔢 | ***Possible formats***')
	.setExamples('🔗 | ***Examples***')
	.setReminder('⏰ | ***Reminder***');
const timestamp = new Timestamp('YYYY/MM/DD [at] HH:mm:ss');

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
	return FriendlyDuration.duration(time, TIMES);
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
			COMMAND_INVITE_DESCRIPTION: 'Displays the join server link of the bot.',
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
			COMMAND_CONF_NOCHANGE: (key) => `The value for **${key}** was already that value.`,
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
			 * ################
			 * ANIMALS COMMANDS
			 */

			COMMAND_CATFACT_DESCRIPTION: 'Let me tell you a misterious cat fact.',
			COMMAND_CATFACT_EXTENDED: builder.display('catfact', {
				extendedHelp: `Do you know cats are very curious, right? They certainly have a lot of fun and weird facts.
				This command queries catfact.ninja and retrieves a fact so you can read it.`
			}),
			COMMAND_DOG_DESCRIPTION: 'Cute doggos! ❤',
			COMMAND_DOG_EXTENDED: builder.display('dog', {
				extendedHelp: `Do **you** know how cute are dogs? They are so beautiful! This command uses a tiny selection of images
					From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are
					some images that, sadly, got deleted and I cannot retrieve them 💔.`
			}),
			COMMAND_FOX_DESCRIPTION: 'Let me show you an image of a fox!',
			COMMAND_FOX_EXTENDED: builder.display('fox', {
				extendedHelp: `This command provides you a random image from PixaBay, always showing 'fox' results. However,
				it may not be exactly accurate and show you other kinds of foxes.`
			}),
			COMMAND_KITTY_DESCRIPTION: 'KITTENS!',
			COMMAND_KITTY_EXTENDED: builder.display('kitty', {
				extendedHelp: `Do **you** know how cute are kittens? They are so beautiful! This command uses a tiny selection of images
				From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are
				some images that, sadly, got deleted and I cannot retrieve them 💔.`
			}),
			COMMAND_SHIBE_DESCRIPTION: 'Cute shibes!',
			COMMAND_SHIBE_EXTENDED: builder.display('shibe', {
				extendedHelp: `Everyone loves shibes, I shall love them aswell! They're so adorable ❤.`
			}),

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
				extendedHelp: `This command serves the purpose of **giving** you the subscriber role, which must be configured by the
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
			COMMAND_CHANGEMYMIND_DESCRIPTION: 'Skyra is the best, change my mind.',
			COMMAND_CHANGEMYMIND_EXTENDED: builder.display('changeMyMind', {
				extendedHelp: `I still think I'm the best, change my mind. I make a photo with your avatar and some text in some paper.`,
				explainedUsage: [
					['text', 'The phrase you want.']
				],
				examples: ['Skyra is the best bot in this server']
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
			 * ##############
			 * GAMES COMMANDS
			 */

			COMMAND_C4_DESCRIPTION: 'Play Connect-Four with somebody.',
			COMMAND_C4_EXTENDED: builder.display('c4', {
				extendedHelp: `This game is better played on PC. Connect Four (also known as Captain's Mistress, Four Up, Plot
					Four, Find Four, Four in a Row, Four in a Line and Gravitrips (in Soviet Union)) is a two-player connection
					game in which the players first choose a color and then take turns dropping colored discs from the top into a
					seven-column, ~~six~~ five-row vertically suspended grid.`
			}),
			COMMAND_TICTACTOE_DESCRIPTION: 'Play Tic-Tac-Toe with somebody.',
			COMMAND_TICTACTOE_EXTENDED: builder.display('tictactoe', {
				extendedHelp: `Tic-tac-toe (also known as noughts and crosses or Xs and Os) is a paper-and-pencil game for two
				players, X and O, who take turns marking the spaces in a 3×3 grid. The player who succeeds in placing three of
				their marks in a horizontal, vertical, or diagonal row wins the game.`
			}),

			/**
			 * ###################
			 * MANAGEMENT COMMANDS
			 */

			COMMAND_CREATEMUTE_DESCRIPTION: 'Prepare the mute system.',
			COMMAND_CREATEMUTE_EXTENDED: builder.display('createMute', {
				extendedHelp: `This command prepares the mute system by creating a role called 'muted', and configuring it to
					the guild configuration. This command also modifies all channels (where possible) permissions and disables
					the permission **${PERMS.SEND_MESSAGES}** in text channels and **${PERMS.CONNECT}** in voice channels for said role.`
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

			/**
			 * ###################
			 * MANAGEMENT COMMANDS
			 */

			COMMAND_NICK_DESCRIPTION: `Change Skyra's nickname for this guild.`,
			COMMAND_NICK_EXTENDED: builder.display('nick', {
				extendedHelp: `This command allows you to change Skyra's nickname easily for the guild.`,
				reminder: `This command requires the **${PERMS.CHANGE_NICKNAME}** permission. Make sure Skyra has it.`,
				explainedUsage: [
					['nick', `The new nickname. If you don't put any, it'll reset it instead.`]
				],
				examples: ['SkyNET', 'Assistant', '']
			}),
			COMMAND_TRIGGERS_DESCRIPTION: `Set custom triggers for your guild.`,
			COMMAND_TRIGGERS_EXTENDED: builder.display('triggers', {
				extendedHelp: `This command allows administrators to go further with the personalization of Skyra in the guild. A trigger is
					a piece that can active other functions. For example, the aliases are triggers that get executed when the command does not
					exist in bot, triggering the unknown command event. When this happens, the alias system executes and tries to find an entry
					that matches with the input.`,
				reminder: `This command requires the **${PERMS.ADD_REACTIONS}** permission so it can test reactions. Make sure Skyra has it.`,
				explainedUsage: [
					['list', `List all current triggers.`],
					['add <type> <input> <output>', 'Add a new trigger given a type, input and output.'],
					['remove <type> <input>', 'Remove a trigger given the type and input.']
				],
				examples: ['', 'list', 'add reaction "good night" 🌛', 'remove reaction "good night"']
			}),

			/**
			 * #################################
			 * MANAGEMENT/CONFIGURATION COMMANDS
			 */

			COMMAND_MANAGEROLEREACTION_DESCRIPTION: 'Manage the role reactions.',
			COMMAND_MANAGEROLEREACTION_EXTENDED: builder.display('manageRoleReaction', {
				extendedHelp: `This command manages the role reaction module, it requires a **role channel** set up and the permissions **${PERMS.ADD_REACTIONS}**
					and **${PERMS.READ_MESSAGE_HISTORY}** to be able to validate and operate correctly.`,
				explainedUsage: [
					['show', 'Show all the currently configured role reactions.'],
					['add <role> <emoji>', 'Add a new role reaction with the role ID or name, and a valid emoji.'],
					['remove <emoji>', 'Remove a role reaction by its configured emoji.'],
					['reset', 'Reset all the current role reactions.']
				],
				reminder: 'You cannot set the same emoji twice, and Skyra may remove role reactions automatically if she loses permissions or they are removed.',
				examples: ['show', 'add Baited 🎵', 'add "Looking for Group" 🎮', 'remove 🎮', 'reset']
			}),
			COMMAND_SETIGNORECHANNELS_DESCRIPTION: 'Set a channel to the ignore channel list.',
			COMMAND_SETIGNORECHANNELS_EXTENDED: builder.display('setIgnoreChannels', {
				extendedHelp: `This command helps you setting up ignored channels. An ignored channel is a channel where nobody but moderators
					can use Skyra's commands. Unlike removing the **${PERMS.SEND_MESSAGES}** permission, Skyra is still able to send (and therefore
					execute commands) messages, which allows moderators to use moderation commands in the channel. Use this if you want to ban
					any command usage from the bot in a specific channel.`,
				explainedUsage: [
					['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
				],
				reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
				examples: ['#general', 'here']
			}),
			COMMAND_SETMEMBERLOGS_DESCRIPTION: 'Set the member logs channel.',
			COMMAND_SETMEMBERLOGS_EXTENDED: builder.display('setMemberLogs', {
				extendedHelp: `This command helps you setting up the member log channel. A member log channel only sends two kinds of logs: "Member Join" and
					"Member Leave". If a muted user joins, it will send a special "Muted Member Join" event. All messages are in embeds so you will need to enable
					the permission **${PERMS.EMBED_LINKS}** for Skyra. You also need to individually set the "events" you want to listen: "events.memberAdd" and
					"events.memberRemove". For roles, you would enable "events.memberNicknameChange" and/or "events.memberRolesChange" via the "config" command.`,
				explainedUsage: [
					['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
				],
				examples: ['#member-logs', 'here']
			}),
			COMMAND_SETMESSAGELOGS_DESCRIPTION: 'Set the message logs channel.',
			COMMAND_SETMESSAGELOGS_EXTENDED: builder.display('setMessageLogs', {
				extendedHelp: `This command helps you setting up the message log channel. A message log channel only sends three kinds of logs: "Message Delete",
					"Message Edit", and "Message Prune". All messages are in embeds so you will need to enable the permission **${PERMS.EMBED_LINKS}** for Skyra. You
					also need to individually set the "events" you want to listen: "events.messageDelete", "events.messageEdit", and "events.messagePrune" via the
					"config" command.`,
				explainedUsage: [
					['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
				],
				reminder: `Due to Discord limitations, Skyra cannot know who deleted a message. The only way to know is by fetching audit logs, requiring the
				permission **${PERMS.VIEW_AUDIT_LOG}** which access is limited in the majority of guilds and the amount of times I can fetch them in a period of time.`,
				examples: ['#message-logs', 'here']
			}),
			COMMAND_SETMODLOGS_DESCRIPTION: 'Set the mod logs channel.',
			COMMAND_SETMODLOGS_EXTENDED: builder.display('setModLogs', {
				extendedHelp: `This command helps you setting up the mod log channel. A mod log channel only sends case reports indexed by a number case and with
					"claimable" reasons and moderators. This channel is not a must and you can always retrieve specific modlogs with the "case" command. All
					messages are in embeds so you will need to enable the permission **${PERMS.EMBED_LINKS}** for Skyra. For auto-detection, you need to individually
					set the "events" you want to listen: "events.banAdd", "events.banRemove" via the "config" command.`,
				explainedUsage: [
					['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
				],
				reminder: `Due to Discord limitations, the auto-detection does not detect kicks. You need to use the "kick" command if you want to document them as
				a formal moderation log case.`,
				examples: ['#mod-logs', 'here']
			}),
			COMMAND_SETPREFIX_DESCRIPTION: 'Set Skyra\'s prefix.',
			COMMAND_SETPREFIX_EXTENDED: builder.display('setPrefix', {
				extendedHelp: `This command helps you setting up Skyra's prefix. A prefix is an affix that is added in front of the word, in this case, the message.
					It allows bots to distinguish between a regular message and a command. By nature, the prefix between should be different to avoid conflicts. If
					you forget Skyra's prefix, simply mention her with nothing else and she will tell you the current prefix. Alternatively, you can take advantage
					of Skyra's NLP (Natural Language Processing) and prefix the commands with her name and a comma. For example, "Skyra, ping".`,
				explainedUsage: [
					['prefix', `The prefix to set. Default one in Skyra is "${this.client.options.prefix}".`]
				],
				reminder: `Your prefix should only contain characters everyone can write and type.`,
				examples: ['&', '=']
			}),
			COMMAND_SETROLECHANNEL_DESCRIPTION: 'Set the role channel for role reactions.',
			COMMAND_SETROLECHANNEL_EXTENDED: builder.display('setRoleChannel', {
				extendedHelp: `This command sets up the role channel to lock the reactions to, it is a requirement to set up before setting up the **role message**,
					and if none is given, the role reactions module will not run.`,
				explainedUsage: [
					['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
				],
				reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
				examples: ['#roles', 'here']
			}),
			COMMAND_SETROLEMESSAGE_DESCRIPTION: 'Set the role message for role reactions.',
			COMMAND_SETROLEMESSAGE_EXTENDED: builder.display('setRoleMessage', {
				extendedHelp: `This command sets up the role message to lock the reactions to, it requires a **role channel** to be set up first, and if none is given,
					Skyra will listen to any reaction in the channel. Additionally, Skyra requires **${PERMS.READ_MESSAGE_HISTORY}** in order to fetch the message for
					validation.`,
				explainedUsage: [
					['message', 'An ID, they are 17-18 characters long and numeric.']
				],
				reminder: 'You must execute this command in the role channel.',
				examples: ['434096799847022598']
			}),

			/**
			 * ###########################
			 * MANAGEMENT/HELPERS COMMANDS
			 */

			COMMAND_ROLEINFO_DESCRIPTION: 'Check the information for a role.',
			COMMAND_ROLEINFO_EXTENDED: builder.display('roleinfo', {
				extendedHelp: `The roleinfo command displays information for a role, such as its id, name, color, whether it's hoisted
					(displays separately) or not, it's role hierarchy position, whether it's mentionable or not, how many members have said
					role, and its permissions. It sends an embedded message with the colour of the role.`,
				explainedUsage: [
					['role', 'The role name, partial name, mention or id.']
				],
				examples: ['Administrator', 'Moderator', '']
			}),
			COMMAND_GUILDINFO_DESCRIPTION: 'Check the information of the guild.',
			COMMAND_GUILDINFO_EXTENDED: builder.display('serverinfo', {
				extendedHelp: `The serverinfo command displays information for the guild the message got sent. It shows the amount of channels,
					with the count for each category, the amount of members (given from the API), the owner with their user id, the amount of roles,
					region, creation date, verification level... between others.`
			}),

			/**
			 * ###############################
			 * MANAGEMENT/WORD FILTER COMMANDS
			 */

			COMMAND_FILTER_DESCRIPTION: 'Manage this guild\'s word blacklist.',
			COMMAND_FILTER_EXTENDED: builder.display('filter', {
				extendedHelp: `The filter command manages the word blacklist for this server and must have a filter mode set up, check \`Skyra, help setFilterMode\`.
					Skyra's word filter can find matches even with special characters or spaces between the letters of a blacklisted word, as well as it filters
					duplicated characters for enhanced filtering.`
			}),
			COMMAND_SETFILTERMODE_DESCRIPTION: 'Manage this guild\'s word blacklist mode.',
			COMMAND_SETFILTERMODE_EXTENDED: builder.display('setFilterMode', {
				extendedHelp: `The setFilterMode command manages the mode of the word blacklist, in Skyra, there are three modes: **Disabled** (the default value)
					which as its name suggests, it disables the word filter; **DeleteOnly**, which deletes the message; **LogOnly**, which does not delete the message
					but instead sends a modlog; and **All**, which enables both message deletion and logging.`,
				reminder: 'Both **LogOnly** and **All** modes require the key `channels.modlogs` to be set up.'
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
			COMMAND_UPVOTE_DESCRIPTION: 'Get a link to upvote Skyra in **Discord Bot List**',
			COMMAND_UPVOTE_EXTENDED: builder.display('upvote', {
				extendedHelp: `Discord Bot List is a website where you can find amazing bots for your website. If you really love me,
					you can help me a lot by upvoting me every 24 hours, so more users will be able to find me!`
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
			 * ##############################
			 * MODERATION/MANAGEMENT COMMANDS
			 */

			COMMAND_WARNINGS_DESCRIPTION: 'List all warnings from this guild or from a user.',
			COMMAND_WARNINGS_EXTENDED: builder.display('warnings', {
				extendedHelp: `This command shows either all warnings filed in this guild, or all warnings filed in this guild
					for a specific user. This command uses a reaction-based menu and requires the permission **${PERMS.MANAGE_MESSAGES}**
					to execute correctly.`,
				examples: ['', '@Pete']
			}),

			/**
			 * #############################
			 * MODERATION/UTILITIES COMMANDS
			 */

			COMMAND_ARCHIVE_DESCRIPTION: '[BETA] Temporarily save all messages from the current channel.',
			COMMAND_ARCHIVE_EXTENDED: builder.display('archive', {
				extendedHelp: `The archive command fetches multiple messages from a channel with an optional filter. How does
					this command work? First, I fetch all the messages, apply the filter, and then it's when the magic happens,
					I make a "message gist", to respect End-User Data policies, all of this is encrypted and the gist requires
					a key to unlock so you can read the contents. You unlock and read the contents from the website.`,
				explainedUsage: [
					['Messages', 'The amount of messages to archive.'],
					['Filter', 'The filter to apply.'],
					['(Filter) Link', 'Filters messages that have links on the content.'],
					['(Filter) Invite', 'Filters messages that have invite links on the content.'],
					['(Filter) Bots', 'Filters messages sent by bots.'],
					['(Filter) You', 'Filters messages sent by Skyra.'],
					['(Filter) Me', 'Filters your messages.'],
					['(Filter) Upload', 'Filters messages that have attachments.'],
					['(Filter) User', 'Filters messages sent by the specified user.']
				],
				examples: ['50 me', '75 @kyra', '20 bots'],
				reminder: 'Message gists last 30 days, after that, they are deleted, you also need the encryption key.'
			}),
			COMMAND_CASE_DESCRIPTION: 'Get the information from a case given its index.',
			COMMAND_CASE_EXTENDED: builder.display('case', {
				extendedHelp: ``
			}),

			/**
			 * ###################
			 * MODERATION COMMANDS
			 */

			COMMAND_BAN_DESCRIPTION: 'Hit somebody with the ban hammer.',
			COMMAND_BAN_EXTENDED: builder.display('ban', {
				extendedHelp: `This command requires **${PERMS.BAN_MEMBERS}**, and only members with lower role hierarchy position
					can be banned by me. No, the guild's owner cannot be banned. This action can be optionally timed to create
					a temporary ban.`,
				examples: ['@Pete', '@Pete Spamming all channels.', '@Pete Spamming all channels, for 24 hours.']
			}),
			COMMAND_KICK_DESCRIPTION: 'Hit somebody with the 👢.',
			COMMAND_KICK_EXTENDED: builder.display('kick', {
				extendedHelp: `This command requires **${PERMS.KICK_MEMBERS}**, and only members with lower role hierarchy position
					can be kicked by me. No, the guild's owner cannot be kicked.`,
				examples: ['@Pete', '@Pete Spamming general chat.']
			}),
			COMMAND_LOCKDOWN_DESCRIPTION: 'Close the gates for this channel!',
			COMMAND_LOCKDOWN_EXTENDED: builder.display('lockdown', {
				extendedHelp: `This command requires **${PERMS.MANAGE_CHANNELS}** in order to be able to manage the permissions for
					a channel. This command removes the permission **${PERMS.SEND_MESSAGES}** to the \`@everyone\` role so nobody but
					the members with roles that have their own overrides (besides administrators, who bypass channel overrides) can
					send messages. Optionally, you can pass time as second argument.`,
				examples: ['', '#general', '#general 5m']
			}),
			COMMAND_MUTE_DESCRIPTION: 'Mute a user in all text and voice channels.',
			COMMAND_MUTE_EXTENDED: builder.display('mute', {
				extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}**, and only members with lower role hierarchy position
					can be managed by me. No, the guild's owner cannot be muted. This action can be optionally timed to create
					a temporary mute. This action saves a member's roles temporarily and will be granted to the user after the unmute.
					The muted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.`,
				examples: ['@Pete', '@Pete Spamming all channels', '@Pete Spamming all channels, for 24 hours.']
			}),
			COMMAND_PRUNE_DESCRIPTION: 'Prunes a certain amount of messages w/o filter.',
			COMMAND_PRUNE_EXTENDED: builder.display('prune', {
				extendedHelp: `This command deletes the given amount of messages given a filter within the last 100 messages sent
					in the channel the command has been run.`,
				explainedUsage: [
					['Messages', 'The amount of messages to prune.'],
					['Filter', 'The filter to apply.'],
					['(Filter) Link', 'Filters messages that have links on the content.'],
					['(Filter) Invite', 'Filters messages that have invite links on the content.'],
					['(Filter) Bots', 'Filters messages sent by bots.'],
					['(Filter) You', 'Filters messages sent by Skyra.'],
					['(Filter) Me', 'Filters your messages.'],
					['(Filter) Upload', 'Filters messages that have attachments.'],
					['(Filter) User', 'Filters messages sent by the specified user.']
				],
				examples: ['50 me', '75 @kyra', '20 bots'],
				reminder: 'Due to a Discord limitation, bots cannot delete messages older than 14 days.'
			}),
			COMMAND_REASON_DESCRIPTION: 'Edit the reason field from a moderation log case.',
			COMMAND_REASON_EXTENDED: builder.display('reason', {
				extendedHelp: `This command allows moderation log case management, it allows moderators to update the reason.`,
				examples: ['420 Spamming all channels']
			}),
			COMMAND_SOFTBAN_DESCRIPTION: 'Hit somebody with the ban hammer, destroying all their messages for some days, and unban it.',
			COMMAND_SOFTBAN_EXTENDED: builder.display('softban', {
				extendedHelp: `This command requires **${PERMS.BAN_MEMBERS}**, and only members with lower role hierarchy position
					can be banned by me. No, the guild's owner cannot be banned. The ban feature from Discord has a feature that
					allows the moderator to remove all messages from all channels that have been sent in the last 'x' days, being
					a number between 0 (no days) and 7. The user gets unbanned right after the ban, so it is like a kick, but
					that can prune many many messages.`,
				examples: ['@Pete', '@Pete Spamming all channels', '@Pete 7 All messages sent in 7 are gone now, YEE HAH!']
			}),
			COMMAND_UNBAN_DESCRIPTION: 'Unban somebody from this guild.',
			COMMAND_UNBAN_EXTENDED: builder.display('unban', {
				extendedHelp: `This command requires **${PERMS.BAN_MEMBERS}**. It literally gets somebody from the rubbish bin,
					cleans them up, and allows the pass to this guild's gates.`,
				examples: ['@Pete', '@Pete Turns out he was not the one who spammed all channels ¯\\_(ツ)_/¯']
			}),
			COMMAND_UNMUTE_DESCRIPTION: 'Remove the scotch tape from a user.',
			COMMAND_UNMUTE_EXTENDED: builder.display('unmute', {
				extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}** and removes a user from the muted people's list,
					and gives the old roles back if the user had them.`,
				examples: ['@Pete', '@Pete (Insert random joke here).']
			}),
			COMMAND_UNWARN_DESCRIPTION: 'Appeal a warning moderation log case.',
			COMMAND_UNWARN_EXTENDED: builder.display('unwarn', {
				extendedHelp: `This command appeals a warning, it requires no permissions, you only give me the moderation log
					case to appeal and the reason.`,
				examples: ['0 Whoops, wrong dude.', '42 Turns out this was the definition of life.']
			}),
			COMMAND_VMUTE_DESCRIPTION: 'Throw somebody\'s microphone out the window.',
			COMMAND_VMUTE_EXTENDED: builder.display('vmute', {
				extendedHelp: `This command requires **${PERMS.MUTE_MEMBERS}**, and only members with lower role hierarchy position
					can be silenced by me. No, the guild's owner cannot be silenced. This action can be optionally timed to create
					a temporary voice mute.`,
				examples: ['@Pete', '@Pete Singing too loud', '@Pete Literally sang hear rape, for 24 hours.']
			}),
			COMMAND_VOICEKICK_DESCRIPTION: 'Hit somebody with the 👢 for singing so bad and loud.',
			COMMAND_VOICEKICK_EXTENDED: builder.display('voicekick', {
				extendedHelp: `This command requires the permissions **${PERMS.MANAGE_CHANNELS}** to create a temporary (hidden)
					voice channel, and **${PERMS.MOVE_MEMBERS}** to move the user to the temporary channel. After this, the channel
					is quickly deleted, making the user leave the voice channel. For scared moderators, this command has almost no
					impact in the average user, as the channel is created in a way only me and the selected user can see and join,
					then quickly deleted.`,
				examples: ['@Pete', '@Pete Spamming all channels']
			}),
			COMMAND_VUNMUTE_DESCRIPTION: `Get somebody's microphone back so they can talk.`,
			COMMAND_VUNMUTE_EXTENDED: builder.display('vunmute', {
				extendedHelp: `This command requires **${PERMS.MUTE_MEMBERS}**, and only members with lower role hierarchy position
					can be un-silenced by me. No, the guild's owner cannot be un-silenced.`,
				examples: ['@Pete', '@Pete Appealed his times signing hear rape.']
			}),
			COMMAND_WARN_DESCRIPTION: 'File a warning to somebody.',
			COMMAND_WARN_EXTENDED: builder.display('warn', {
				extendedHelp: `This command files a warning to a user. This kind of warning is meant to be **formal warnings**, as
					they will be shown in the 'warnings' command. It is a good practise to do an informal warning before using this
					command.`,
				examples: ['@Pete Attempted to mention everyone.']
			}),

			/**
			 * ##################
			 * OVERWATCH COMMANDS
			 */

			/**
			 * ###############
			 * SOCIAL COMMANDS
			 */

			COMMAND_BANNER_DESCRIPTION: 'Configure the banner for your profile.',
			COMMAND_BANNER_EXTENDED: builder.display('banner', {
				extendedHelp: `Banners are vertical in Skyra, they decorate your profile card.`,
				explainedUsage: [
					['list', '(Default) Lists all available banners.'],
					['reset', 'Set your displayed banner to default.'],
					['buy <bannerID>', 'Buy a banner, must be an ID.'],
					['set <bannerID>', 'Set your displayed banner, must be an ID.']
				],
				examples: ['list', 'buy 0w1p06', 'set 0w1p06', 'reset']
			}),

			COMMAND_AUTOROLE_DESCRIPTION: '(ADM) List or configure the autoroles for a guild.',
			COMMAND_AUTOROLE_EXTENDED: builder.display('autorole', {
				extendedHelp: `Autoroles? They are roles that are available for everyone, and automatically given when they reach an
					amount of (local) points, an administrator must configure them throught a setting command.`,
				explainedUsage: [
					['list', 'Lists all the current autoroles.'],
					['add <amount> <role>', 'Add a new autorole.'],
					['remove <role>', 'Remove an autorole from the list.'],
					['update <amount> <role>', 'Change the required amount of points for an existing autorole.']
				],
				reminder: `The current system grants a random amount of points between 4 and 8 points, for each post with a 1 minute cooldown.`,
				examples: ['list', 'add 20000 Trusted Member', 'update 15000 Trusted Member', 'remove Trusted Member']
			}),

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
				extendedHelp: `How much until next level?`,
				explainedUsage: [
					['user', '(Optional) The user\'s profile to show. Defaults to the message\'s author.']
				]
			}),
			COMMAND_DIVORCE_DESCRIPTION: 'Break up with your couple!',
			COMMAND_DIVORCE_EXTENDED: builder.display('divorce', {
				extendedHelp: `Sniff... This command is used to break up with your couple, hopefully in this virtual world, you are
					allowed to marry the user again.`
			}),
			COMMAND_MARRY_DESCRIPTION: 'Marry somebody!',
			COMMAND_MARRY_EXTENDED: builder.display('marry', {
				extendedHelp: `Marry with your waifu!`,
				explainedUsage: [
					['user', '(Optional) The user to marry with. If not given, the command will tell you who are you married with.']
				],
				examples: ['', '@love']
			}),
			COMMAND_MYLEVEL_DESCRIPTION: 'Check your local level.',
			COMMAND_MYLEVEL_EXTENDED: builder.display('mylevel', {
				extendedHelp: `How much until next auto role? How many points do I have in this guild?`,
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
					'200 @kyra'
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
					'me in 6h to fix this command.',
					'list',
					'delete jedbcuywb'
				]
			}),
			COMMAND_REPUTATION_DESCRIPTION: 'Give somebody a reputation point.',
			COMMAND_REPUTATION_EXTENDED: builder.display('reputation', {
				extendedHelp: `This guy is so helpful... I'll give him a reputation point! Additionally, you can check how many
					reputation points a user has by writing 'check' before the mention.`,
				explainedUsage: [
					['check', '(Optional) Whether you want to check somebody (or yours) amount of reputation.'],
					['user', 'The user to give a reputation point.']
				],
				reminder: 'You can give a reputation point once every 24 hours.',
				examples: ['check @kyra', 'check', '@kyra', 'check "User With Spaces"', '"User With Spaces"']
			}),
			COMMAND_SETCOLOR_DESCRIPTION: 'Change your user profile\'s color.',
			COMMAND_SETCOLOR_EXTENDED: builder.display('setColor', {
				extendedHelp: `The setColor command sets a color for your profile.`,
				explainedUsage: [
					['color', 'A color resolvable.']
				],
				possibleFormats: [
					['HEX', '#dfdfdf'],
					['RGB', 'rgb(200, 200, 200)'],
					['HSL', 'hsl(350, 100, 100)'],
					['B10', '14671839']
				]
			}),
			COMMAND_SLOTMACHINE_DESCRIPTION: `I bet 100${SHINY} you ain't winning this round.`,
			COMMAND_SLOTMACHINE_EXTENDED: builder.display('slotmachine', {
				extendedHelp: `A slot machine (American English), known variously as a fruit machine (British English), puggy
					(Scottish English),[1] the slots (Canadian and American English), poker machine/pokies (Australian English and
					New Zealand English), or simply slot (American English), is a casino gambling machine with three or more
					reels which spin when a button is pushed.`,
				explainedUsage: [
					['Amount', 'Either 50, 100, 200, 500, or even, 1000 shinies to bet.']
				],
				reminder: 'You will receive at least 5 times the amount (cherries/tada) at win, and up to 24 times (seven, diamond without skin).'
			}),

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
					If the output is too large, it'll send the output as a file, or in the console if the bot does not have the **${PERMS.ATTACH_FILES}** permission.`,
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
			COMMAND_STATS_EXTENDED: builder.display('stats', {
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

			COMMAND_AVATAR_DESCRIPTION: `View somebody's avatar in full size.`,
			COMMAND_AVATAR_EXTENDED: builder.display('avatar', {
				extendedHelp: `As this command's name says, it shows somebody's avatar.`,
				explainedUsage: [
					['user', `(Optional) A user mention. Defaults to the author if the input is invalid or not given.`]
				]
			}),
			COMMAND_COLOR_DESCRIPTION: 'Display some awesome colours.',
			COMMAND_COLOR_EXTENDED: builder.display('color', {
				extendedHelp: `The color command displays a set of colours with nearest tones given a difference between 1 and 255..`,
				explainedUsage: [
					['color', 'A color resolvable.']
				],
				possibleFormats: [
					['HEX', '#dfdfdf'],
					['RGB', 'rgb(200, 200, 200)'],
					['HSL', 'hsl(350, 100, 100)'],
					['B10', '14671839']
				],
				examples: ['#dfdfdf >25', 'rgb(200, 130, 75)']
			}),
			COMMAND_CONTENT_DESCRIPTION: 'Get messages\' raw content.',
			COMMAND_CONTENT_EXTENDED: builder.display('content', {}),
			COMMAND_DEFINE_DESCRIPTION: 'Check the definition of a word.',
			COMMAND_DEFINE_EXTENDED: builder.display('define', {
				extendedHelp: `What does "heel" mean?`,
				explainedUsage: [
					['Word', 'The word or phrase you want to get the definition from.']
				],
				examples: ['heel']
			}),
			COMMAND_EMOJI_DESCRIPTION: 'Get info from an emoji.',
			COMMAND_EMOJI_EXTENDED: builder.display('emoji', {}),
			COMMAND_GOOGL_DESCRIPTION: 'Short your links with this tool.',
			COMMAND_GOOGL_EXTENDED: builder.display('googl', {
				extendedHelp: `Shorten your urls with Googl!`,
				explainedUsage: [
					['URL', 'The URL to shorten or expand.']
				],
				examples: ['https://github.com/', 'https://goo.gl/un5E']
			}),
			COMMAND_POLL_DESCRIPTION: 'Manage polls.',
			COMMAND_POLL_EXTENDED: builder.display('poll', {
				extendedHelp: `The poll command creates a poll and tracks any vote, whilst also offering filters and unique
					votes (users can't vote twice nor two different options). You can customize the available options for the
					user and it features role and user whitelist. At the end of the poll, Skyra will DM you the results with a
					chart, make sure to have your DMs opened! After the vote concludes (they require time), you can retrieve the
					results for 24 hours before it gets unaccesible.`,
				examples: [
					'create Should I create the #anime channel? --options="yes,no,definitely"',
					'list',
					'vote jfutdsxsb yes',
					'result jfutdsxsb',
					'remove jfutdsxsb'
				],
				reminder: 'Skyra will prompt you for user and role whitelist, you can omit it by including `--no-prompt` in your message or specify them with `--users="id1,id2..." and --roles="id1,id2..."`. If you want something simpler, use the `spoll` command.'
			}),
			COMMAND_PRICE_DESCRIPTION: 'Convert the currency with this tool.',
			COMMAND_PRICE_EXTENDED: builder.display('price', {}),
			COMMAND_QUOTE_DESCRIPTION: 'Quote another people\'s message.',
			COMMAND_QUOTE_EXTENDED: builder.display('quote', {}),
			COMMAND_ROLES_DESCRIPTION: 'List all public roles from a guild, or claim/unclaim them.',
			COMMAND_ROLES_EXTENDED: builder.display('roles', {
				extendedHelp: `Public roles? They are roles that are available for everyone, an administrator must configure
					them throught a configuration command.`,
				explainedUsage: [
					['Roles', 'The list of roles to claim and unclaim. Leave this empty to get a list of roles']
				],
				reminder: [
					'When using claim/unclaim, the roles can be individual, or multiple.',
					'To claim multiple roles, you must separate them by a comma.',
					'You can specify which roles by writting their ID, name, or a section of the name.'
				].join('\n'),
				examples: ['', 'Designer, Programmer', 'Designer']
			}),
			COMMAND_SEARCH_DESCRIPTION: 'Search things from the Internet with DuckDuckGo.',
			COMMAND_SEARCH_EXTENDED: builder.display('search', {}),
			COMMAND_SPOLL_DESCRIPTION: 'Simplified reaction-based poll.',
			COMMAND_SPOLL_EXTENDED: builder.display('spoll', {
				extendedHelp: `spoll stands for "simplified poll". You may want to use this command if you don't want to deal the
					complexity of the other command. Simplified Polls do not track the users who vote nor it filters, it merely reacts
					to your message with three emojis and let the users vote.`,
				examples: ['Should I implement the #anime channel?']
			}),
			COMMAND_URBAN_DESCRIPTION: 'Check the definition of a word on UrbanDictionary.',
			COMMAND_URBAN_EXTENDED: builder.display('urban', {
				extendedHelp: `What does "spam" mean?`,
				explainedUsage: [
					['Word', 'The word or phrase you want to get the definition from.'],
					['Page', 'Defaults to 1, the page you wish to read.']
				],
				examples: ['spam']
			}),
			COMMAND_WHOIS_DESCRIPTION: 'Who are you?',
			COMMAND_WHOIS_EXTENDED: builder.display('whois', {}),
			COMMAND_WIKIPEDIA_DESCRIPTION: 'Search something throught Wikipedia.',
			COMMAND_WIKIPEDIA_EXTENDED: builder.display('wikipedia', {}),
			COMMAND_YOUTUBE_DESCRIPTION: 'Search something throught YouTube.',
			COMMAND_YOUTUBE_EXTENDED: builder.display('youtube', {}),

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
			 * #############
			 * WEEB COMMANDS
			 */

			COMMAND_WBLUSH_DESCRIPTION: 'Blush with a weeb picture!',
			COMMAND_WBLUSH_EXTENDED: builder.display('wblush', {
				extendedHelp: `Blush with a random weeb image!`
			}),
			COMMAND_WCRY_DESCRIPTION: 'Cry to somebody with a weeb picture!',
			COMMAND_WCRY_EXTENDED: builder.display('wcry', {
				extendedHelp: `Cry with a random weeb image!`,
				explainedUsage: [
					['user', 'The user to cry to.']
				],
				examples: ['@Skyra']
			}),
			COMMAND_WCUDDLE_DESCRIPTION: 'Cuddle somebody with a weeb picture!',
			COMMAND_WCUDDLE_EXTENDED: builder.display('wcuddle', {
				extendedHelp: `Unlike the original cuddle command, this one displays random weeb images, enjoy!`,
				explainedUsage: [
					['user', 'The user to cuddle with.']
				],
				examples: ['@Skyra']
			}),
			COMMAND_WDANCE_DESCRIPTION: 'Dance with a weeb picture!',
			COMMAND_WDANCE_EXTENDED: builder.display('wdance', {
				extendedHelp: `Dance with a random weeb image!`
			}),
			COMMAND_WHUG_DESCRIPTION: 'Hug somebody with a weeb picture!',
			COMMAND_WHUG_EXTENDED: builder.display('whug', {
				extendedHelp: `Unlike the original hug command, this one displays random weeb images, enjoy!`,
				explainedUsage: [
					['user', 'The user to give the hug.']
				],
				examples: ['@Skyra']
			}),
			COMMAND_WKISS_DESCRIPTION: 'Kiss somebody with a weeb picture!',
			COMMAND_WKISS_EXTENDED: builder.display('wkiss', {
				extendedHelp: `Kiss somebody with a random weeb image!`,
				explainedUsage: [
					['user', 'The user to give the kiss.']
				],
				examples: ['@Skyra']
			}),
			COMMAND_WLICK_DESCRIPTION: 'Lick somebody with a weeb picture!',
			COMMAND_WLICK_EXTENDED: builder.display('wlick', {
				extendedHelp: `Lick somebody with a random weeb image!`,
				explainedUsage: [
					['user', 'The user to lick.']
				],
				examples: ['@Skyra']
			}),
			COMMAND_WNOM_DESCRIPTION: 'Nom nom with a 🍞!',
			COMMAND_WNOM_EXTENDED: builder.display('wnom', {
				extendedHelp: `Nom nom nom! Wha~... I'm busy eating!`
			}),
			COMMAND_WNEKO_DESCRIPTION: 'Human kittens!',
			COMMAND_WNEKO_EXTENDED: builder.display('wneko', {
				extendedHelp: `Unlike the original kitten command, this one displays random weeb images, the difference is that
					they're weebs... and humans, enjoy!`
			}),
			COMMAND_WPAT_DESCRIPTION: 'Pats somebody\'s head!',
			COMMAND_WPAT_EXTENDED: builder.display('wpat', {
				extendedHelp: `Pat somebody's head with a random weeb image!`,
				explainedUsage: [
					['user', 'The user to pat with.']
				],
				examples: ['@Skyra']
			}),
			COMMAND_WPOUT_DESCRIPTION: 'I feel somebody... mad',
			COMMAND_WPOUT_EXTENDED: builder.display('wpout', {
				extendedHelp: `Show your expression with a random weeb image!`
			}),
			COMMAND_WSLAP_DESCRIPTION: 'Slap somebody with a weeb picture!',
			COMMAND_WSLAP_EXTENDED: builder.display('wslap', {
				extendedHelp: `Unlike the original slap command, this one displays random weeb images, enjoy!`,
				explainedUsage: [
					['user', 'The user to slap.']
				],
				examples: ['@Pete']
			}),
			COMMAND_WSMUG_DESCRIPTION: 'Smug',
			COMMAND_WSMUG_EXTENDED: builder.display('wsmug', {
				extendedHelp: `Just an anime smug face!`
			}),
			COMMAND_WSTARE_DESCRIPTION: '*Stares*',
			COMMAND_WSTARE_EXTENDED: builder.display('wstare', {
				extendedHelp: `*Still stares at you*`,
				explainedUsage: [
					['user', 'The user to stare at.']
				],
				examples: ['@Pete']
			}),
			COMMAND_WTICKLE_DESCRIPTION: 'Give tickles to somebody with a weeb picture!',
			COMMAND_WTICKLE_EXTENDED: builder.display('wtickle', {
				extendedHelp: `Tickle somebody!`,
				explainedUsage: [
					['user', 'The user to tickle.']
				],
				examples: ['@Skyra']
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
			COMMAND_ANIME_QUERY_FAIL: 'I am sorry, but the application could not resolve your request. Are you sure you wrote the name correctly?',
			COMMAND_ANIME_INVALID_CHOICE: `That's an invalid choice! Please try with another option.`,
			COMMAND_ANIME_NO_CHOICE: 'You got me waiting... try again when you are decided!',
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

			COMMAND_SUBSCRIBE_NO_ROLE: 'This server does not have a configured announcement role.',
			COMMAND_SUBSCRIBE_SUCCESS: (role) => `Successfully granted the role: **${role}**`,
			COMMAND_UNSUBSCRIBE_SUCCESS: (role) => `Successfully removed the role: **${role}***`,
			COMMAND_SUBSCRIBE_NO_CHANNEL: 'This server does not have a configured announcement channel.',
			COMMAND_ANNOUNCEMENT: (role) => `**New announcement for** ${role}:`,
			COMMAND_ANNOUNCEMENT_SUCCESS: 'Successfully posted a new announcement.',
			COMMAND_ANNOUNCEMENT_CANCELLED: 'Cancelled the message.',
			COMMAND_ANNOUNCEMENT_PROMPT: 'This will be the message sent in the announcement channel. Are you OK with this?',

			/**
			 * ################
			 * GENERAL COMMANDS
			 */

			COMMAND_INVITE: (client) => [
				`To add Skyra to your discord guild: <${client.invite}>`,
				'Don\'t be afraid to uncheck some permissions, Skyra will let you know if you\'re trying to run a command without permissions.'
			].join('\n'),
			COMMAND_INFO: [
				'Skyra 3.0.0 (codename **Royal**) is a multi-purpose Discord Bot designed to run the majority of tasks with a great performance and constant 24/7 uptime.',
				"She is built on top of Klasa, a 'plug-and-play' framework built on top of the Discord.js library.",
				'',
				'Skyra features:',
				'• Advanced Moderation with temporary actions included',
				'• Announcement management',
				'• Fully configurable',
				'• Message logs, member logs, and mod logs',
				'• Multilingual',
				'• Profiles and levels, with leaderboards and social management',
				'• Role management',
				'• Weeb commands (+10)!',
				'And more!'
			].join('\n'),
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
			COMMAND_DICE_ROLLS_ERROR: 'Amount of rolls must be a number between 1 and 1024.',
			COMMAND_DICE_SIDES_ERROR: 'Amount of sides must be a number between 4 and 1024.',
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
			 * ##############
			 * GAMES COMMANDS
			 */

			COMMAND_GAMES_SKYRA: 'I am sorry, I know you want to play with me, but if I do, I will not be able to help other people! 💔',
			COMMAND_GAMES_BOT: 'I am sorry, but I do not think they would like to stop doing what they are doing and play with humans.',
			COMMAND_GAMES_SELF: 'You must be so sad to play against yourself. Try again with another user.',
			COMMAND_GAMES_PROGRESS: 'I am sorry, but there is a game in progress in this channel, try again when it finishes.',
			COMMAND_GAMES_PROMPT_TIMEOUT: 'I am sorry, but the challengee did not reply on time.',
			COMMAND_GAMES_PROMPT_DENY: 'I am sorry, but the challengee refused to play.',
			COMMAND_GAMES_TIMEOUT: '**The match concluded in a draw due to lack of a response (60 seconds)**',
			COMMAND_C4_PROMPT: (challenger, challengee) => `Dear ${challengee}, you have been challenged by ${challenger} in a Connect-Four match. Reply with **yes** to accept!`,
			COMMAND_C4_START: (player, table) => `Let's play! Turn for: **${player}**.\n${table}`,
			COMMAND_C4_GAME_COLUMN_FULL: 'This column is full. Please try another. ',
			COMMAND_C4_GAME_WIN: (user, turn, table) => `${user} (${turn === 0 ? 'blue' : 'red'}) won!\n${table}`,
			COMMAND_C4_GAME_DRAW: (table) => `This match concluded in a **draw**!\n${table}`,
			COMMAND_C4_GAME_NEXT: (player, turn, table) => `Turn for: ${player} (${turn === 0 ? 'blue' : 'red'}).\n${table}`,
			COMMAND_TICTACTOE_PROMPT: (challenger, challengee) => `Dear ${challengee}, you have been challenged by ${challenger} in a Tic-Tac-Toe match. Reply with **yes** to accept!`,
			COMMAND_TICTACTOE_TURN: (icon, player, board) => `(${icon}) Turn for ${player}!\n${board}`,
			COMMAND_TICTACTOE_WINNER: (winner, board) => `Winner is... ${winner}!\n${board}`,
			COMMAND_TICTACTOE_DRAW: (board) => `This match concluded in a **draw**!\n${board}`,

			/**
			 * #################
			 * GIVEAWAY COMMANDS
			 */

			GIVEAWAY_TIME: 'A giveaway must last at least 1 minute.',
			GIVEAWAY_ENDS_AT: 'Ends at:',
			GIVEAWAY_DURATION: (time) => `This giveaway ends in **${duration(time)}**! React to this message with 🎉 to join.`,
			GIVEAWAY_TITLE: '🎉 **GIVEAWAY** 🎉',
			GIVEAWAY_START_DIRECT_MESSAGE: (title, id) => [
				`Hello! I will keep you updated! Once your giveaway (**${title}** | ID \`${id}\`) finishes, I will send you the winner here followed with a list of other 10 possible winners.`,
				`The ability to cancel or stop giveaways is a feature coming soon!`
			].join('\n'),
			GIVEAWAY_LASTCHANCE: (time) => `**LAST CHANCE**! Remaining time: **${duration(time)}**. React to this message with 🎉 to join.`,
			GIVEAWAY_LASTCHANCE_TITLE: '🎉 **LAST CHANCE GIVEAWAY** 🎉',
			GIVEAWAY_ENDED: (winner) => `Winner: ${winner} (${winner.id})`,
			GIVEWAWY_ENDED_NO_WINNER: 'No winner...',
			GIVEAWAY_ENDED_AT: 'Ended at:',
			GIVEAWAY_ENDED_TITLE: '🎉 **GIVEAWAY ENDED** 🎉',
			GIVEAWAY_ENDED_MESSAGE: (mention, title) => `Congratulations ${mention}! You won the giveaway **${title}**`,
			GIVEAWAY_ENDED_DIRECT_MESSAGE: (title, id, winner, amount, list) => [
				`Hello! The giveaway you started (**${title}** | ID \`${id}\`) just finished! Winner is ${winner.tag} (${winner.id})`,
				`However, I have also calculated another ${amount} possible winners:${list}`
			].join('\n'),
			GIVEAWAY_ENDED_DIRECT_MESSAGE_ONLY_WINNER: (title, id, winner) => `Hello! The giveaway you started (**${title}** | ID \`${id}\`) just finished! Winner is ${winner.tag} (${winner.id})`,
			GIVEAWAY_ENDED_DIRECT_MESSAGE_NO_WINNER: (title, id) => `Hello! The giveaway you started (**${title}** | ID \`${id}\`) just finished! But there's no winner!`,

			/**
			 * ###################
			 * MANAGEMENT COMMANDS
			 */

			COMMAND_NICK_SET: (nickname) => `Changed the nickname to **${nickname}**.`,
			COMMAND_NICK_CLEARED: 'Nickname cleared.',
			COMMAND_TRIGGERS_NOTYPE: 'You need to insert a trigger type (**alias**|**reaction**)',
			COMMAND_TRIGGERS_NOOUTPUT: 'You need to insert the trigger output.',
			COMMAND_TRIGGERS_INVALIDREACTION: 'This reaction does not seem valid for me, either it is not valid unicode or I do not have access to it.',
			COMMAND_TRIGGERS_INVALIDALIAS: 'There is no command like this.',
			COMMAND_TRIGGERS_REMOVE_NOTTAKEN: 'There is no trigger with this input.',
			COMMAND_TRIGGERS_REMOVE: 'Successfully removed this trigger.',
			COMMAND_TRIGGERS_ADD_TAKEN: 'There is already a trigger with this input.',
			COMMAND_TRIGGERS_ADD: 'Successfully added the trigger.',
			COMMAND_TRIGGERS_LIST_EMPTY: 'The trigger list for this guild is empty.',
			COMMAND_SERVERINFO_TITLES: {
				CHANNELS: 'Channels',
				MEMBERS: 'Members',
				OTHER: 'Other'
			},
			COMMAND_SERVERINFO_ROLES: (roles) => `**Roles**\n\n${roles}`,
			COMMAND_SERVERINFO_NOROLES: 'Roles? Where? There is no other than the `@everyone` role!',
			COMMAND_SERVERINFO_CHANNELS: (text, voice, categories, afkChannel, afkTime) => [
				`• **${text}** Text, **${voice}** Voice, **${categories}** categories.`,
				`• AFK: ${afkChannel ? `**<#${afkChannel}>** after **${afkTime / 60}**min` : '**None**.'}`
			].join('\n'),
			COMMAND_SERVERINFO_MEMBERS: (count, owner) => [
				`• **${count}** members`,
				`• Owner: **${owner.tag}**`,
				`  (ID: **${owner.id}**)`
			].join('\n'),
			COMMAND_SERVERINFO_OTHER: (size, region, createdAt, verificationLevel) => [
				`• Roles: **${size}**`,
				`• Region: **${region}**`,
				`• Created at: **${timestamp.displayUTC(createdAt)}** (UTC - YYYY/MM/DD)`,
				`• Verification Level: **${this.HUMAN_LEVELS[verificationLevel]}**`
			].join('\n'),
			COMMAND_ROLEINFO_TITLES: { PERMISSIONS: 'Permissions' },
			COMMAND_ROLEINFO: (role) => [
				`ID: **${role.id}**`,
				`Name: **${role.name}**`,
				`Color: **${role.hexColor}**`,
				`Hoisted: **${role.hoist ? 'Yes' : 'No'}**`,
				`Position: **${role.rawPosition}**`,
				`Mentionable: **${role.mentionable ? 'Yes' : 'No'}**`
			].join('\n'),
			COMMAND_ROLEINFO_ALL: 'All Permissions granted.',
			COMMAND_ROLEINFO_PERMISSIONS: (permissions) => permissions.length > 0 ? permissions.map(key => `+ **${PERMS[key]}**`) : 'Permissions not granted.',
			COMMAND_FILTER_UNDEFINED_WORD: 'You must write what do you want me to filter.',
			COMMAND_FILTER_FILTERED: (filtered) => `This word is ${filtered ? 'already' : 'not'} filtered.`,
			COMMAND_FILTER_ADDED: (word) => `| ✅ | Success! Added the word ${word} to the filter.`,
			COMMAND_FILTER_REMOVED: (word) => `| ✅ | Success! Removed the word ${word} from the filter.`,
			COMMAND_FILTER_RESET: '| ✅ | Success! The filter has been reset.',
			COMMAND_FILTER_SHOW_EMPTY: 'The list of filtered words is empty!',
			COMMAND_FILTER_SHOW: (words) => `There is the list of all filtered words: ${words}`,
			COMMAND_SETFILTERMODE_EQUALS: 'The word filter mode did not change, it was already set up with that mode.',
			COMMAND_SETFILTERMODE_DISABLED: 'The word filter is now disabled. No messages will be deleted nor logged.',
			COMMAND_SETFILTERMODE_DELETEONLY: 'The word filter is now in **DeleteOnly** mode. Messages will be deleted but not logged.',
			COMMAND_SETFILTERMODE_LOGONLY: 'The word filter is now in **LogOnly** mode. Messages will not be deleted but logged to your modlogs channel.',
			COMMAND_SETFILTERMODE_ALL: 'The word filter is now in **All** mode. Messages will be both deleted and logged to your modlogs channel.',

			/**
			 * #################################
			 * MANAGEMENT/CONFIGURATION COMMANDS
			 */

			COMMAND_MANAGEROLEREACTION_REQUIRED_REACTION: 'You must input a valid reaction that can be used by me.',
			COMMAND_MANAGEROLEREACTION_LIST_EMPTY: 'This guild has no role reaction set up.',
			COMMAND_MANAGEROLEREACTION_EXISTS: 'There is already a role reaction set up with the specified role or emoji.',
			COMMAND_MANAGEROLEREACTION_ADD: 'Successfully added the role reaction.',
			COMMAND_MANAGEROLEREACTION_REMOVE_NOTEXISTS: 'I do not find an entry with this reaction. Are you sure you have typed it correctly?',
			COMMAND_MANAGEROLEREACTION_REMOVE: 'Successfully removed the role reaction.',
			COMMAND_MANAGEROLEREACTION_RESET: 'Successfully removed all role reactions.',
			COMMAND_SETMESSAGEROLE_CHANNELNOTSET: 'In order to configure the message role, you must configure the channel first.',
			COMMAND_SETMESSAGEROLE_WRONGCHANNEL: (channel) => `In order to reduce confusion, I would suggest you to move to ${channel}`,
			COMMAND_SETMESSAGEROLE_SET: 'Successfully set the message role.',
			COMMAND_SETROLECHANNEL_SET: (channel) => `Successfully set the role channel to ${channel}.`,
			CONFIGURATION_TEXTCHANNEL_REQUIRED: 'The selected channel is not a valid text channel, try again with another.',
			CONFIGURATION_EQUALS: 'Successfully configured: no changes were made.',
			COMMAND_SETIGNORECHANNELS_SET: (channel) => `Ignoring all command input from ${channel} now.`,
			COMMAND_SETIGNORECHANNELS_REMOVED: (channel) => `Listening all command input from ${channel} now.`,
			COMMAND_SETMEMBERLOGS_SET: (channel) => `Successfully set the member logs channel to ${channel}.`,
			COMMAND_SETMESSAGELOGS_SET: (channel) => `Successfully set the message logs channel to ${channel}.`,
			COMMAND_SETMODLOGS_SET: (channel) => `Successfully set the mod logs channel to ${channel}.`,
			COMMAND_SETPREFIX_SET: (prefix) => `Successfully set the prefix to ${prefix}. Use ${prefix}setPrefix <prefix> to change it again.`,

			/**
			 * #############
			 * MISC COMMANDS
			 */

			COMMAND_UPVOTE_MESSAGE: 'Here is the link: **<https://discordbots.org/bot/266624760782258186>**! Some perks for upvoters are coming very soon! Remember, you can vote every 24 hours.',
			COMMAND_VAPORWAVE_OUTPUT: (string) => `Here is your converted message:\n${string}`,

			/**
			 * ##############################
			 * MODERATION/MANAGEMENT COMMANDS
			 */

			COMMAND_WARNINGS_EMPTY: 'Nobody has behaved badly yet, who will be the first user to be listed here?',
			COMMAND_WARNINGS_AMOUNT: (amount) => `There are ${amount === 1 ? 'warning' : 'warnings'}.`,

			/**
			 * #############################
			 * MODERATION/UTILITIES COMMANDS
			 */

			COMMAND_PERMISSIONS: (username, id) => `Permissions for ${username} (${id})`,
			COMMAND_PERMISSIONS_ALL: 'All Permissions',
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
			COMMAND_MUTE_LOWLEVEL: 'I am sorry, there is no Mute role configured. Please ask an Administrator or the Guild Owner to set it up.',
			COMMAND_MUTE_CONFIGURE_CANCELLED: 'Prompt aborted, the Mute role creation has been cancelled.',
			COMMAND_MUTE_CONFIGURE: 'Do you want me to create and configure the Mute role now?',
			COMMAND_MUTE_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **MUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_MUTE_MUTED: 'The target user is already muted.',
			COMMAND_MUTE_USER_NOT_MUTED: 'This user is not muted.',
			COMMAND_MUTE_UNCONFIGURED: 'This guild does not have a **Muted** role. Aborting command execution.',
			COMMAND_MUTECREATE_MISSING_PERMISSION: `I need the permissions **${PERMS.MANAGE_ROLES}** to create the role and **${PERMS.MANAGE_CHANNELS}** to edit the channels permissions.`,
			COMMAND_PRUNE: (amount, total) => `Successfully deleted ${amount} messages from ${total}.`,
			COMMAND_REASON_NOT_EXISTS: 'The selected modlog does not seem to exist.',
			COMMAND_SOFTBAN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **SOFTBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_UNBAN_MESSAGE: (user, reason, log, banReason) => `|\`🔨\`| [Case::${log}] **UNBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}${banReason ? `\nReason for Ban: ${banReason}` : ''}`,
			COMMAND_UNBAN_MISSING_PERMISSION: `I will need the **${PERMS.BAN_MEMBERS}** permission to be able to unban.`,
			COMMAND_UNMUTE_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **UNMUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_UNMUTE_MISSING_PERMISSION: `I will need the **${PERMS.MANAGE_ROLES}** permission to be able to unmute.`,
			COMMAND_UNWARN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **APPEALED WARN**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_VMUTE_MISSING_PERMISSION: `I will need the **${PERMS.MUTE_MEMBERS}** permission to be able to voice unmute.`,
			COMMAND_VMUTE_USER_NOT_MUTED: 'This user is not voice muted.',
			COMMAND_VOICEKICK_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **VOICE KICKED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_WARN_DM: (moderator, guild, reason) => `You have been warned by ${moderator} in ${guild} for the reason: ${reason}`,
			COMMAND_WARN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **WARNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,

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
			COMMAND_BANNER_MISSING: 'You must specify a banner id to buy.',
			COMMAND_BANNER_NOTEXISTS: (prefix) => `This banner id does not exist. Please check \`${prefix}banner list\` for a list of banners you can buy.`,
			COMMAND_BANNER_USERLIST_EMPTY: (prefix) => `You did not buy a banner yet. Check \`${prefix}banner list\` for a list of banners you can buy.`,
			COMMAND_BANNER_RESET_DEFAULT: 'You are already using the default banner.',
			COMMAND_BANNER_RESET: 'Your banner has been reset to the default.',
			COMMAND_BANNER_SET_NOT_BOUGHT: 'You did not buy this banner yet.',
			COMMAND_BANNER_SET: (banner) => `|\`✅\`| **Success**. You have set your banner to: __${banner}__`,
			COMMAND_BANNER_BOUGHT: (prefix, banner) => `You already have this banner, you may want to use \`${prefix}banner set ${banner}\` to make it visible in your profile.`,
			COMMAND_BANNER_MONEY: (money, cost) => `You do not have enough money to buy this banner. You have ${money}${SHINY}, the banner costs ${cost}${SHINY}`,
			COMMAND_BANNER_PAYMENT_CANCELLED: '|`❌`| The payment has been cancelled.',
			COMMAND_BANNER_BUY: (banner) => `|\`✅\`| **Success**. You have bought the banner: __${banner}__`,
			COMMAND_BANNER_PROMPT: 'Reply to this message choosing an option:\n`all` to check a list of all available banners.\n`user` to check a list of all bought banners.',
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
			COMMAND_DIVORCE_NOTTAKEN: 'Who would you divorce with? You are not even taken!',
			COMMAND_DIVORCE_PROMPT: 'Ooh... that sounds quite bad 💔... are you 100% sure about this?',
			COMMAND_DIVORCE_CANCEL: 'Oh lord. I am very glad you continue with your couple!',
			COMMAND_DIVORCE_DM: user => `Pardon... but... do you remember ${user}? He decided to break up with you 💔!`,
			COMMAND_DIVORCE_SUCCESS: user => `Successful divorce 💔... You are not longer married with ${user}!`,
			COMMAND_MARRY_WITH: user => `Dear, how could you forget it... You are currently married with ${user}!`,
			COMMAND_MARRY_NOTTAKEN: 'Uh... I am sorry, but I am not aware of you being married... have you tried proposing to somebody?',
			COMMAND_MARRY_SKYRA: 'I am sorry, I know you love me, but I am already taken by a brave man I love 💞!',
			COMMAND_MARRY_SNEYRA: 'In your dreams. She is my sister, I am not letting somebody harm her!',
			COMMAND_MARRY_BOTS: 'Oh no! You should not be marrying bots! They still do not understand what true love is, and they are not warm!',
			COMMAND_MARRY_SELF: 'No! This is not how this works! You cannot marry yourself, who would you spend your life with? 💔',
			COMMAND_MARRY_AUTHOR_TAKEN: 'I am sorry, but you are already married...',
			COMMAND_MARRY_TAKEN: 'I am very sorry, but this user is taken!',
			COMMAND_MARRY_PETITION: (author, user) => `Fresh pair of eyes! ${author} is proposing to ${user}! 💞 Reply with **yes** to accept!`,
			COMMAND_MARRY_NOREPLY: 'The user did not reply on time... Maybe it was such a hard decision?',
			COMMAND_MARRY_DENIED: 'Ooh. The user rejected your petition! 💔',
			COMMAND_MARRY_ACCEPTED: (author, user) => `Congratulations dear ${author}! You're now officially married with ${user}! ❤`,
			COMMAND_MYLEVEL: (points, next, user) => `${user ? `The user ${user} has` : 'You have'} a total of ${points} points.${next}`,
			COMMAND_MYLEVEL_NEXT: (remaining, next) => `Points for next rank: **${remaining}** (at ${next} points).`,
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
			COMMAND_REMINDME_SHORT_TIME: 'You did not give me a duration of at least one minute long. Cancelling prompt.',
			COMMAND_REMINDME_CREATE: (id) => `A reminder with ID \`${id}\` has been created.`,
			COMMAND_REMINDME_DELETE_PARAMS: ['delete', 'remove'],
			COMMAND_REMINDME_DELETE_INVALID_PARAMETERS: 'To delete a previously created reminder, you must type either \'delete\' or \'remove\' followed by the ID.',
			COMMAND_REMINDME_DELETE: task => `The reminder with ID \`${task.id}\` and with a remaining time of **${duration(task.time - Date.now())}** has been successfully deleted.`,
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
			COMMAND_REPUTATIONS_BOTS: 'Bots cannot have reputation points...',
			COMMAND_REPUTATIONS_SELF: (points) => `You have a total of ${points} reputation points.`,
			COMMAND_REPUTATIONS: (user, points) => `The user ${user} has a total of ${points === 1 ? 'one reputation point' : `${points} reputation points`}.`,
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

			COMMAND_FEEDBACK: 'Thanks you for your feedback ❤! I will make sure the developer team read this, you may get a response in DMs!',

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

			COMMAND_TAGS_NAME_REQUIRED: 'You must specify a tag name.',
			COMMAND_TAGS_ADD_EXISTS: (tag) => `The tag '${tag}' already exists.`,
			COMMAND_TAGS_CONTENT_REQUIRED: 'You must provide a content for this tag.',
			COMMAND_TAGS_ADD_ADDED: (name, content) => `Successfully added a new tag: **${name}** with a content of **${content}**.`,
			COMMAND_TAGS_REMOVE_NOT_EXISTS: (tag) => `The tag '${tag}' does not exist.`,
			COMMAND_TAGS_REMOVE_REMOVED: (name) => `Successfully removed the tag **${name}**.`,
			COMMAND_TAGS_EDITED: (name, content, old) => `Successfully edited the tag **${name}** which had a content of **${old}** to **${content}**.`,
			COMMAND_TAGS_LIST_EMPTY: 'The tag list for this server is empty.',

			/**
			 * ##############
			 * TOOLS COMMANDS
			 */

			COMMAND_AVATAR_NONE: 'The user does not have an avatar set.',
			COMMAND_COLOR: (hex, rgb, hsl) => [
				`HEX: **${hex}**`,
				`RGB: **${rgb}**`,
				`HSL: **${hsl}**`
			].join('\n'),
			COMMAND_DEFINE_NOTFOUND: 'I could not find a definition for this word.',
			COMMAND_DEFINE: (input, output) => `Search results for \`${input}\`:\n${output}`,
			COMMAND_EMOJI_CUSTOM: (emoji, id) => [
				`→ \`Emoji\` :: **${emoji}**`,
				'→ `Type` :: **Custom**',
				`→ \`ID\` :: **${id}**`
			].join('\n'),
			COMMAND_EMOJI_TWEMOJI: (emoji, id) => [
				`→ \`Emoji\` :: \`${emoji}\``,
				'→ `Type` :: **Twemoji**',
				`→ \`ID\` :: **${id}**`
			].join('\n'),
			COMMAND_EMOJI_INVALID: (emoji) => `'${emoji}' is not a valid emoji.`,
			COMMAND_GOOGL_LONG: (url) => `**Shortened URL: [${url}](${url})**`,
			COMMAND_GOOGL_SHORT: (url) => `**Expanded URL: [${url}](${url})**`,
			COMMAND_POLL_MISSING_TITLE: 'You must write a title.',
			COMMAND_POLL_TIME: 'When should the poll end? Duration and Date formats are allowed for this operation.',
			COMMAND_POLL_WANT_USERS: 'Do you want to include a users whitelist?',
			COMMAND_POLL_FIRSTUSER: 'Alright! Write a list of all users you want to whitelist from the poll separating their names or mentions by comma.',
			COMMAND_POLL_WANT_ROLES: 'Before creating the poll, do you want to whitelist roles?',
			COMMAND_POLL_FIRSTROLE: 'Alright! Write a list of all roles you want to whitelist from the poll separating their names or mentions by comma.',
			COMMAND_POLL_CREATE: (title, roles, users, options, time, id) => [
				`Successfully created a poll.`,
				`Title    : '${title}'`,
				`Roles    : ${roles ? roles.join(' | ') : 'None'}`,
				`Users    : ${users ? users.join(' | ') : 'None'}`,
				`Options  : ${options ? options.join(' | ') : 'None'}`,
				`Duration : ${duration(time)}`,
				`ID       : ${id}`
			],
			COMMAND_POLL_LIST_EMPTY: 'I could not find an active poll for this guild.',
			COMMAND_POLL_NOTEXISTS: 'The poll you want to retrieve either expired or does not exist.',
			COMMAND_POLL_NOTMANAGEABLE: 'This poll is protected and cannot be managed by anybody that is not the author nor a guild administrator.',
			COMMAND_POLL_REMOVE: 'Successfully removed the selected poll.',
			COMMAND_POLL_INVALID_OPTION: (options) => `Invalid option. Choose one of the following: ${options}.`,
			COMMAND_POLL_ALREADY_VOTED: 'You have already voted to this poll!',
			COMMAND_POLL_VOTE: 'Successfully voted! Selfdestructing this message in 10 seconds!',
			COMMAND_POLL_MISSING_ID: 'You need to provide me the poll\'s ID!',
			COMMAND_POLL_EMPTY_VOTES: 'Unfortunately, nobody has voted in this poll.',
			COMMAND_PRICE_CURRENCY: (from, to, amount) => `Current ${from} price is ${amount} ${to}`,
			COMMAND_PRICE_CURRENCY_NOT_FOUND: 'There was an error, please make sure you specified an appropriate coin and currency.',
			COMMAND_QUOTE_MESSAGE: 'It is very weird, but said message does not have a content nor a image.',
			COMMAND_ROLES_LIST_EMPTY: 'This server does not have a role listed as a public role.',
			COMMAND_ROLES_LIST_TITLE: 'List of public roles',
			COMMAND_ROLES_ADDED: (roles) => `The following roles have been added to your profile: \`${roles}\``,
			COMMAND_ROLES_REMOVED: (roles) => `The following roles have been removed from your profile: \`${roles}\``,
			COMMAND_ROLES_NOT_PUBLIC: (roles) => `The following roles are not public: \`${roles}\``,
			COMMAND_ROLES_NOT_MANAGEABLE: (roles) => `The following roles cannot be given by me due to their hierarchy role position: \`${roles}\``,
			COMMAND_ROLES_AUDITLOG: 'Authorized: Public Role Management | \'Roles\' Command.',
			COMMAND_DUCKDUCKGO_NOTFOUND: 'I am sorry, but DuckDuckGo API returned a blank response. Try with another keywords.',
			COMMAND_DUCKDUCKGO_LOOKALSO: 'Related to this topic:',

			COMMAND_URBAN_NOTFOUND: 'I am sorry, the word you are looking for does not seem to be defined in UrbanDictionary. Try another word?',
			COMMAND_URBAN_INDEX_NOTFOUND: 'You may want to try a lower page number.',
			SYSTEM_TEXT_TRUNCATED: (definition, url) => `${definition}... [continue reading](${url})`,
			COMMAND_URBAN_OUTPUT: (index, pages, definition, example, author) => [
				`→ \`Definition\` :: ${index}/${pages}\n${definition}`,
				`→ \`Example\` :: ${example}`,
				`→ \`Author\` :: ${author}`
			].join('\n\n'),
			COMMAND_WHOIS_MEMBER: (member) => [
				`→ \`ID         ::\` **${member.id}**`,
				`→ \`Tag        ::\` **${member.user.tag}**`,
				`→ \`Nickname   ::\` **${member.nickname || 'Not set'}**`,
				`→ \`Created At ::\` **${timestamp.displayUTC(member.user.createdAt)}**`,
				`→ \`Joined     ::\` **${timestamp.displayUTC(member.joinedAt)}**`
			].join('\n'),
			COMMAND_WHOIS_MEMBER_ROLES: '→ `Roles`',
			COMMAND_WHOIS_USER: (user) => [
				`→ \`ID         ::\` **${user.id}**`,
				`→ \`Tag        ::\` **${user.tag}**`,
				`→ \`Created At ::\` **${timestamp.displayUTC(user.createdAt)}**`
			].join('\n'),
			COMMAND_WIKIPEDIA_NOTFOUND: 'I am sorry, I could not find something that could match your input in Wikipedia.',
			COMMAND_YOUTUBE_NOTFOUND: 'I am sorry, I could not find something that could match your input in YouTube.',
			COMMAND_YOUTUBE_INDEX_NOTFOUND: 'You may want to try a lower page number. Because I am unable to find something at this index.',

			/**
			 * ################
			 * WEATHER COMMANDS
			 */

			COMMAND_WEATHER_ERROR_ZERO_RESULTS: 'Your request returned no results.',
			COMMAND_WEATHER_ERROR_REQUEST_DENIED: 'The GeoCode API Request was denied.',
			COMMAND_WEATHER_ERROR_INVALID_REQUEST: 'Invalid request.',
			COMMAND_WEATHER_ERROR_OVER_QUERY_LIMIT: 'Query Limit Exceeded. Try again tomorrow.',
			COMMAND_WEATHER_ERROR_UNKNOWN: 'Unknown error.',

			/**
			 * #############
			 * WEEB COMMANDS
			 */

			COMMAND_WBLUSH: 'You made them blush! 😊',
			COMMAND_WCRY: user => `Dear ${user}, did you make them cry? 💔`,
			COMMAND_WCUDDLE: user => `Here is a cuddle for you, ${user} 💞`,
			COMMAND_WDANCE: 'Dancing! 💃',
			COMMAND_WHUG: user => `Here is a nice hug for you, ${user} ❤`,
			COMMAND_WKISS: user => `Here is a kiss for you, ${user} 💜`,
			COMMAND_WLICK: user => `Licking ${user} 👅`,
			COMMAND_WNOM: `Nom, nom, nom! 😊`,
			COMMAND_WNEKO: `Nya! 🐱`,
			COMMAND_WPAT: user => `Gently pats ${user}'s head ❤`,
			COMMAND_WPOUT: `Uh?`,
			COMMAND_WSLAP: user => `Slapping ${user}!`,
			COMMAND_WSMUG: `There's a smug face!`,
			COMMAND_WSTARE: user => `Dear ${user}, somebody is staring at you 👀`,
			COMMAND_WTICKLE: user => `Tickles for you, ${user}!`,

			/**
			 * #################################
			 * #            MONITORS           #
			 * #################################
			 */

			CONST_MONITOR_INVITELINK: 'Invite link',
			CONST_MONITOR_NMS: '[NOMENTIONSPAM]',
			CONST_MONITOR_WORDFILTER: 'Filtered Word',
			MONITOR_NOINVITE: (user) => `|\`❌\`| Dear ${user}, invite links aren't allowed here.`,
			MONITOR_WORDFILTER: (user) => `|\`❌\`| Pardon, dear ${user}, you said something that is not allowed in this server.`,
			MONITOR_NMS_MESSAGE: (user) => [
				`The banhammer has landed and now the user ${user.tag} with id ${user.id} is banned for mention spam.`,
				"Do not worry! I'm here to help you! 😄"
			].join('\n'),
			MONITOR_NMS_MODLOG: (threshold, amount) => `[NOMENTIONSPAM] Threshold: ${threshold}. Reached: ${amount}`,
			MONITOR_SOCIAL_ACHIEVEMENT: 'Congratulations dear %MEMBER%, you achieved the role %ROLE%',

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

			POWEREDBY_WEEBSH: 'Powered by weeb.sh',
			PREFIX_REMINDER: (prefix) => `The prefix in this guild is set to: \`${prefix}\``,

			UNEXPECTED_ISSUE: 'An unexpected error popped up! Safely aborting this command...',

			COMMAND_DM_NOT_SENT: 'I cannot send you a message in DMs, did you block me?',
			COMMAND_DM_SENT: 'I have sent you the message in DMs.',
			COMMAND_ROLE_HIGHER_SKYRA: 'The selected member has higher or equal role position than me.',
			COMMAND_ROLE_HIGHER: 'The selected member has higher or equal role position than you.',
			COMMAND_SUCCESS: 'Successfully executed the command.',
			COMMAND_TOSKYRA: 'Eww... I thought you loved me! 💔',
			COMMAND_USERSELF: 'Why would you do that to yourself?',

			SYSTEM_FETCHING: '`Fetching...`',
			SYSTEM_FETCHING_USERS: 'Some users are playing hide-and-seek, please wait a moment until I find them all...',
			SYSTEM_PROCESSING: '`Processing...`',
			SYSTEM_HIGHEST_ROLE: 'This role\'s hierarchy position is higher or equal than me, I am not able to grant it to anyone.',
			SYSTEM_CHANNEL_NOT_POSTABLE: 'I am not allowed to send messages to this channel.',
			SYSTEM_FETCHBANS_FAIL: `Failed to fetch bans. Do I have the **${PERMS.BAN_MEMBERS}** permission?`,
			SYSTEM_LOADING: '`Loading... please wait.`',
			SYSTEM_ERROR: 'Something happened!',
			SYSTEM_MESSAGE_NOT_FOUND: 'I am sorry, but either you wrote the message ID incorrectly, or it got deleted.',
			SYSTEM_NOTENOUGH_PARAMETERS: `I am sorry, but you did not provide enough parameters...`,

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

			MODLOG_TIMED: 'This moderation log is not timed.',

			GUILD_WARN_NOT_FOUND: 'I failed to fetch the modlog for appealing. Either it does not exist, is not type of warning, or it is appealed.',
			GUILD_MEMBER_NOT_VOICECHANNEL: 'I cannot execute this action in a member that is not connected to a voice channel.',

			PROMPTLIST_MULTIPLE_CHOICE: (list, amount) => `There are ${amount} ${amount === 1 ? 'result' : 'results'}. Please choose a number between 1 and ${amount}, or write **abort** to abort the prompt.\n${list}`,
			PROMPTLIST_ATTEMPT_FAILED: (list, attempt, maxAttempts) => `Invalid input. Attempt **${attempt}** out of **${maxAttempts}**\n${list}`,
			PROMPTLIST_ABORT: 'abort',
			PROMPTLIST_ABORTED: 'Successfully aborted the prompt.',

			EVENTS_ERROR_WTF: 'What a Terrible Failure! I am very sorry!',
			EVENTS_ERROR_STRING: (mention, message) => `Dear ${mention}, ${message}`
		};
	}

	async init() { } // eslint-disable-line no-empty-function

};
