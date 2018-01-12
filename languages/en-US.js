const { Language } = require('klasa');
const { LanguageHelp } = require('../index');

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

module.exports = class extends Language {

	constructor(...args) {
		super(...args);

		this.language = {
			/**
			 * ################################
			 * #     COMMAND DESCRIPTIONS     #
			 * ################################
			 */

			/**
			 * ##############
			 * ANIME COMMANDS
			 */
			COMMAND_ANIME_ANIME_DESCRIPTION: 'Search your favourite anime by title with this command.',
			COMMAND_ANIME_ANIME_EXTENDED: builder.display('anime', {
				extendedHelp: `This command queries MyAnimeList to show data for the anime you request. In a near future, this command
					will allow you to navigate between the results so you can read the information of the anime.`,
				explainedUsage: [
					['query', `The anime's name you are looking for.`]
				],
				examples: ['One Piece']
			}),
			COMMAND_ANIME_MANGA_DESCRIPTION: 'Search your favourite manga by title with this command.',
			COMMAND_ANIME_MANGA_EXTENDED: builder.display('manga', {
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
			COMMAND_ANNOUNCEMENT_ANNOUNCEMENT_DESCRIPTION: 'Send new announcements, mentioning the announcement role.',
			COMMAND_ANNOUNCEMENT_ANNOUNCEMENT_EXTENDED: builder.display('announcement', {
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
			COMMAND_ANNOUNCEMENT_SUBSCRIBE_DESCRIPTION: `Subscribe to this server's announcements.`,
			COMMAND_ANNOUNCEMENT_SUBSCRIBE_EXTENDED: builder.display('subscribe', {
				extendedHelp: `'This command serves the purpose of **giving** you the subscriber role, which must be configured by the
					server's administrators. When a moderator or administrator use the **announcement** command, you
					will be mentioned. This feature is meant to replace everyone/here tags and mention only the interested
					users.`
			}),
			COMMAND_ANNOUNCEMENT_UNSUBSCRIBE_DESCRIPTION: `Unsubscribe from this server's announcements.`,
			COMMAND_ANNOUNCEMENT_UNSUBSCRIBE_EXTENDED: builder.display('unsubscribe', {
				extendedHelp: `This command serves the purpose of **removing** you the subscriber role, which must be configured by the
					server's administrators. When a moderator or administrator use the **announcement** command, you
					will **not longer** be mentioned. This feature is meant to replace everyone/here tags and mention
					only the interested users.`
			}),

			/**
			 * ############
			 * FUN COMMANDS
			 */
			COMMAND_FUN_8BALL_DESCRIPTION: 'Skyra will read the Holy Bible to find the correct answer for your question.',
			COMMAND_FUN_8BALL_EXTENDED: builder.display('8ball', {
				extendedHelp: `This command provides you a random question based on your questions' type. Be careful, it may be too smart.`,
				explainedUsage: [
					['question', 'The Holy Question']
				],
				examples: ['Why did the chicken cross the road?']
			}),
			COMMAND_FUN_CHOICE_DESCRIPTION: 'Eeny, meeny, miny, moe, catch a tiger by the toe...',
			COMMAND_FUN_CHOICE_EXTENDED: builder.display('choice', {
				extendedHelp: `I have an existencial doubt... should I wash the dishes or throw them throught the window? The search
					continues. List me items separated by comma and I will choose one them. On a side note, I am not
					responsible of what happens next.`,
				explainedUsage: [
					['words', 'A list of words separated by comma.']
				],
				examples: ['Should Wash the dishes, Throw the dishes throught the window', 'Cat, Dog']
			}),
			COMMAND_FUN_CATFACT_DESCRIPTION: 'Let me tell you a misterious cat fact.',
			COMMAND_FUN_CATFACT_EXTENDED: builder.display('catfact', {
				extendedHelp: `Do you know cats are very curious, right? They certainly have a lot of fun and weird facts.
					This command queries catfact.ninja and retrieves a fact so you can read it.`
			}),
			COMMAND_FUN_DICE_DESCRIPTION: `Roll the dice, 'x' rolls and 'y' sides.`,
			COMMAND_FUN_DICE_EXTENDED: builder.display('dice', {
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
			COMMAND_FUN_ESCAPEROPE_DESCRIPTION: 'Use the escape rope from Pokemon.',
			COMMAND_FUN_ESCAPEROPE_EXTENDED: builder.display('escaperope', {
				extendedHelp: '**Skyra** used **Escape Rope**.'
			}),
			COMMAND_FUN_FOX_DESCRIPTION: 'Let me show you an image of a fox!',
			COMMAND_FUN_FOX_EXTENDED: builder.display('fox', {
				extendedHelp: `This command provides you a random image from PixaBay, always showing 'fox' results. However,
					it may not be exactly accurate and show you other kinds of foxes.`
			}),
			COMMAND_FUN_HOWTOFLIRT_DESCRIPTION: 'Captain America, you do not know how to flirt.',
			COMMAND_FUN_HOWTOFLIRT_EXTENDED: builder.display('howtoflirt', {
				extendedHelp: `Let me show you how to effectively flirt with somebody using the Tony Stark's style for Captain
					America, I can guarantee that you'll get him.`,
				explainedUsage: [
					['user', 'The user to flirt with.']
				],
				examples: ['Skyra']
			}),
			COMMAND_FUN_LOVE_DESCRIPTION: 'Lovemeter, online!',
			COMMAND_FUN_LOVE_EXTENDED: builder.display('love', {
				extendedHelp: `Hey! Wanna check the lovemeter? I know it's a ridiculous machine, but many humans love it!
					Don't be shy and try it!`,
				explainedUsage: [
					['user', 'The user to rate.']
				],
				examples: ['Skyra']
			}),
			COMMAND_FUN_NORRIS_DESCRIPTION: `Enjoy your day reading Chuck Norris' jokes.`,
			COMMAND_FUN_NORRIS_EXTENDED: builder.display('norris', {
				extendedHelp: `Did you know that Chuck norris does **not** call the wrong number, but you **answer** the wrong phone?
					Woah, mindblow. He also threw a carton of milk and created the Milky Way. This command queries chucknorris.io
					and retrieves a fact (do not assume they're false, not in front of him) so you can read it`
			}),
			COMMAND_FUN_RATE_DESCRIPTION: 'Let bots have opinions and rate somebody.',
			COMMAND_FUN_RATE_EXTENDED: builder.display('rate', {
				extendedHelp: `Just because I am a bot doesn't mean I cannot rate you properly. I can grade you with a random number
					generator to ease the process. Okay okay, it's not fair, but I mean... I can also give you a 💯.`,
				explainedUsage: [
					['user', 'The user to rate.']
				],
				examples: ['Skyra', 'me']
			}),
			COMMAND_FUN_XKCD_DESCRIPTION: 'Read comics from XKCD.',
			COMMAND_FUN_XKCD_EXTENDED: builder.display('xkcd', {
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
			COMMAND_MANAGEMENT_CREATEMUTE_DESCRIPTION: 'Prepare the mute system.',
			COMMAND_MANAGEMENT_CREATEMUTE_EXTENDED: builder.display('createmute', {
				extendedHelp: `This command prepares the mute system by creating a role called 'muted', and configuring it to
					the guild configuration. This command also modifies all channels (where possible) permissions and disables
					the permission ${PERMS.SEND_MESSAGES} in text channels and ${PERMS.CONNECT} in voice channels for said role.`
			}),
			COMMAND_MANAGEMENT_FETCH_DESCRIPTION: 'Read the context of a message.',
			COMMAND_MANAGEMENT_FETCH_EXTENDED: builder.display('fetch', {
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
			COMMAND_MANAGEMENT_GIVEAWAY_DESCRIPTION: 'Start a new giveaway.',
			COMMAND_MANAGEMENT_GIVEAWAY_EXTENDED: builder.display('giveaway', {
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
			COMMAND_MANAGEMENT_LIST_DESCRIPTION: 'Check the list of channels, roles, members or warnings for this guild.',
			COMMAND_MANAGEMENT_LIST_EXTENDED: builder.display('list', {
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
			COMMAND_MANAGEMENT_MANAGEALIAS_DESCRIPTION: 'Manage aliases for commands for this server.',
			COMMAND_MANAGEMENT_MANAGEALIAS_EXTENDED: builder.display('managealias', {
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
			COMMAND_MANAGEMENT_ROLEINFO_DESCRIPTION: 'Check the information for a role.',
			COMMAND_MANAGEMENT_ROLEINFO_EXTENDED: builder.display('roleinfo', {
				extendedHelp: `The roleinfo command displays information for a role, such as its id, name, color, whether it's hoisted
					(displays separately) or not, it's role hierarchy position, whether it's mentionable or not, how many members have said
					role, and its permissions. It sends an embedded message with the colour of the role.`,
				explainedUsage: [
					['role', 'The role name, partial name, mention or id.']
				],
				examples: ['Administrator', 'Moderator']
			}),
			COMMAND_MANAGEMENT_SERVERINFO_DESCRIPTION: 'Check the information of the guild.',
			COMMAND_MANAGEMENT_SERVERINFO_EXTENDED: builder.display('serverinfo', {
				extendedHelp: `The serverinfo command displays information for the guild the message got sent. It shows the amount of channels,
					with the count for each category, the amount of members (given from the API), the owner with their user id, the amount of roles,
					region, creation date, verification level... between others.`,
				reminder: `The command may not show an accurate amount of users online and offline, that's intended to save server costs for caching
					many unnecesary members from the API. However, this should happen more likely in giant guilds.`
			}),

			/**
			 * #############
			 * MISC COMMANDS
			 */
			COMMAND_MISC_CUDDLE_DESCRIPTION: 'Cuddle somebody!',
			COMMAND_MISC_CUDDLE_EXTENDED: builder.display('cuddle', {
				extendedHelp: `Do you know something that I envy from humans? The warm feeling when somebody cuddles you. It's so cute ❤! I can
					imagine and draw a image of you cuddling somebody in the bed, I hope you like it!`,
				explainedUsage: [
					['user', 'The user to cuddle with.']
				],
				examples: ['Skyra']
			})

			/**
			 * #################################
			 * #       COMMAND RESPONSES       #
			 * #################################
			 */
		};
	}

};
