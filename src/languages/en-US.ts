/* eslint-disable @typescript-eslint/no-invalid-this, @typescript-eslint/member-ordering */
import { VERSION } from '@root/config';
import { DurationFormatter, TimeTypes } from '@sapphire/time-utilities';
import { codeBlock, inlineCodeBlock, toTitleCase } from '@sapphire/utilities';
import { Emojis } from '@utils/constants';
import { CATEGORIES } from '@utils/Games/TriviaManager';
import { random } from '@utils/util';
import { Language, LanguageKeys, Timestamp, version as klasaVersion } from 'klasa';

const LOADING = Emojis.Loading;
const SHINY = Emojis.Shiny;
const GREENTICK = Emojis.GreenTick;
const REDCROSS = Emojis.RedCross;

const timestamp = new Timestamp('YYYY/MM/DD [at] HH:mm:ss');

const duration = new DurationFormatter({
	[TimeTypes.Year]: {
		1: 'year',
		DEFAULT: 'years'
	},
	[TimeTypes.Month]: {
		1: 'month',
		DEFAULT: 'months'
	},
	[TimeTypes.Week]: {
		1: 'week',
		DEFAULT: 'weeks'
	},
	[TimeTypes.Day]: {
		1: 'day',
		DEFAULT: 'days'
	},
	[TimeTypes.Hour]: {
		1: 'hour',
		DEFAULT: 'hours'
	},
	[TimeTypes.Minute]: {
		1: 'minute',
		DEFAULT: 'minutes'
	},
	[TimeTypes.Second]: {
		1: 'second',
		DEFAULT: 'seconds'
	}
});

export default class extends Language {
	public PERMISSIONS = {
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
		STREAM: 'Stream',
		MUTE_MEMBERS: 'Mute Members',
		DEAFEN_MEMBERS: 'Deafen Members',
		MOVE_MEMBERS: 'Move Members',
		USE_VAD: 'Use Voice Activity',
		PRIORITY_SPEAKER: 'Priority Speaker',
		VIEW_GUILD_INSIGHTS: 'View Guild Insights'
	};

	public HUMAN_LEVELS = {
		NONE: 'None',
		LOW: 'Low',
		MEDIUM: 'Medium',
		HIGH: 'High',
		VERY_HIGH: 'Highest'
	};

	public duration(time: number, precision?: number) {
		return duration.format(time, precision);
	}

	/** Parses cardinal numbers to the ordinal counterparts */
	public ordinal(cardinal: number) {
		const cent = cardinal % 100;
		const dec = cardinal % 10;

		if (cent >= 10 && cent <= 20) {
			return `${cardinal}th`;
		}

		switch (dec) {
			case 1:
				return `${cardinal}st`;
			case 2:
				return `${cardinal}nd`;
			case 3:
				return `${cardinal}rd`;
			default:
				return `${cardinal}th`;
		}
	}

	public list(values: readonly string[], conjunction: 'or' | 'and') {
		switch (values.length) {
			case 0:
				return '';
			case 1:
				return values[0];
			case 2:
				return `${values[0]} ${conjunction} ${values[1]}`;
			default: {
				const trail = values.slice(0, -1);
				const head = values[values.length - 1];
				return `${trail.join(', ')}, ${conjunction} ${head}`;
			}
		}
	}

	public groupDigits(number: number) {
		return number.toLocaleString(this.name, { useGrouping: true });
	}

	public language: LanguageKeys = {
		/**
		 * ################################
		 * #      FRAMEWORK MESSAGES      #
		 * #         KLASA 0.5.0d         #
		 * ################################
		 */

		default: ({ key }) => `${key} has not been localized for en-US yet.`,
		defaultLanguage: 'Default Language',
		globalYes: 'Yes',
		globalNo: 'No',
		globalNone: 'None',
		globalIs: 'is',
		globalAnd: 'and',
		globalOr: 'or',
		globalUnknown: 'Unknown',
		settingGatewayKeyNoext: ({ key }) => `The key "${key}" does not exist in the data schema.`,
		settingGatewayChooseKey: ({ keys }) => `You cannot edit a settings group, pick any of the following: "${keys}"`,
		settingGatewayUnconfigurableFolder: 'This settings group does not have any configurable sub-key.',
		settingGatewayUnconfigurableKey: ({ key }) => `The settings key "${key}" has been marked as non-configurable by the bot owner.`,
		settingGatewayMissingValue: ({ path, value }) => `The value "${value}" cannot be removed from the key "${path}" because it does not exist.`,
		settingGatewayDuplicateValue: ({ path, value }) => `The value "${value}" cannot be added to the key "${path}" because it was already set.`,
		settingGatewayInvalidFilteredValue: ({ path, value }) => `The settings key "${path}" does not accept the value "${value}".`,
		resolverBoolFalseOptions: ['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-'],
		resolverBoolTrueOptions: ['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+'],
		resolverBoolEnabled: 'Enabled',
		resolverBoolDisabled: 'Disabled',
		resolverMultiTooFew: ({ name, min, conjunctionWord }) => `Provided too few ${name}s. At least ${min} ${conjunctionWord} required.`,
		resolverInvalidBool: ({ name }) => `${name} must be true or false.`,
		resolverInvalidChannel: ({ name }) => `${name} must be a channel tag or valid channel id.`,
		resolverInvalidCustom: ({ name, type }) => `${name} must be a valid ${type}.`,
		resolverInvalidDate: ({ name }) => `${name} must be a valid date.`,
		resolverInvalidDuration: ({ name }) => `${name} must be a valid duration string.`,
		resolverInvalidEmoji: ({ name }) => `${name} must be a custom emoji tag or valid emoji id.`,
		resolverInvalidFloat: ({ name }) => `${name} must be a valid number.`,
		resolverInvalidGuild: ({ name }) => `${name} must be a valid guild id.`,
		resolverInvalidInt: ({ name }) => `${name} must be an integer.`,
		resolverInvalidInvite: ({ name }) => `${name} must be a valid invite link.`,
		resolverInvalidWager: ({ bet, validAmounts }) =>
			`I am sorry, but ${bet} ${SHINY} is an invalid amount to bet. You can bet one of ${validAmounts}`,
		resolverInvalidLiteral: ({ name }) => `Your option did not match the only possibility: ${name}`,
		resolverInvalidMember: ({ name }) => `${name} must be a mention or valid user id.`,
		resolverInvalidMessage: ({ name }) => `${name} must be a valid message id.`,
		resolverInvalidPiece: ({ name, piece }) => `${name} must be a valid ${piece} name.`,
		resolverInvalidRegexMatch: ({ name, pattern }) => `${name} must follow this regex pattern \`${pattern}\`.`,
		resolverInvalidRole: ({ name }) => `${name} must be a role mention or role id.`,
		resolverInvalidString: ({ name }) => `${name} must be a valid string.`,
		resolverInvalidTime: ({ name }) => `${name} must be a valid duration or date string.`,
		resolverInvalidUrl: ({ name }) => `${name} must be a valid url.`,
		resolverInvalidUser: ({ name }) => `${name} must be a mention or valid user id.`,
		resolverInvalidSnowflake: ({ name }) => `${name} must be a valid Discord snowflake.`,
		resolverInvalidStore: ({ store }) => `${store} must be a valid Store.`,
		resolverStringSuffix: ' characters',
		resolverMinmaxExactlyInclusive: ({ name, min }) => `${name} must be exactly ${min}.`,
		resolverMinmaxExactlyExclusive: ({ name, min }) => `${name} must be exactly ${min}.`,
		resolverMinmaxBothInclusive: ({ name, min, max }) => `${name} must be between ${min} and ${max} inclusively.`,
		resolverMinmaxBothExclusive: ({ name, min, max }) => `${name} must be between ${min} and ${max} exclusively.`,
		resolverMinmaxMinInclusive: ({ name, min }) => `${name} must be greater than ${min} inclusively.`,
		resolverMinmaxMinExclusive: ({ name, min }) => `${name} must be greater than ${min} exclusively.`,
		resolverMinmaxMaxInclusive: ({ name, max }) => `${name} must be less than ${max} inclusively`,
		resolverMinmaxMaxExclusive: ({ name, max }) => `${name} must be less than ${max} exclusively.`,
		reactionhandlerPrompt: 'Which page would you like to jump to?',
		// used for help command
		systemHelpTitles: {
			explainedUsage: '⚙ | ***Explained usage***',
			possibleFormats: '🔢 | ***Possible formats***',
			examples: '🔗 | ***Examples***',
			reminders: '⏰ | ***Reminder***'
		},
		commandmessageMissing: 'Missing one or more required arguments after end of input.',
		commandmessageMissingRequired: ({ name }) => `${name} is a required argument.`,
		commandmessageMissingOptionals: ({ possibles }) => `Missing a required option: (${possibles})`,
		commandmessageNomatch: ({ possibles }) => `Your option didn't match any of the possibilities: (${possibles})`,
		monitorCommandHandlerReprompt: ({ tag, name, time, cancelOptions }) =>
			`${tag} | **${name}** | You have **${time}** seconds to respond to this prompt with a valid argument. Type **${cancelOptions}** to abort this prompt.`,
		monitorCommandHandlerRepeatingReprompt: ({ tag, name, time, cancelOptions }) =>
			`${tag} | **${name}** is a repeating argument | You have **${time}** seconds to respond to this prompt with additional valid arguments. Type **${cancelOptions}** to cancel this prompt.`,
		monitorCommandHandlerAborted: 'Aborted',
		inhibitorCooldown: ({ remaining }) => `You have just used this command. You can use this command again in ${remaining}.`,
		inhibitorMissingBotPerms: ({ missing }) => `I don't have sufficient permissions! I'm missing: ${missing}`,
		inhibitorNsfw: 'You may not use NSFW commands in this channel!',
		inhibitorPermissions: 'You do not have permission to use this command!',
		inhibitorRequiredSettings: ({ settings }) => `The guild is missing the **${settings}** guild setting and thus the command cannot run.`,
		inhibitorRequiredSettingsPlural: ({ settings }) => `The guild is missing the **${settings}** guild settings and thus the command cannot run.`,
		inhibitorRunin: ({ type }) => `This command is only available in ${type} channels.`,
		inhibitorRuninNone: ({ name }) => `The ${name} command is not configured to run in any channel.`,
		inhibitorDisabledGuild: 'This command has been disabled by an admin in this guild!',
		inhibitorDisabledGlobal:
			'This command has been globally disabled by the bot owners. Want to know why and find out when it will be back? Join the official Skyra server: <https://join.skyra.pw>',
		commandBlocklistDescription: 'Block or allow users and guilds from using my functionalities.',
		commandBlocklistSaveSuccess: `${GREENTICK} Successfully updated blocked users and/or guilds`,
		commandBlocklistResetSuccess: `${GREENTICK} Successfully reset blocked users and guilds`,
		commandUnload: ({ type, name }) => `${GREENTICK} Unloaded ${type}: ${name}`,
		commandUnloadDescription: 'Unloads the klasa piece.',
		commandTransferError: `${REDCROSS} That file has been transferred already or never existed.`,
		commandTransferSuccess: ({ type, name }) => `${GREENTICK} Successfully transferred ${type}: ${name}`,
		commandTransferFailed: ({ type, name }) => `Transfer of ${type}: ${name} to Client has failed. Please check your Console.`,
		commandTransferDescription: 'Transfers a core piece to its respective folder',
		commandReload: ({ type, name, time }) => `${GREENTICK} Reloaded ${type}: ${name}. (Took: ${time})`,
		commandReloadFailed: ({ type, name }) => `${REDCROSS} Failed to reload ${type}: ${name}. Please check your Console.`,
		commandReloadAll: ({ type, time }) => `${GREENTICK} Reloaded all ${type}. (Took: ${time})`,
		commandReloadEverything: ({ time }) => `${GREENTICK} Reloaded everything. (Took: ${time})`,
		commandReloadDescription: 'Reloads a klasa piece, or all pieces of a klasa store.',
		commandReboot: `${LOADING} Rebooting...`,
		commandRebootDescription: 'Reboots the bot.',
		commandPing: `${LOADING} Ping?`,
		commandPingDescription: 'Runs a connection test to Discord.',
		commandPingPong: ({ diff, ping }) => `Pong! (Roundtrip took: ${diff}ms. Heartbeat: ${ping}ms.)`,
		commandInfoDescription: 'Provides some information about this bot.',
		commandHelpDescription: 'Display help for a command.',
		commandHelpNoExtended: 'No extended help available.',
		commandHelpDm: '📥 | The list of commands you have access to has been sent to your DMs.',
		commandHelpNodm: `${REDCROSS} | You have DMs disabled so I couldn't send you the list of commands.`,
		commandHelpAllFlag: ({ prefix }) =>
			`Displaying one category per page. Have issues with the embed? Run \`${prefix}help --all\` for a full list in DMs.`,
		commandHelpCommandCount: ({ count }) => `${count} command`,
		commandHelpCommandCountPlural: ({ count }) => `${count} commands`,
		commandEnable: ({ type, name }) => `+ Successfully enabled ${type}: ${name}`,
		commandEnableDescription: 'Re-enables or temporarily enables a command/inhibitor/monitor/finalizer. Default state restored on reboot.',
		commandDisable: ({ type, name }) => `+ Successfully disabled ${type}: ${name}`,
		commandDisableDescription:
			'Re-disables or temporarily disables a command/inhibitor/monitor/finalizer/event. Default state restored on reboot.',
		commandDisableWarn: "You probably don't want to disable that, since you wouldn't be able to run any command to enable it again",
		commandConfNoKey: 'You must provide a key',
		commandConfNoValue: 'You must provide a value',
		commandConfGuarded: ({ name }) => `${toTitleCase(name)} may not be disabled.`,
		commandConfUpdated: ({ key, response }) => `Successfully updated the key **${key}**: \`${response}\``,
		commandConfKeyNotArray: "This key is not array type. Use the action 'reset' instead.",
		commandConfGetNoExt: ({ key }) => `The key **${key}** does not seem to exist.`,
		commandConfGet: ({ key, value }) => `The value for the key **${key}** is: \`${value}\``,
		commandConfReset: ({ key, value }) => `The key **${key}** has been reset to: \`${value}\``,
		commandConfNochange: ({ key }) => `The value for **${key}** was already that value.`,
		commandConfServerDescription: 'Define per-server settings.',
		commandConfServer: ({ key, list }) => `**Server Setting ${key}**\n${list}`,
		commandConfUserDescription: 'Define per-user settings.',
		commandConfDashboardOnlyKey: ({ key }) => `\`${key}\` can only be configured through the web dashboard (<https://skyra.pw>)`,
		commandConfUser: ({ key, list }) => `**User Setting ${key}**\n${list}`,
		commandConfSettingNotSet: 'Not Set',
		messagePromptTimeout: 'The prompt has timed out.',
		textPromptAbortOptions: ['abort', 'stop', 'cancel'],
		commandLoad: ({ time, type, name }) => `${GREENTICK} Successfully loaded ${type}: ${name}. (Took: ${time})`,
		commandLoadFail: 'The file does not exist, or an error occurred while loading your file. Please check your console.',
		commandLoadError: ({ type, name, error }) => `${REDCROSS} Failed to load ${type}: ${name}. Reason:${codeBlock('js', error)}`,
		commandLoadDescription: 'Load a piece from your bot.',

		/**
		 * ################################
		 * #     COMMAND DESCRIPTIONS     #
		 * ################################
		 */

		argumentRangeInvalid: ({ name }) => `${name} must be a number or a range of numbers.`,
		argumentRangeMax: ({ name, maximum }) => `${name} accepts a range of maximum ${maximum} 'number'`,
		argumentRangeMaxPlural: ({ name, maximum }) => `${name} accepts a range of maximum ${maximum} 'numbers'`,

		commandAddDescription: 'Adds a song the the queue.',
		commandAddExtended: {
			extendedHelp: [
				`Add songs to the playing queue and prepare for musical enjoyment!
					I can play music from YouTube, Bandcamp, SoundCloud, Twitch, or Vimeo.`,
				'- To play from YouTube either give me something to search for, a video link, or a playlist link.',
				'- To play from SoundCloud give me a SoundCloud link, or if you want me to search include either `--sc` or `--soundcloud` in your message.',
				'- To play from Bandcamp, Twitch, or Vimeo just give me a URL to a video or playlist on those sources.',
				'- To play a previously exported queue, include `--import` and attach the queue file to your message or give me a URL to it.'
			],
			explainedUsage: [['song', 'The song to queue. Can be either a URL or a video/song title.']],
			examples: [
				'The Pokémon Theme song',
				'https://youtu.be/fJ9rUzIMcZQ',
				'--sc Imagine Dragons Believer',
				'https://soundcloud.com/vladkurt/imagine-dragons-beliver-vladkurt-remix',
				'https://vimeo.com/channels/music/239029778',
				'https://thedisappointed.bandcamp.com/album/escapism-2',
				'https://cdn.discordapp.com/attachments/642137151626018818/746716958627725402/Skyra_Development_Suite-1598101595077.squeue',
				'--import https://cdn.skyra.pw/favsongs.squeue'
			],
			multiline: true
		},
		commandAddPlaylist: ({ songs }) => `${GREENTICK} Added ${songs} to the queue 🎶`,
		commandAddPlaylistSongs: ({ count }) => `**${count}** song`,
		commandAddPlaylistSongsPlural: ({ count }) => `**${count}** songs`,
		commandAddSong: ({ title }) => `${GREENTICK} Added **${title}** to the queue 🎶`,
		commandClearDescription: 'Clears the queue list.',
		commandClearDenied: `${REDCROSS} You can't execute this command when there are over 4 members! You must be a dee-jay or a moderator!`,
		commandClearSuccess: ({ count }) => `${REDCROSS}  Pruned ${count} song.`,
		commandClearSuccessPlural: ({ count }) => `${REDCROSS}  Pruned ${count} songs.`,
		commandExportQueueDescription: 'Exports your queue to a `.squeue` file.',
		commandExportQueueExtended: {
			extendedHelp: [
				"Have a queue you liked and want to replay later? Or maybe you want to send your friends what you're listening right now",
				"Use `exportqueue` and I'll pack the music in your queue into a neat file you can either save or share with your friends!",
				'When you want to play it back, just use it with `play`, `add` or `importqueue`!'
			],
			reminder: 'If your queue is longer than 100 words, I will only include the first 100, to prevent abuse of my systems',
			multiline: true
		},
		commandExportQueueSuccess: ({ guildName }) => `${GREENTICK} Here's the current queue for ${guildName}!`,
		commandImportQueueDescription: 'Imports a queue saved as a `.squeue` file.',
		commandImportQueueExtended: {
			extendedHelp: [
				'Did a friend send you a queue? Or maybe you want to play a queue you saved earlier?',
				'With `importqueue`, I can load the queue for you, and then you can jam to your favorite tracks!'
			],
			reminder: 'You can either give me a link to the `.squeue` file, or attach it to your message!',
			multiline: true
		},
		commandJoinDescription: "Joins the message author's voice channel.",
		commandJoinNoMember: `${REDCROSS} I'm sorry, but Discord did not give me the information I need, so I don't know which voice channel you're connected to...`,
		commandJoinNoVoicechannel: `${REDCROSS} You are not connected in a voice channel.`,
		commandJoinSuccess: ({ channel }) => `${GREENTICK} Successfully joined the voice channel ${channel}`,
		commandJoinVoiceDifferent: `${REDCROSS} I think you confused the channels! Earth to Moon, we are in another voice channel!`,
		commandJoinVoiceFull: `${REDCROSS} I cannot join your voice channel, it's full... kick somebody or make room for me!`,
		commandJoinVoiceNoConnect: `${REDCROSS} I do not have enough permissions to connect to your voice channel. I am missing the **${this.PERMISSIONS.CONNECT}** permission.`,
		commandJoinVoiceNoSpeak: `${REDCROSS} I can connect... but not speak. Please turn on this permission so I can emit music.`,
		commandJoinVoiceSame: `${REDCROSS} Turn on your volume! I am playing music there!`,
		commandJoinFailed: `${REDCROSS} I could not join your voice channel because there is something wrong with my music player. Please join the support server by using \`@Skyra support\` and alert my developers.`,
		commandLeaveDescription: 'Leaves the voice channel.',
		commandLeaveExtended: {
			extendedHelp: [
				`Use this command to make me leave the current voice channel.`,
				`By default I will leave the channel, forget about the currently playing song, but leave the queue intact.`,
				'This means that if you use `Skyra, play` after the leave command, I will continue playing with the first song that was on the queue before I left.',
				'',
				`This default behavior can be modified with flags:`,
				'`--removeall` or `--ra` to follow the default behavior as well clear the queue, next time you want me to start playing you will have build a new queue'
			],
			examples: ['leave', 'leave --removeall', 'leave --ra', 'leave --soft'],
			multiline: true
		},
		commandLeaveSuccess: ({ channel }) => `${GREENTICK} Successfully left the voice channel ${channel}`,
		commandPauseDescription: 'Pauses the current song.',
		commandPauseSuccess: `${GREENTICK} Paused`,
		commandPlayDescription: 'Let me be your DJ and play you some tunes!',
		commandPlayExtended: {
			extendedHelp: [
				`Queue some music and allow me to start jamming out to your enjoyment.
				When using this command I will automatically join your voice channel and start playing the first song in my queue.
					I can play from YouTube, Bandcamp, SoundCloud, Twitch, Vimeo, Mixer, or a queue someone else exported earlier`,
				'- To play from YouTube either give me something to search, a video link, or a playlist link.',
				'- To play from SoundCloud give me a SoundCloud link, or if you want me to search include either `--sc` or `--soundcloud` in your message.',
				"- To play from Mixer give me the URL of a Mixer streamer, I'm sorry but I cannot (yet) play Mixer VOD's.",
				'- To play from Bandcamp, Twitch, or Vimeo just give me a URL to a video or playlist on those sources.',
				'- To play from a previously-exported queue, include `--import` and attach it to your message or give me a URL to it'
			],
			explainedUsage: [['song', 'The song to play. Can be either a URL or a video/song title.']],
			examples: [
				'The Pokémon Theme song',
				'https://youtu.be/fJ9rUzIMcZQ',
				'--sc Imagine Dragons Believer',
				'https://soundcloud.com/vladkurt/imagine-dragons-beliver-vladkurt-remix',
				'https://vimeo.com/channels/music/239029778',
				'https://mixer.com/Ninja',
				'https://thedisappointed.bandcamp.com/album/escapism-2',
				'--import https://cdn.skyra.pw/favsongs.squeue'
			],
			reminder: 'Before you can use this command you should join a voice channel!',
			multiline: true
		},
		commandPlayEnd: 'It looks like the queue ended here. I hope you enjoyed the session!',
		commandPlayNext: ({ title, requester }) => `🎧 Playing: **${title}** as requested by: **${requester}**`,
		commandPlayQueuePaused: ({ song }) => `There was a track going on! Playing it back! Now playing: ${song}!`,
		commandPlayQueuePlaying: `${REDCROSS} Hey! The disk is already spinning!`,
		commandPlayQueueEmpty:
			'The session is over, add some songs to the queue, you can for example do `Skyra, add Imperial March`, and... *dumbrolls*!',
		commandPlayingDescription: 'Get information from the current song.',
		commandPlayingDuration: ({ duration }) => `**Duration**: ${duration}`,
		commandPlayingQueueEmpty: `${REDCROSS} Are you speaking to me? Because my deck is empty...`,
		commandPlayingQueueNotPlaying: `${REDCROSS} I think you're listening to background noise, I'm not playing anything.`,
		commandRepeatDescription: 'Toggle repeating the current song.',
		commandRepeatSuccessEnabled: "This is your JAM isn't it? Don't you worry, we will repeat this on and on and on!",
		commandRepeatSuccessDisabled: "I was actually getting tired of this too, but I didn't want to say anything.",
		commandQueueDescription: 'Check the queue list.',
		commandQueueLast: 'There are no more songs! After the one playing is over, the session will end!',
		commandQueueTitle: ({ guildname }) => `Music queue for ${guildname}`,
		commandQueueLine: ({ position, duration, title, url, requester }) =>
			`**[\`${position}\`]** │ \`${duration}\` │ [${title}](${url}) │ Requester: **${requester}**.`,
		commandQueueNowplaying: ({ title, url, requester }) => `[${title}](${url})\nRequester: **${requester}**`,
		commandQueueNowplayingLiveStream: 'Live Stream',
		commandQueueNowplayingTimeRemaining: ({ timeRemaining }) => `🕰 Time remaining: ${timeRemaining}.`,
		commandQueueNowplayingTitle: 'Now Playing:',
		commandQueueTotalTitle: 'Total songs:',
		commandQueueTotal: ({ songs, remainingTime }) => `${songs} in the queue, with a total duration of ${remainingTime}`,
		commandQueueEmpty: "looks like nothing is playing right now and the queue is empty, why don't you start the disc?",
		commandQueueDashboardInfo: ({ guild }) =>
			`Did you know that you can also manage your music using a fancy webapp? [Click here to go there](https://skyra.pw/music/${guild.id})`,
		commandRemoveDescription: 'Remove a song from the queue list.',
		commandRemoveIndexInvalid: `I'm good with maths, unlike my sister, but I need you to give me a number equal or bigger than 1.`,
		commandRemoveIndexOutOfBounds: ({ songs }) => `maybe time happened too fast for you, there are ${songs} in the queue!`,
		commandRemoveDenied: `${REDCROSS} Let's play it nicely, don't remove other's songs if you're not a moderator nor a deejay.`,
		commandRemoveSuccess: ({ title, requester }) => `${GREENTICK} Removed the song **${title}** requested by <@${requester}>.`,
		commandSeekDescription: 'Change the player time for the current song.',
		commandSeekSuccess: ({ time }) => `${GREENTICK} Successfully changed the time! Now at ${this.duration(time)}!`,
		commandResumeDescription: 'Resumes the current song.',
		commandResumeSuccess: '▶ Resumed.',
		commandRolesetDescription: 'Manage unique role sets.',
		commandRolesetExtended: {
			extendedHelp: [
				'A role set is a group of roles Skyra identifies as unique for all members in the server, i.e. a roleset named "region" could have the roles `Africa`, `America`, `Asia`, and `Europe`, and members will only be able to have one of them. This is like a kind of "rule" that is applied in the three following situations:',
				'',
				'- When somebody claims a role via the `Skyra, roles`.',
				'- When somebody claims a role via reaction roles.',
				'- When somebody receives a role either manually or from another bot.'
			],
			explainedUsage: [
				['add', 'Create a new roleset or add a role to an existing one.'],
				['remove', 'Remove a role from an existing roleset.'],
				['reset', 'Removes all roles from a roleset or, if not specified, all existing rolesets.'],
				['list', 'Lists all rolesets.'],
				['auto', 'Adds or removes a roleset.']
			],
			examples: [
				'add regions America',
				'add regions Africa America Asia Europe',
				'remove regions America',
				'reset',
				'reset regions',
				'list',
				'regions America',
				'regions Africa America Asia Europe'
			],
			reminder: 'This command can add and/or remove multiple roles at the same time.',
			multiline: true
		},
		commandRolesetCreated: ({ name, roles }) => `The ${name} unique role set has been created with the following roles: ${roles}`,
		commandRolesetAdded: ({ name, roles }) => `The ${name} unique role set now has the following roles as well: ${roles}.`,
		commandRolesetInvalidName: ({ name }) => `You can not remove the ${name} unique role set because it does not exist.`,
		commandRolesetRemoved: ({ name, roles }) => `The ${name} unique role set will no longer include the following roles: ${roles}`,
		commandRolesetResetEmpty: `${REDCROSS} There are no rolesets configured in this groupo.`,
		commandRolesetResetAll: `${GREENTICK} Successfully removed all rolesets.`,
		commandRolesetResetNotExists: ({ name }) => `${REDCROSS} The roleset \`${name}\` does not exist in this server.`,
		commandRolesetResetGroup: ({ name }) => `${GREENTICK} Successfully removed the roleset \`${name}\` from this server.`,
		commandRolesetUpdated: ({ name }) => `The ${name} unique role set has been updated.`,
		commandRolesetNoRolesets: 'You have no rolesets.',
		commandShuffleDescription: 'Randomize the order of the songs in the queue.',
		commandShuffleSuccess: ({ amount }) => `${GREENTICK} Successfully randomized ${amount} songs.`,
		commandSkipDescription: 'Skip the current song.',
		commandSkipPermissions: `${REDCROSS} You can't execute this command, you must be a DJ or a Moderator.`,
		commandSkipVotesVoted: `${REDCROSS} You have already voted.`,
		commandSkipVotesTotal: ({ amount, needed }) => `🔸 | Votes: ${amount} of ${needed}`,
		commandSkipSuccess: ({ title }) => `⏭ Skipped **${title}**.`,
		commandPlayingTimeDescription: 'Check how much time is left for the song to end.',
		commandPlayingTimeQueueEmpty: 'Are you speaking to me? Because my deck is empty...',
		commandPromoteDescription: 'Promote a song to the front of the queue',
		commandPromoteExtended: {
			explainedUsage: [['number', 'The index in the queue to promote to the front. Use `Skyra, queue` to find the index of a song']],
			examples: ['5'],
			reminder: 'This command requires that you are a DJ or a Moderator to use it'
		},
		commandPromoteSuccess: ({ title, url }) => `${GREENTICK} Successfully promoted **${title}** (<${url}>) to the top of the queue`,
		commandVolumeDescription: 'Manage the volume for current song.',
		commandVolumeSuccess: ({ volume }) => `📢 Volume: ${volume}%`,
		commandVolumeChanged: ({ emoji, volume }) => `${emoji} Volume set to: ${volume}%`,
		commandVolumeChangedExtreme: ({ emoji, text, volume }) => `${emoji} ${text} set to: ${volume}%`,
		commandVolumeChangedTexts: ['**EXTREME VOLUME**', '**AIRPLANE NACELLE-LIKE VOLUME**', '**FALCON HEAVY LAUNCH-LIKE VOLUME**'],

		inhibitorMusicQueueEmpty: `${REDCROSS} The queue\'s empty! The session will start as soon as we have some songs queued.`,
		inhibitorMusicNotPlaying: `${REDCROSS} Hmm, doesn't look like I'm playing anything right now.`,
		inhibitorMusicPaused: `${REDCROSS} The queue's playing and the session is still up 'till the night ends!`,
		inhibitorMusicDjMember: `${REDCROSS} I believe this is something only a moderator or a deejay of this session is supposed to do!`,
		inhibitorMusicUserVoiceChannel: `${REDCROSS} Hey, I need you to join a voice channel before I can run this command!`,
		inhibitorMusicBotVoiceChannel: `${REDCROSS} I am afraid I need to be in a voice channel to operate this command, please show me the way!`,
		inhibitorMusicBothVoiceChannel: `${REDCROSS} Hey! It looks like you\'re not in the same voice channel as me! Please come join me!`,
		inhibitorMusicNothingPlaying: `${REDCROSS} Looks like nothing is playing right now, how about you start the party 🎉?`,

		musicManagerFetchNoArguments: 'I need you to give me the name of a song!',
		musicManagerFetchNoMatches: "I'm sorry but I wasn't able to find the track!",
		musicManagerFetchLoadFailed: "I'm sorry but I couldn't load this song! Maybe try other song!",
		musicManagerImportQueueError: `${REDCROSS} Sorry, but I'm having issues trying to import that playlist. Are you sure it's from my own DJ deck?`,
		musicManagerImportQueueNotFound: `${REDCROSS} I need a queue to import!`,
		musicManagerTooManySongs: `${REDCROSS} Woah there, you are adding more songs than allowed!`,
		musicManagerSetvolumeSilent: 'Woah, you can just leave the voice channel if you want silence!',
		musicManagerSetvolumeLoud: "I'll be honest, an airplane's nacelle would be less noisy than this!",
		musicManagerPlayNoSongs: 'There are no songs left in the queue!',
		musicManagerPlayPlaying: "The deck's spinning, can't you hear it?",
		musicManagerStuck: ({ milliseconds }) => `${LOADING} Hold on, I got a little problem, I'll be back in: ${this.duration(milliseconds)}!`,

		commandConfMenuNopermissions: `I need the ${this.PERMISSIONS.ADD_REACTIONS} and ${this.PERMISSIONS.MANAGE_MESSAGES} permissions to be able to run the menu.`,
		commandConfMenuRenderAtFolder: ({ path }) => `Currently at: 📁 ${path}`,
		commandConfMenuRenderAtPiece: ({ path }) => `Currently at: ⚙️ ${path}`,
		commandConfMenuRenderNokeys: 'There are no configurable keys for this folder',
		commandConfMenuRenderSelect: "Please type in any of the following entries' names",
		commandConfMenuRenderTctitle: 'Text Commands:',
		commandConfMenuRenderUpdate: '• Update Value → `set <value>`',
		commandConfMenuRenderRemove: '• Remove Value → `remove <value>`',
		commandConfMenuRenderReset: '• Reset Value → `reset`',
		commandConfMenuRenderUndo: '• Undo Update → `undo`',
		commandConfMenuRenderCvalue: ({ value }) => `Current Value: **\`\`${value}\`\`**`,
		commandConfMenuRenderBack: 'Press ◀ to go back',
		commandConfMenuInvalidKey: 'Invalid Key, please try again with any of the following options.',
		commandConfMenuInvalidAction: 'Invalid Action, please try again with any of the following options.',
		commandConfMenuSaved: 'Successfully saved all changes.',

		settingsPrefix:
			'A prefix is an affix that is added in front of the word, in this case, the message. It allows bots to distinguish between a regular message and a command.',
		settingsLanguage: 'The language I will use for your server. It may not be available in the language you want.',
		settingsDisablenaturalprefix: 'Whether or not I should listen for my natural prefix, `Skyra,`',
		settingsDisabledcommands:
			'The disabled commands, core commands may not be disabled, and moderators will override this. All commands must be in lower case.',
		settingsChannelsAnnouncements:
			'The channel for announcements. This (alongside the `roles.subscriber` key) is required for the announce command.',
		settingsChannelsFarewell:
			'The channel I will use to send farewells, you must enable the events and set up the messages, in other categories.',
		settingsChannelsGreeting:
			'The channel I will use to send greetings, you must enable the events and set up the messages, in other categories.',
		settingsChannelsImageLogs: 'The channel I will use to re-upload all images I see.',
		settingsChannelsMemberLogs:
			'The channel for member logs, you must enable the events (`events.memberAdd` for new members, `events.memberRemove` for members who left).',
		settingsChannelsMessageLogs:
			'The channel for (non-NSFW) message logs, you must enable the events (`events.messageDelete` for deleted messages, `events.messageEdit` for edited messages).',
		settingsChannelsModerationLogs:
			'The channel for moderation logs, once enabled, I will post all my moderation cases there. If `events.banRemove` and/or `events.banRemove` are enabled, I will automatically post anonymous logs.',
		settingsChannelsNsfwMessageLogs:
			'The channel for NSFW message logs, same requirement as normal message logs, but will only send NSFW messages.',
		settingsChannelsPruneLogs: 'The channel for prune logs, same requirement as normal mesasge logs, but will only send prune messages.',
		settingsChannelsReactionLogs:
			"The channel for the reaction logs, same requirement as normal message logs, but will only send message reactions. If you don't want twemojis to be logged you can toggle `events.twemoji-reactions`.",
		settingsChannelsRoles: 'The channel for the reaction roles.',
		settingsChannelsSpam: 'The channel for me to redirect users to when they use commands I consider spammy.',
		settingsChannelsIgnoreMessageDelete: 'Channels I should ignore when checking for deleted messages to log.',
		settingsChannelsIgnoreMessageEdit: 'Channels I should ignore when checking for edited messags to log.',
		settingsChannelsIgnoreReactionAdd: 'Channels I should ignore when checking for added reactions.',
		settingsChannelsIgnoreAll: 'Channels I should ignore for all types of logging.',
		settingsDisabledchannels:
			'A list of channels for disabled commands, for example, setting up a channel called general will forbid all users from using my commands there. Moderators+ override this purposely to allow them to moderate without switching channels.',
		settingsEventsBanadd: 'This event posts anonymous moderation logs when a user gets banned. You must set up `channels.moderation-logs`.',
		settingsEventsBanremove: 'This event posts anonymous moderation logs when a user gets unbanned. You must set up `channels.moderation-logs`.',
		settingsEventsMemberadd: 'This event posts member logs when a user joins. They will be posted in `channels.member-logs`.',
		settingsEventsMembernameupdate: 'Whether member nickname updates should be logged or not.',
		settingsEventsMemberroleupdate: 'Whether memner role changes should be logged or not.',
		settingsEventsMemberremove: 'This event posts member logs when a user leaves. They will be posted in `channels.member-logs`.',
		settingsEventsMessagedelete:
			'This event posts message logs when a message is deleted. They will be posted in `channels.message-logs` (or `channel.nsfw-message-logs` in case of NSFW channels).',
		settingsEventsMessageedit:
			'This event posts message logs when a message is edited. They will be posted in `channels.message-logs` (or `channel.nsfw-message-logs` in case of NSFW channels).',
		settingsEventsTwemojiReactions: 'Whether or not twemoji reactions are posted in the reaction logs channel.',
		settingsMessagesFarewell: 'The message I shall send to when a user leaves. You must set up `channels.farewell` and `events.memberRemove`',
		settingsMessagesGreeting: 'The message I shall send to when a user joins. You must set up `channels.greeting` and `events.memberAdd`',
		settingsMessagesIgnorechannels: 'The channels configured to not increase the point counter for users.',
		settingsMessagesJoinDm: 'The message I shall send to when a user joins in DMs.',
		settingsMessagesModerationAutoDelete: 'Whether or not moderation commands should be auto-deleted or not.',
		settingsMessagesModerationDm: 'Whether or not I should send a direct message to the target user on moderation actions.',
		settingsMessagesModerationMessageDisplay: 'Whether or not a response should be sent for moderation commands.',
		settingsMessagesModerationReasonDisplay: 'Whether the reason will be displayed in moderation commands.',
		settingsMessagesModeratorNameDisplay:
			'Whether or not I should display the name of the moderator who took the action whne sending the target user a moderation message. Requires `messages.moderation-dm` to be enabled.',
		settingsMessagesWarnings: 'Whether or not I should send warnings to the user when they receive one.',
		settingsMessagesAnnouncementEmbed: 'Whether to send announcements in embeds or not',
		settingsMusicAllowStreams: 'Whether livestreams should be allowed to be played.',
		settingsMusicDefaultVolume: 'The default music volume to start playing at for this server.',
		settingsMusicMaximumDuration: 'The maximum length any playable single track can have.',
		settingsMusicMaximumEntriesPerUser: 'The maximum amount of entries one user can have in the queue.',
		settingsNoMentionSpamAlerts: 'Whether or not users should be alerted when they are about to get the ban hammer.',
		settingsNoMentionSpamEnabled: 'Whether or not I should have the ban hammer ready for mention spammers.',
		settingsNoMentionSpamMentionsallowed:
			'The minimum amount of "points" a user must accumulate before landing the hammer. A user mention will count as 1 point, a role mention as 2 points, and an everyone/here mention as 5 points.',
		settingsNoMentionSpamTimeperiod:
			'The amount of time in seconds in which the mention bucket should refresh. For example, if this is set to `8` and you mentioned two users 7 seconds apart, the bucket would run from start with the accumulated amount of points.',
		settingsRolesAdmin: `The administrator role, their priviledges in Skyra will be upon moderative, covering management. Defaults to anyone with the ${this.PERMISSIONS.MANAGE_GUILD} permission.`,
		settingsRolesDj: "The DJ role for this server. DJs have more advanced control over Skyra's music commands.",
		settingsRolesInitial: 'The initial role, if configured, I will give it to users as soon as they join.',
		settingsRolesModerator:
			'The moderator role, their priviledges will cover almost all moderation commands. Defaults to anyone who can ban members.',
		settingsRolesMuted: 'The muted role, if configured, I will give new muted users this role. Otherwise I will prompt you the creation of one.',
		settingsRolesPublic: 'The public roles, they will be given with no cost to any user using the `roles` command.',
		settingsRolesRemoveinitial: 'Whether the claim of a public role should remove the initial one too.',
		settingsRolesRestrictedAttachment: 'The role that is used for the restrictAttachment moderation command',
		settingsRolesRestrictedEmbed: 'The role that is used for the restrictEmbed moderation command.',
		settingsRolesRestrictedEmoji: 'The role that is used for the restrictEmoji moderation command.',
		settingsRolesRestrictedReaction: 'The role that is used for the restrictReaction moderation command.',
		settingsRolesRestrictedVoice: 'The role that is used for the restrictVoice moderation command.',
		settingsRolesSubscriber:
			"The subscriber role. This role will be mentioned every time you use the `announce` command. I will always keep it non-mentionable so people don't mention it abusively.",
		settingsSelfmodAttachmentsEnabled: 'Whether or not the attachment filter is enabled.',
		settingsSelfmodAttachmentsIgnoredChannels: 'The channels that will be ignored by the attachments filter sub-system',
		settingsSelfmodAttachmentsIgnoredRoles: 'The roles that will be ignored by the attachments afilters sub-system',
		settingsSelfmodCapitalsEnabled: 'Whether the capitals filter selfmod sub-system is enabled or not.',
		settingsSelfmodCapitalsIgnoredchannels: 'The channels that will be ignored by the capitals filter sub-system',
		settingsSelfmodCapitalsIgnoredroles: 'The roles that will be ignored by the capitals afilters sub-system',
		settingsSelfmodCapitalsMaximum:
			'The maximum amount of characters the messages must have before trying to delete it. You must enable it with the `capitalsMode` command.',
		settingsSelfmodCapitalsMinimum:
			'The minimum amount of characters the message must have before trying to delete it. You must enable it with the `capitalsMode` command.',
		settingsSelfmodFilterEnabled: 'Whether the word filter selfmod sub-system is enabled or not.',
		settingsSelfmodFilterIgnoredchannels: 'The channels that will be ignored by the filters sub-system',
		settingsSelfmodFilterIgnoredroles: 'The roles that will be ignored by the filters sub-system',
		settingsSelfmodIgnorechannels:
			'The channels I will ignore, be careful any channel configured will have all auto-moderation systems (CapsFilter, InviteLinks, and NoMentionSpam) deactivated.',
		settingsSelfmodInvitesEnabled: 'Whether the invites filter selfmod sub-system is enabled or not.',
		settingsSelfmodInvitesIgnoredchannels: 'The channels that will be ignored by the invites sub-system',
		settingsSelfmodInvitesIgnoredroles: 'The roles that will be ignored by the invites sub-system',
		settingsSelfmodInvitesIgnoredcodes: 'The Discord invite codes that will be ignored by the invites sub-system',
		settingsSelfmodInvitesIgnoredguilds: 'The Discord servers that will be ignored by the invites sub-system',
		settingsSelfmodLinksEnabled: 'Whether the links filter selfmod sub-system is enabled or not.',
		settingsSelfmodLinksIgnoredchannels: 'The channels that will be ignored by the links filter sub-system',
		settingsSelfmodLinksIgnoredroles: 'The roles that will be ignored by the links filters sub-system',
		settingsSelfmodLinksWhitelist: 'The whitelisted links that are allowed',
		settingsSelfmodMessagesEnabled: 'Whether Skyra should attempt to remove duplicated messages or not.',
		settingsSelfmodMessagesIgnoredchannels: 'The channels that will be ignored by the duplicate messages sub-system',
		settingsSelfmodMessagesIgnoredroles: 'The roles that will be ignored by the duplicate messages sub-system',
		settingsSelfmodMessagesMaximum:
			'The amount of duplicated messages required in the queue before taking action The queue size is configurable in `selfmod.messages.queue-size`.',
		settingsSelfmodMessagesQueueSize: 'The amount of messages Skyra will keep track of for the message duplication detection.',
		settingsSelfmodNewlinesEnabled: 'Whether the new lines filter selfmod sub-system is enabled or not.',
		settingsSelfmodNewlinesIgnoredchannels: 'The channels that will be ignored by the new lines sub-system',
		settingsSelfmodNewlinesIgnoredroles: 'The roles that will be ignored by the new lines sub-system',
		settingsSelfmodNewlinesMaximum: 'The maximum amount of new lines before Skyra will start applying penalties',
		settingsSelfmodReactionsMaximum: 'The maximum amount of reactions before I will start applying penalties',
		settingsSelfmodReactionsBlacklist: 'The reactions that are blacklisted',
		settingsSelfmodReactionsEnabled: 'Whether the reactions filter selfmod sub-system is enabled or not.',
		settingsSelfmodReactionsIgnoredchannels: 'The channels that will be ignored by the reactions sub-system',
		settingsSelfmodReactionsIgnoredroles: 'The roles that will be ignored by the reactons sub-system',
		settingsSelfmodReactionsWhitelist: 'The reactions that are whitelisted',
		settingsSocialEnabled: 'Whether the social module should be enabled or not',
		settingsSocialMultiplier: 'The multiplier to apply to the gain of points for users',
		settingsSocialAchieve: 'Whether or not I should congratulate people who get a new leveled role.',
		settingsSocialAchievemessage:
			'The congratulation message for people when they get a new leveled role. Requires `social.achieve` to be enabled.',
		settingsSocialIgnorechannels: 'The channels I should ignore when adding points.',
		settingsStarboardChannel:
			'The starboard channel. If you star a message, it will be posted there. Using the `setStarboardEmoji` command allows the emoji customization.',
		settingsStarboardIgnorechannels: 'The channels I should ignore when listening for new stars.',
		settingsStarboardMinimum: 'The minimum amount of stars required before a message is posted to the starboard channel.',
		settingsStarboardSelfstar: "Whether the author's reaction should be included in the total star count",
		settingsSuggestionsChannel: 'The channel where suggestions will be sent.',
		settingsSuggestionsEmojisUpvote: 'The upvote emoji Skyra reacts with on every suggestion.',
		settingsSuggestionsEmojisDownvote: 'The downvote emoji Skyra reacts with on every suggestion.',
		settingsSuggestionsOnActionDm: "If this setting is enabled, Skyra will DM the suggestion's author every time it is updated.",
		settingsSuggestionsOnActionRepost:
			"If this setting is enabled, Skyra will repost the suggestion's message every time it is updated. If it is disabled, it will edit the original message.",
		settingsSuggestionsOnActionHideAuthor:
			"This setting allows you to update suggestions anonymously. It will substitute the updater's name with either `An administrator` or `A moderator`, according to their permission level.",
		settingsDashboardOnlyKey: 'This key can only be configured through [the web dashboard](https://skyra.pw)',

		/**
		 * ################
		 * ANIMALS COMMANDS
		 */

		commandCatfactDescription: 'Let me tell you a mysterious cat fact.',
		commandCatfactExtended: {
			extendedHelp: `Do **you** know cats are very curious, right? They certainly have a lot of fun and weird facts.
				This command queries catfact.ninja and retrieves a fact so you can read it.`
		},
		commandDogDescription: 'Cute doggos! ❤',
		commandDogExtended: {
			extendedHelp: [
				'Do **you** know how cute dogs are? They are so beautiful!',
				'This command uses [dog.ceo](https://dog.ceo) to show pictures of the cuttest doggos!'
			]
		},
		commandFoxDescription: 'Let me show you an image of a fox!',
		commandFoxExtended: {
			extendedHelp: 'This command gives a random image from [randomfox.ca](https://randomfox.ca/)'
		},
		commandKittyDescription: 'KITTENS!',
		commandKittyExtended: {
			extendedHelp: [
				'Do **you** know how cute are kittens? They are so beautiful!',
				'This command uses [cataas.com](https://cataas.com/) to show pictures of the cuttest cats!'
			]
		},
		commandShibeDescription: 'Cute shibas!',
		commandShibeExtended: {
			extendedHelp: "Everyone loves shibas, I shall love them aswell! They're so adorable ❤."
		},

		/**
		 * ##############
		 * ANIME COMMANDS
		 */

		commandAnimeDescription: 'Search your favourite anime by title with this command.',
		commandAnimeExtended: {
			extendedHelp: 'This command queries Kitsu.io to show data for the anime you request.',
			explainedUsage: [['query', "The anime's name you are looking for."]],
			examples: ['One Piece']
		},
		commandMangaDescription: 'Search your favourite manga by title with this command.',
		commandMangaExtended: {
			extendedHelp: 'This command queries Kitsu.io to show data for the manga you request.',
			explainedUsage: [['query', "The manga's name you are looking for."]],
			examples: ['Stone Ocean', 'One Piece']
		},
		commandWaifuDescription: 'Posts a randomly generated waifu image.',
		commandWaifuExtended: {
			extendedHelp: 'This commands posts a random waifu generated by <https://thiswaifudoesnotexist.net/>'
		},

		/**
		 * #####################
		 * ANNOUNCEMENT COMMANDS
		 */

		commandAnnouncementDescription: 'Send new announcements, mentioning the announcement role.',
		commandAnnouncementExtended: {
			extendedHelp: [
				'This command requires an announcement channel (**channels.announcement** in the configuration command) which tells Skyra where she should post the announcement messages.',
				'',
				'Question is, is this command needed? Well, nothing stops you from making your announcements by yourself, however, there are many people who hate being mentioned by at everyone/here.',
				'',
				'To avoid this, Skyra gives you the option of creating a subscriber role, which is unmentionable (to avoid people spam mentioning the role), and once you run this command, Skyra will set the role to be mentionable, post the message, and back to unmentionable.',
				'',
				'Furthermore, you can configure Skyra to send the announcement as a message embed by setting the **messages.announcement-embed** option in the configuration command. When sending the message as an an embed you can exclude the mentions of any users, @here or @everyone by providing the `--excludeMentions` flag to the announcement.'
			],
			explainedUsage: [['announcement', 'The announcement text to post.']],
			examples: ['I am glad to announce that we have a bot able to safely send announcements for our subscribers!'],
			reminder:
				'If you want to edit the message you send in an announcement, just edit the message you used to have Skyra send that announcement. Skyra will then edit the message she sent previously. She can do this up to 15 minutes after the initial announcement, so be sure to not wait long!',
			multiline: true
		},
		commandSubscribeDescription: "Subscribe to this server's announcements.",
		commandSubscribeExtended: {
			extendedHelp:
				"This command serves the purpose of **giving** you the subscriber role, which must be configured by the server's administrators. When a moderator or administrator use the **announcement** command, you will be mentioned. This feature is meant to replace everyone/here tags and mention only the interested users."
		},
		commandUnsubscribeDescription: "Unsubscribe from this server's announcements.",
		commandUnsubscribeExtended: {
			extendedHelp:
				"This command serves the purpose of **removing** you the subscriber role, which must be configured by the server's administrators. When a moderator or administrator use the **announcement** command, you will **not longer** be mentioned. This feature is meant to replace everyone/here tags and mention only the interested users."
		},

		/**
		 * ############
		 * FUN COMMANDS
		 */

		command8ballDescription: 'Skyra will read the Holy Bible to find the correct answer for your question.',
		command8ballExtended: {
			extendedHelp: "This command provides you a random question based on your questions' type. Be careful, it may be too smart.",
			explainedUsage: [['question', 'The Holy Question']],
			examples: ['Why did the chicken cross the road?']
		},
		commandChoiceDescription: 'Eeny, meeny, miny, moe, catch a tiger by the toe...',
		commandChoiceExtended: {
			extendedHelp:
				'I have an existencial doubt... should I wash the dishes or throw them through the window? The search continues. List me items separated by comma and I will choose one them. On a side note, I am not responsible of what happens next.',
			explainedUsage: [['words', 'A list of words separated by comma.']],
			examples: ['Should Wash the dishes, Throw the dishes out the window', 'Cat, Dog']
		},
		commandChangemymindDescription: 'Skyra is the best, change my mind.',
		commandChangemymindExtended: {
			extendedHelp: "I still think I'm the best, change my mind. I make a photo with your avatar and some text in some paper.",
			explainedUsage: [['text', 'The phrase you want.']],
			examples: ['Skyra is the best bot in this server']
		},
		commandDiceDescription: 'Roll the dice using d20 syntax.',
		commandDiceExtended: {
			extendedHelp:
				"The mechanics of this command are easy. You have a dice, then you roll it __x__ times, but the dice can also be configured to have __y__ sides. By default, this command rolls a dice with 6 sides once. However, you can change the amount of rolls for the dice, and this command will 'roll' (get a random number between 1 and the amount of sides). For example, rolling a dice with 6 sides 3 times will leave a random sequence of three random numbers between 1 and 6, for example: 3, 1, 6; And this command will return 10 as output.",
			examples: ['370d24', '100d6', '6']
		},
		commandEscaperopeDescription: 'Use the escape rope from Pokemon.',
		commandEscaperopeExtended: {
			extendedHelp: '**Skyra** used **Escape Rope**.'
		},
		commandHowToFlirtDescription: 'Captain America, you do not know how to flirt.',
		commandHowToFlirtExtended: {
			extendedHelp:
				"Let me show you how to effectively flirt with somebody using the Tony Stark's style for Captain America, I can guarantee that you'll get him.",
			explainedUsage: [['user', 'The user to flirt with.']],
			examples: ['Skyra']
		},
		commandLoveDescription: 'Lovemeter, online!',
		commandLoveExtended: {
			extendedHelp: "Hey! Wanna check the lovemeter? I know it's a ridiculous machine, but many humans love it! Don't be shy and try it!",
			explainedUsage: [['user', 'The user to rate.']],
			examples: ['Skyra']
		},
		commandMarkovDescription: 'Generate a Markov Chain from the text channel.',
		commandMarkovExtended: {
			extendedHelp:
				'A Markov chain is a stocha... what? Okay, something something a probability theory made by a Russian mathematician, check Wikipedia for more information. **In short**: I will generate a random message given the content of the messages in the channel.'
		},
		commandNorrisDescription: "Enjoy your day reading Chuck Norris' jokes.",
		commandNorrisExtended: {
			extendedHelp:
				"Did you know that Chuck norris does **not** call the wrong number, but you **answer** the wrong phone? Woah, mindblow. He also threw a carton of milk and created the Milky Way. This command queries chucknorris.io and retrieves a fact (do not assume they're false, not in front of him) so you can read it"
		},
		commandRateDescription: 'Let bots have opinions and rate somebody.',
		commandRateExtended: {
			extendedHelp:
				"Just because I am a bot doesn't mean I cannot rate you properly. I can grade you with a random number generator to ease the process. Okay okay, it's not fair, but I mean... I can also give you a 💯.",
			explainedUsage: [['user', 'The user to rate.']],
			examples: ['Skyra', 'me']
		},
		commandXkcdDescription: 'Read comics from XKCD.',
		commandXkcdExtended: {
			extendedHelp:
				"**xkcd** is an archive for nerd comics filled with math, science, sarcasm and languages. If you don't provide any argument, I will get a random comic from xkcd. If you provide a number, I will retrieve the comic with said number. But if you provide a title/text/topic, I will fetch a comic that matches with your input and display it. For example, `Skyra, xkcd Curiosity` will show the comic number 1091.",
			explainedUsage: [['query', 'Either the number of the comic, or a title to search for.']],
			examples: ['1091', 'Curiosity']
		},
		commandPunDescription: 'Shows you a random pun.',
		commandPunExtended: {
			extendedHelp: [
				'A steak pun is a rare medium well done.',
				'Get your daily doses of dad jokes from icanhazdadjoke.com and laugh at witty wisecracks.'
			],
			multiline: true
		},
		commandWakandaDescription: "Helpful descriptions? We don't do that here",
		commandWakandaExtended: {
			extendedHelp:
				"Creates an image macro using the [We Don't Do That Here Meme](https://knowyourmeme.com/memes/we-dont-do-that-here) using the given user."
		},
		/**
		 * ################
		 * GAME INTEGRATION COMMANDS
		 */

		commandBrawlstarsDescription: "Get data on a player or club from Supercell's newest game, Brawl Stars.",
		commandBrawlstarsExtended: {
			extendedHelp: 'Use this command with --save to save your player/club tag.',
			explainedUsage: [
				['category', 'The category of data to get: **club** to get data on a club, or **player** to get data on a player (default).'],
				['query', 'The tag of the player or club, depending on which category you choose.']
			],
			examples: ['player #RJQLQ999', 'club #228JVRQC9']
		},
		commandBrawlstarsPlayerEmbedTitles: {
			trophies: 'Trophies',
			events: 'Events',
			exp: 'Experience',
			gamesModes: 'Game Modes',
			other: 'Other'
		},
		commandBrawlstarsPlayerEmbedFields: {
			total: 'Total',
			personalBest: 'Personal Best',
			events: 'Events',
			roboRumble: 'Best Robo Rumble Rank',
			qualifiedForChamps: 'Qualified for Championship',
			experienceLevel: 'Experience Level',
			victories3v3: '3v3 Victories',
			victoriesSolo: 'Solo Victories',
			victoriesDuo: 'Duo Victories',
			club: 'Club',
			brawlersUnlocked: 'Brawlers Unlocked'
		},
		commandBrawlstarsClubEmbedTitles: {
			totalTrophies: 'Total Trophies',
			averageTrophies: 'Average Trophies',
			requiredTrophies: 'Required Trophies',
			members: 'Members',
			type: 'Type',
			top5Members: 'Top 5 Members',
			president: 'President'
		},
		commandBrawlstarsClubEmbedFields: {
			noPresident: 'No President'
		},
		commandClashofclansDescription: 'Get data on a player or clan in the popular mobile game Clash of Clans',
		commandClashofclansExtended: {
			extendedHelp: 'The request for clans will try to return multiple possible responses.',
			explainedUsage: [
				['category', 'The category of data to get: **clan** to get data on a clan or **player** to get data on a player.'],
				['query', 'Either a clan name or player tag depending on the category you chose.']
			],
			examples: ['player #8GQPJG2CL', 'clan Hog Raiders Swe']
		},
		commandClashofclansPlayerEmbedTitles: {
			xpLevel: 'XP level',
			builderHallLevel: 'Builder Hall level',
			townhallLevel: 'Town Hall level',
			townhallWeaponLevel: 'Town Hall weapon level',

			trophies: 'Current trophies',
			bestTrophies: 'Best trophies',
			warStars: 'War stars',

			attackWins: 'Wins attacking',
			defenseWins: 'Wins defending',
			amountOfAchievements: 'Amount of achievements',

			versusTrophies: 'Current versus trophies',
			bestVersusTrophies: 'Best versus trophies',
			versusBattleWins: 'Versus battle wins',

			clanRole: 'Clan role',
			clanName: 'Clan name',
			leagueName: 'League name',
			noTownhallWeaponLevel: 'Town Hall has no weapon level',
			noRole: 'This player has no clan role',
			noClan: 'This player is not in a clan',
			noLeague: 'This user is not in any league'
		},
		commandClashofclansClanEmbedTitles: {
			clanLevel: 'Clan level',
			clanPoints: 'Clan points',
			clanVersusPoints: 'Clan versus points',
			amountOfMembers: 'Amount of members',
			description: 'Description',
			locationName: 'Location name',
			warFrequency: 'War frequency',
			warWinStreak: 'War win streak',
			warWins: 'Total war wins',
			warTies: 'Total war ties',
			warLosses: 'Total war losses',
			warLogPublic: 'War log is public?',
			unknown: 'Unknown',
			warFrequencyDescr: {
				moreThanOncePerWeek: 'More than once per week',
				always: 'Always',
				lessThanOncePerWeek: 'Less than once per week',
				oncePerWeek: 'Once per week',
				unknown: 'Unknown'
			}
		},
		commandBrawlStarsInvalidPlayerTag: ({ playertag }) =>
			`I am sorry, \`${playertag}\` is not a valid Clash of Clans player tag. Player tags have to start with a \`#\` followed by the ID.`,
		commandBrawlStarsClansQueryFail: ({ clan }) => `I am sorry, but I was unable to get data on the clan \`${clan}\`.`,
		commandBrawlStarsPlayersQueryFail: ({ playertag }) =>
			`I am sorry, but I was unable to get data on the player with player tag \`${playertag}\`.`,
		commandClashofclansInvalidPlayerTag: ({ playertag }) =>
			`I am sorry, \`${playertag}\` is not a valid Clash of Clans player tag. Player tags have to start with a \`#\` followed by the ID.`,
		commandClashOfClansClansQueryFail: ({ clan }) => `I am sorry, but I was unable to get data on the clan \`${clan}\`.`,
		commandClashofclansPlayersQueryFail: ({ playertag }) =>
			`I am sorry, but I was unable to get data on the player with player tag \`${playertag}\`.`,
		commandFFXIVDescription: 'Queries the Final Fantasy 14 API for game data',
		commandFFXIVExtended: {
			extendedHelp: [
				'This command allows you to character and item data for FFXIV.',
				'For item a wildcard search is performed so if your term is in the middle of the name it can still match.'
			],
			explainedUsage: [
				['search type', '(optional, defaults to `character`) `character` or `item`'],
				['query', 'The player or thing to search.']
			],
			examples: ['character Laytlan Ardevon', 'Laytlan Ardevon', 'item potion'],
			multiline: true
		},
		commandFFXIVCharacterFields: {
			serverAndDc: 'Server - Datacenter',
			tribe: 'Tribe',
			characterGender: 'Character gender',
			nameday: 'Nameday',
			guardian: 'Guardian',
			cityState: 'City-State',
			grandCompany: 'Grand Company',
			rank: 'Rank',
			none: 'None',
			male: 'Male',
			female: 'Female',
			dowDomClasses: '***__Disciple of War and Magic classes__***:',
			tank: 'Tank',
			healer: 'Healer',
			meleeDps: 'Melee DPS',
			physicalRangedDps: 'Physical Ranged DPS',
			magicalRangedDps: 'Magical Ranged DPS',
			dohClasses: '***__Disciple of the Hand jobs__***:',
			dolClasses: '***__Disciple of the Land jobs__***:'
		},
		commandFFXIVItemFields: {
			kind: 'Kind',
			category: 'Category',
			levelEquip: 'Level equippable',
			none: 'None'
		},
		commandFFXIVNoCharacterFound: `${REDCROSS} I am sorry, but I was unable to find a character with that name.`,
		commandFFXIVInvalidServer: `${REDCROSS} I am sorry, but an invalid server name was passed.`,
		commandFFXIVNoItemFound: `${REDCROSS} I am sorry, but I was unable to find an item with that query.`,
		commandFortniteDescription: 'Gets player statistics for a Fortnite player',
		commandFortniteExtended: {
			extendedHelp: 'This command retrieves statistics for any Fortnite player that plays on PC, Xbox or Playstation',
			explainedUsage: [
				['platform', '(optional, defaults to `pc`) Platform the player plays on, one of `pc`, `xbox`, or `psn`.'],
				['player', 'The Epic Games username of the player.']
			],
			examples: ['ninja', 'pc ninja', 'xbox TTV R1xbox', 'psn TTV IllusionOG']
		},
		commandFortniteNoUser:
			'I am sorry, but I was unable to find a user with that name.\nAre you sure that they play on the provided platform? (PC [default], Xbox or PSN are supported)',
		commandFortniteEmbedTitle: ({ epicUserHandle }) => `Fortnite player statistics for ${epicUserHandle}`,
		commandFortniteEmbedSectionTitles: {
			lifetimeStats: '**_Lifetime Stats_**',
			solos: '**_Solos_**',
			duos: '**_Duos_**',
			squads: '**_Squads_**'
		},
		commandFortniteEmbedStats: ({
			winCount,
			killCount,
			kdrCount,
			matchesPlayedCount,
			top1Count,
			top3Count,
			top5Count,
			top6Count,
			top10Count,
			top12Count,
			top25Count
		}) => ({
			wins: `Wins: **\`${winCount}\`**`,
			kills: `Kills: **\`${killCount}\`**`,
			kdr: `KDR: **\`${kdrCount}%\`**`,
			matchesPlayed: `Matches played: **\`${matchesPlayedCount}\`**`,
			top1s: `Top 1s: **\`${top1Count}\`**`,
			top3s: `Top 3s: **\`${top3Count}\`**`,
			top5s: `Top 5s: **\`${top5Count}\`**`,
			top6s: `Top 6s: **\`${top6Count}\`**`,
			top10s: `Top 10s: **\`${top10Count}\`**`,
			top12s: `Top 12s: **\`${top12Count}\`**`,
			top25s: `Top 25s: **\`${top25Count}\`**`
		}),
		commandOverwatchDescription: 'Gets player statistics for an Overwatch player',
		commandOverwatchExtended: {
			extendedHelp: [
				'This command retrieves statistics for any Overwatch player that plays on PC, Xbox or Playstation.',
				'By default it will look at PC players, if you want to check for Xbox or Playstation players then set the platform to `xbl` or `psn` respectively.'
			],
			explainedUsage: [
				['platform', '(optional, defaults to `pc`) Platform the player plays on, one of `pc`, `xbl`, or `psn`'],
				['player', 'For PC the full blizzard tag, for console the username. Case sensitive!']
			],
			examples: ['bame#1784', 'xbl Dorus NL gamer', 'psn decoda_24'],
			reminder: '**Player names are case sensitive!**',
			multiline: true
		},
		commandOverwatchInvalidPlayerName: ({ playerTag }) =>
			`\`${playerTag}\` is an invalid player name\nFor PC it has to be their full Blizzard BattleTag, for example \`bame#1784\`.\nFor Xbox and Playstation it just has to be their username.`,
		commandOverwatchQueryFail: ({ player, platform }) =>
			`Failed to get data for \`${player}\`, are you sure they play on \`${platform}\`?\nAlso make sure to get the casing right, names are case sensitive.`,
		commandOverwatchNoStats: ({ player }) => `I found a player with the tag \`${player}\` but no stats were available for them.`,
		commandOverwatchNoAverage: 'Not enough data to determine average.',
		commandOverwatchEmbedDataStats: ({
			finalBlows,
			deaths,
			damageDone,
			healing,
			objectiveKills,
			soloKills,
			playTime,
			gamesWon,
			goldenMedals,
			silverMedals,
			bronzeMedals
		}) => ({
			finalBlows: `**Final blows:** ${this.groupDigits(finalBlows)}`,
			deaths: `**Deaths:** ${this.groupDigits(deaths)}`,
			damageDealt: `**Damage dealt:** ${this.groupDigits(damageDone)}`,
			healing: `**Healing:** ${this.groupDigits(healing)}`,
			objectiveKills: `**Objective kills:** ${this.groupDigits(objectiveKills)}`,
			soloKills: `**Solo kills:** ${this.groupDigits(soloKills)}`,
			playTime: `**Playtime:** ${this.duration(playTime, 2)}`,
			gamesWon: `**Games won:** ${this.groupDigits(gamesWon)}`,
			goldenMedals: `**Gold medals earned:** ${this.groupDigits(goldenMedals)}`,
			silverMedals: `**Silver medals earned:** ${this.groupDigits(silverMedals)}`,
			bronzeMedals: `**Bronze medals earned:** ${this.groupDigits(bronzeMedals)}`
		}),
		commandOverwatchEmbedDataTopHero: ({ name, playTime }) => `**${toTitleCase(name)}** (${playTime})`,
		commandOverwatchEmbedData: ({ authorName, playerLevel, prestigeLevel, totalGamesWon }) => ({
			title: 'Click here for more details on overwatchtracker.com',
			ratingsTitle: 'Ratings',
			author: `Overwatch Player Statistics for ${authorName}`,
			playerLevel: `**Player level:** ${this.groupDigits(playerLevel)}`,
			prestigeLevel: `**Prestige level:** ${this.groupDigits(prestigeLevel)}`,
			totalGamesWon: `**Total games won:** ${this.groupDigits(totalGamesWon)}`,
			noGamesWon: `**Total games won:** ${this.language.globalNone}`,
			headers: {
				account: '__Account Stats__',
				quickplay: '__Quickplay Stats__',
				competitive: '__Competitive Stats__',
				topHeroesQuickplay: '__Top Heroes Quickplay__',
				topHeroesCompetitive: '__Top Heroes Competitive__'
			}
		}),

		/**
		 * ################
		 * GENERAL COMMANDS
		 */

		commandSupportDescription: 'Show support instructions',
		commandSupportExtended: {
			extendedHelp: "This command gives you a link to *Skyra's Lounge*, the best place for everything related to me."
		},

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		commandCreateMuteDescription: 'Prepare the mute system.',
		commandCreateMuteExtended: {
			extendedHelp: `This command prepares the mute system by creating a role called 'muted', and configuring it to the guild settings. This command also modifies all channels (where possible) permissions and disables the permission **${this.PERMISSIONS.SEND_MESSAGES}** in text channels and **${this.PERMISSIONS.CONNECT}** in voice channels for said role.`
		},
		commandGiveawayDescription: 'Start a new giveaway.',
		commandGiveawayExtended: {
			extendedHelp: [
				'This command is designed to manage giveaways. You can start them with this command by giving it the time and a title.',
				'',
				'When a giveaway has been created, I will send a giveaway message and react to it with 🎉 so the members of the server can participate on it.',
				'',
				'You can pass a flag of `--winners=Xw`, wherein X is a number (for example 2w for 2 winners) to allow multiple people to win a giveaway.',
				'Please note that there is a maximum of 25 winners.'
			],
			explainedUsage: [
				['channel', '(Optional) The channel in which to start the giveaway'],
				['time', 'The time the giveaway should last.'],
				['title', 'The title of the giveaway.']
			],
			examples: ['6h A hug from Skyra.', '60m 5w A mysterious Steam game', '1d Free Discord Nitro! --winners=2w'],
			multiline: true
		},
		commandGiveawayRerollDescription: 'Re-roll the winners from a giveaway.',
		commandGiveawayRerollExtended: {
			extendedHelp: `This command is designed to re-roll finished giveaways. Please check \`Skyra, help gstart\` for more information about creating one.`,
			explainedUsage: [
				['winners', 'The amount of winners to pick.'],
				['message', 'The message to target. Defaults to last giveaway message.']
			],
			examples: ['', '633939404745998346', '5', '5 633939404745998346']
		},
		commandGiveawayScheduleDescription: 'Schedule a giveaway to start at a certain time.',
		commandGiveawayScheduleExtended: {
			extendedHelp: [
				'This command prepares a giveaway to start at a certain time if you do not wish to start it immediately.',
				'You can pass a flag of `--winners=X`, wherein X is a number, to allow multiple people to win this giveaway.',
				'Please note that there is a maximum of 25 winners.'
			],
			explainedUsage: [
				['channel', '(Optional) The channel in which to start the giveaway'],
				['schedule', 'The time to wait before starting the giveaway.'],
				['time', 'The time the giveaway should last.'],
				['title', 'The title of the giveaway.']
			],
			examples: ['30m 6h A hug from Skyra.'],
			multiline: true
		},

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		commandNickDescription: "Change Skyra's nickname for this server.",
		commandNickExtended: {
			extendedHelp: "This command allows you to change Skyra's nickname easily for the server.",
			reminder: `This command requires the **${this.PERMISSIONS.CHANGE_NICKNAME}** permission. Make sure Skyra has it.`,
			explainedUsage: [['nick', "The new nickname. If you don't put any, it'll reset it instead."]],
			examples: ['SkyNET', 'Assistant', '']
		},
		commandPermissionNodesDescription: 'Configure the permission nodes for this server.',
		commandPermissionNodesExtended: {
			extendedHelp: [
				'Permission nodes are per-user and per-role overrides. They are used when the built-in permissions system is not enough.',
				'For example, in some servers they want to give a staff role the permissions to use mute and warn, but not ban and others (reserved to moderators), and only warn is available for the configurable staff-level permission, so you can tell me to allow the mute command for the staff role now.'
			],
			explainedUsage: [
				['action', 'Either `add`, `remove`, `reset`, or `show`. Defaults to `show`.'],
				['target', 'Either a role name or a user name, allowing IDs and mentions for either.'],
				['type', 'Either `allow` or `deny`. This is ignored when `action` is not `add` nor `remove`.'],
				['command', 'The name of the command to allow or deny. This is ignored when `action` is not `add` nor `remove`.']
			],
			examples: ['add staff allow warn', 'add moderators deny ban', 'remove staff allow warn', 'reset staff', 'show staff'],
			reminder: 'The server owner cannot have any actions, nor the `everyone` role can have allowed commands.',
			multiline: true
		},
		commandTriggersDescription: 'Set custom triggers for your guild!.',
		commandTriggersExtended: {
			extendedHelp: [
				'This command allows administrators to go further with the personalization of Skyra in the guild!.',
				'A trigger is a piece that can active other functions.',
				'For example, the aliases are triggers that get executed when the command does not exist in bot, triggering the unknown command event.',
				'When this happens, the alias system executes and tries to find an entry that matches with the input.'
			],
			reminder: `This command requires the **${this.PERMISSIONS.ADD_REACTIONS}** permission so it can test reactions. Make sure Skyra has it.`,
			explainedUsage: [
				['list', 'List all current triggers.'],
				['add <type> <input> <output>', 'Add a new trigger given a type, input and output.'],
				['remove <type> <input>', 'Remove a trigger given the type and input.']
			],
			examples: ['', 'list', 'add reaction "good night" 🌛', 'remove reaction "good night"'],
			multiline: true
		},

		/**
		 * #################################
		 * MANAGEMENT/CONFIGURATION COMMANDS
		 */

		commandManagecommandautodeleteDescription: 'Manage per-channel autodelete timer.',
		commandManagecommandautodeleteExtended: {
			extendedHelp:
				"This command manages this guild's per-channel command autodelete timer, it serves well to leave a channel clean from commands.",
			explainedUsage: [
				['show', 'Show the autodelete timer for all channels.'],
				['add [channel] <command>', 'Add an autodelete timer for the specified channel.'],
				['remove [channel]', 'Remove the autotimer from the specified channel.'],
				['reset', 'Clear all autodelete timers.']
			],
			reminder: "The channel argument is optional, defaulting to the message's channel, but it uses fuzzy search when possible.",
			examples: ['show', 'add #general 4s', 'remove #general', 'reset']
		},
		commandManageCommandChannelDescription: 'Manage per-channel command blacklist.',
		commandManageCommandChannelExtended: {
			extendedHelp:
				"This command manages this guild's per-channel command blacklist, it serves well to disable certain commands you do not want to be used in certain channels (to disable a command globally, use the `disabledCommands` settings key to disable in all channels.",
			explainedUsage: [
				['show [channel]', 'Show the command blacklist for the selected channel.'],
				['add [channel] <command>', "Add a command to the specified channel's command blacklist."],
				['remove [channel] <command>', "Remove a command to the specified channel's command blacklist."],
				['reset [channel]', 'Clear the command blacklist for the specified channel.']
			],
			reminder: 'The channel argument is optional, but it uses fuzzy search when possible.',
			examples: ['show', 'add #general profile', 'remove #general profile', 'reset #general']
		},
		commandManageReactionRolesDescription: 'Manage the reaction roles for this server.',
		commandManageReactionRolesExtended: {
			extendedHelp: [
				'Seamlessly set up reaction roles in your server! When adding reaction roles, I listen to your reactions for 5 minutes and I bind the first reaction from you alongside the channel and the message, with the specified role.',
				"Otherwise, if a channel is specified, a prompt will not be created, and the reaction role will be bound to all of the channel's messages.",
				'',
				'The best way to add new reaction roles is by using `add @role`. If you prefer not binding the reaction to a specific message then use `add @role #channel emoji`'
			],
			explainedUsage: [
				['show', 'Retrieve the list of all reaction roles.'],
				['add <role>', 'Adds a reaction role binding the first reacted message since the execution with the role.'],
				['remove <role> <message>', 'Removes a reaction role, use `show` to get a list of them.'],
				['reset', 'Removes all reaction roles.']
			],
			multiline: true,
			examples: ['show', 'add @role', 'add @role #channel emoji', 'remove @role 123456789012345678', 'reset']
		},
		commandSetIgnoreChannelsDescription: 'Set a channel to the ignore channel list.',
		commandSetIgnoreChannelsExtended: {
			extendedHelp: [
				"This command helps you setting up ignored channels. An ignored channel is a channel where nobody but moderators can use Skyra's commands.",
				`Unlike removing the **${this.PERMISSIONS.SEND_MESSAGES}** permission, Skyra is still able to send (and therefore execute commands) messages, which allows moderators to use moderation commands in the channel.`,
				'Use this if you want to ban any command usage from the bot in a specific channel.'
			],
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
			examples: ['#general', 'here'],
			multiline: true
		},
		commandSetImageLogsDescription: 'Set the image logs channel.',
		commandSetImageLogsExtended: {
			extendedHelp: [
				'This command helps you setting up the image log channel. Whenever a member sends an image attachment, it will send an embed message with the attachment re-uploaded.',
				`All messages are in embeds so you will need to enable the permission **${this.PERMISSIONS.EMBED_LINKS}** for Skyra.`
			],
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			examples: ['#image-logs', 'here'],
			multiline: true
		},
		commandSetMemberLogsDescription: 'Set the member logs channel.',
		commandSetMemberLogsExtended: {
			extendedHelp: [
				'This command helps you setting up the member log channel. A member log channel only sends two kinds of logs: "Member Join" and "Member Leave".',
				'If a muted user joins, it will send a special "Muted Member Join" event.',
				`All messages are in embeds so you will need to enable the permission **${this.PERMISSIONS.EMBED_LINKS}** for Skyra.`,
				`You also need to individually set the "events" you want to listen: "events.memberAdd" and "events.memberRemove".`,
				'For roles, you would enable "events.memberNicknameChange" and/or "events.memberRoleUpdate" via the "config" command.'
			],
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			examples: ['#member-logs', 'here'],
			multiline: true
		},
		commandSetMessageLogsDescription: 'Set the message logs channel.',
		commandSetMessageLogsExtended: {
			extendedHelp: [
				'This command helps you setting up the message log channel. A message log channel only sends three kinds of logs: "Message Delete", "Message Edit", and "Message Prune".',
				`All messages are in embeds so you will need to enable the permission **${this.PERMISSIONS.EMBED_LINKS}** for Skyra.`,
				'You also need to individually set the "events" you want to listen: "events.messageDelete" and "events.messageEdit" via the "config" command.'
			],
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: `Due to Discord limitations, Skyra cannot know who deleted a message. The only way to know is by fetching audit logs, requiring the permission **${this.PERMISSIONS.VIEW_AUDIT_LOG}** which access is limited in the majority of guilds and the amount of times I can fetch them in a period of time.`,
			examples: ['#message-logs', 'here'],
			multiline: true
		},
		commandSetmodlogsDescription: 'Set the mod logs channel.',
		commandSetmodlogsExtended: {
			extendedHelp: [
				'This command helps you setting up the mod log channel. A mod log channel only sends case reports indexed by a number case and with "claimable" reasons and moderators.',
				'This channel is not a must and you can always retrieve specific modlogs with the "case" command.',
				`All messages are in embeds so you will need to enable the permission **${this.PERMISSIONS.EMBED_LINKS}** for Skyra.`,
				'For auto-detection, you need to individually set the "events" you want to listen: "events.banAdd", "events.banRemove" via the "config" command.'
			],
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: `Due to Discord limitations, the auto-detection does not detect kicks. You need to use the "kick" command if you want to document them as
				a formal moderation log case.`,
			examples: ['#mod-logs', 'here'],
			multiline: true
		},
		commandSetprefixDescription: "Set Skyra's prefix.",
		commandSetprefixExtended: {
			extendedHelp: [
				"This command helps you setting up Skyra's prefix. A prefix is an affix that is added in front of the word, in this case, the message.",
				'It allows bots to distinguish between a regular message and a command. By nature, the prefix between should be different to avoid conflicts.',
				"If you forget Skyra's prefix, simply mention her with nothing else and she will tell you the current prefix.",
				'Alternatively, you can prefix the commands with her name and a comma (for example `Skyra, ping`).'
			],
			explainedUsage: [['prefix', `The prefix to set. Default one in Skyra is "${this.client.options.prefix}".`]],
			reminder: 'Your prefix should only contain characters everyone can write and type.',
			examples: ['&', '='],
			multiline: true
		},
		commandSetrolechannelDescription: 'Set the role channel for role reactions.',
		commandSetrolechannelExtended: {
			extendedHelp:
				'This command sets up the role channel to lock the reactions to, it is a requirement to set up before setting up the **role message**, and if none is given, the role reactions module will not run.',
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
			examples: ['#roles', 'here']
		},
		commandSetrolemessageDescription: 'Set the role message for role reactions.',
		commandSetrolemessageExtended: {
			extendedHelp: [
				'This command sets up the role message to lock the reactions to, it requires a **role channel** to be set up first.',
				'If none is given, Skyra will listen to any reaction in the channel.',
				`Additionally, Skyra requires **${this.PERMISSIONS.READ_MESSAGE_HISTORY}** in order to fetch the message for validation.`
			],
			explainedUsage: [['message', 'An ID, they are 17-18 characters long and numeric.']],
			reminder: 'You must execute this command in the role channel.',
			examples: ['434096799847022598'],
			multiline: true
		},
		commandSetStarboardEmojiDescription: 'Set the emoji reaction for starboard.',
		commandSetStarboardEmojiExtended: {
			extendedHelp:
				'This command sets up the starboard emoji for the starboard, which is, by default, ⭐. Once this is changed, Skyra will ignore any star and will count users who reacted to said emoji.',
			explainedUsage: [['emoji', 'The emoji to set.']],
			reminder: 'Use this wisely, not everyone expects the starboard to listen to a custom emoji.',
			examples: ['⭐']
		},

		/**
		 * #################
		 * GIVEAWAY COMMANDS
		 */

		commandGiveawayRerollInvalid: 'The message ID does not exist or there is no finished giveaway.',

		/**
		 * ###########################
		 * MANAGEMENT/HELPERS COMMANDS
		 */

		commandRoleInfoDescription: 'Check the information for a role.',
		commandRoleInfoExtended: {
			extendedHelp: [
				"The roleinfo command displays information for a role, such as its id, name, color, whether it's hoisted (displays separately) or not, it's role hierarchy position, whether it's mentionable or not, how many members have said role, and its permissions.",
				'It sends an embedded message with the color of the role.'
			],
			explainedUsage: [['role', 'The role name, partial name, mention or id.']],
			examples: ['Administrator', 'Moderator', ''],
			multiline: true
		},
		commandGuildInfoDescription: 'Check the information of the guild!.',
		commandGuildInfoExtended: {
			extendedHelp: [
				'The serverinfo command displays information for the guild the message got sent.',
				'It shows the amount of channels, with the count for each category, the amount of members (given from the API), the owner with their user id, the amount of roles, region, creation date, verification level... between others.'
			],
			multiline: true
		},

		/**
		 * ###########################
		 * MANAGEMENT/MEMBERS COMMANDS
		 */

		commandStickyRolesDescription: 'Manage sticky roles for users.',
		commandStickyRolesExtended: {
			extendedHelp:
				"The stickyRoles command allows you to manage per-member's sticky roles, they are roles that are kept even when you leave, and are applied back as soon as they join.",
			explainedUsage: [
				['action', 'Either you want to check the sticky roles, add one, remove one, or remove all of them.'],
				['user', 'The user target for all the actions.'],
				['role', 'The role to add or remove.']
			],
			examples: ['add Skyra Goddess', 'show Skyra', 'remove Skyra Goddess', 'reset Skyra'],
			reminder: "The member's roles will not be modified by this command, you need to add or remove them."
		},

		/**
		 * ##################################
		 * MANAGEMENT/MESSAGE FILTER COMMANDS
		 */

		commandAttachmentsModeDescription: "Manage this guild's flags for the attachments filter.",
		commandAttachmentsModeExtended: {
			extendedHelp: ['The attachmentsMode command manages the behavior of the attachments system.'],
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			],
			multiline: true
		},
		commandCapitalsModeDescription: "Manage this guild's flags for the caps filter.",
		commandCapitalsModeExtended: {
			extendedHelp: [
				'The capitalsMode command manages the behavior of the caps system.',
				'The minimum amount of characters before filtering can be set with `Skyra, settings set selfmod.capitals.minimum <number>`.',
				'The percentage of uppercase letters can be set with `Skyra, settings set selfmod.capitals.maximum <number>`.'
			],
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			],
			multiline: true
		},
		commandFilterDescription: "Manage this guild's word blacklist.",
		commandFilterExtended: {
			extendedHelp: [
				'The filter command manages the word blacklist for this server and must have a filter mode set up, check `Skyra, help filterMode`.',
				"Skyra's word filter can find matches even with special characters or spaces between the letters of a blacklisted word, as well as it filters duplicated characters for enhanced filtering."
			],
			multiline: true
		},
		commandFilterModeDescription: "Manage this server's word filter modes.",
		commandFilterModeExtended: {
			extendedHelp: 'The filterMode command manages the behavior of the word filter system. Run `Skyra, help filter` for how to add words.',
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},
		commandInviteModeDescription: 'Manage the behavior for the invite link filter.',
		commandInviteModeExtended: {
			extendedHelp: 'The inviteMode command manages the behavior of the word filter system.',
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},
		commandLinkModeDescription: 'Manage the behavior for the link filter.',
		commandLinkModeExtended: {
			extendedHelp: 'The linkMode command manages the behavior of the link system.',
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},
		commandMessageModeDescription: 'Manage the behavior for the message filter system.',
		commandMessageModeExtended: {
			extendedHelp: 'The messageMode command manages the behavior of the message filter system.',
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},
		commandNewlineModeDescription: 'Manage the behavior for the new line filter system.',
		commandNewlineModeExtended: {
			extendedHelp: [
				'The newLineMode command manages the behavior of the new line filter system.',
				'The maximum amount of lines allowed can be set with `Skyra, settings set selfmod.newlines.maximum <number>`'
			],
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			],
			multiline: true
		},
		commandReactionModeDescription: 'Manage the behavior for the reaction filter system.',
		commandReactionModeExtended: {
			extendedHelp: 'The reactionMode command manages the behavior of the reaction filter system.',
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},

		/**
		 * #############
		 * MISC COMMANDS
		 */

		commandCuddleDescription: 'Cuddle somebody!',
		commandCuddleExtended: {
			extendedHelp:
				"Do you know something that I envy from humans? The warm feeling when somebody cuddles you. It's so cute ❤! I can imagine and draw a image of you cuddling somebody in the bed, I hope you like it!",
			explainedUsage: [['user', 'The user to cuddle with.']],
			examples: ['Skyra']
		},
		commandDeletthisDescription: '*Sees offensive post* DELETTHIS!',
		commandDeletthisExtended: {
			extendedHelp:
				"I see it! I see the hammer directly from your hand going directly to the user you want! Unless... unless it's me! If you try to tell me this, I'm going to take the MJOLNIR! Same if you do with my creator!",
			explainedUsage: [['user', 'The user that should start deleting his post.']],
			examples: ['John Doe']
		},
		commandFDescription: 'Press F to pay respects.',
		commandFExtended: {
			extendedHelp:
				'This command generates an image... to pay respects reacting with 🇫. This command also makes Skyra react the image if she has permissions to react messages.',
			explainedUsage: [['user', 'The user to pray respects to.']],
			examples: ['John Doe', 'Jake']
		},
		commandGoodnightDescription: 'Give somebody a nice Good Night!',
		commandGoodnightExtended: {
			extendedHelp: "Let me draw you giving a goodnight kiss to the person who is going to sleep! Who doesn't like goodnight kisses?",
			explainedUsage: [['user', 'The user to give the goodnight kiss.']],
			examples: ['Jake', 'DefinitivelyNotSleeping']
		},
		commandGoofytimeDescription: "It's Goofy time!",
		commandGoofytimeExtended: {
			extendedHelp:
				"IT'S GOOFY TIME! *Screams loudly in the background* NO, DAD! NO! This is a command based on the Goofy Time meme, what else would it be?",
			explainedUsage: [['user', "The user who will say IT'S GOOFY TIME!"]],
			examples: ['TotallyNotADaddy']
		},
		commandHugDescription: 'Hugs!',
		commandHugExtended: {
			extendedHelp:
				"What would be two people in the middle of the snow with coats and hugging each other? Wait! I get it! Mention somebody you want to hug with, and I'll try my best to draw it in a canvas!",
			explainedUsage: [['user', 'The user to hug with.']],
			examples: ['Bear']
		},
		commandIneedhealingDescription: "*Genji's voice* I NEED HEALING!",
		commandIneedhealingExtended: {
			extendedHelp: [
				'Do you know the worst nightmare for every single healer in Overwatch, specially for Mercy? YES!',
				'You know it, it\'s a cool cyborg ninja that looks like a XBOX and is always yelling "I NEED HEALING" loudly during the entire match.',
				"Well, don't expect so much, this command actually shows a medic with some tool in your chest."
			],
			explainedUsage: [['healer', 'The healer you need to heal you.']],
			examples: ['Mercy'],
			multiline: true
		},
		commandRandRedditDescription: 'Retrieve a random Reddit post.',
		commandRandRedditExtended: {
			extendedHelp: 'This is actually something like a Russian Roulette, you can get a good meme, but you can also get a terrible meme.',
			explainedUsage: [['reddit', 'The reddit to look at.']],
			examples: ['discordapp']
		},
		commandRedditUserDescription: 'Retrieve statistics for a Reddit user.',
		commandRedditUserExtended: {
			extendedHelp: 'Gets statistics of any given Reddit user',
			explainedUsage: [['user', 'The reddit user to look at.']],
			examples: ['GloriousGe0rge']
		},
		commandShipDescription: 'Ships 2 members',
		commandShipExtended: {
			extendedHelp: [
				'This commands generates a ship name between two users and creates more love in the world.',
				'Users are optional, you can provide none, just one or both users. For any non-provided users I will pick a random guild member.'
			],
			explainedUsage: [
				['firstUser', 'The first user to ship'],
				['secondUser', 'The second user to ship']
			],
			examples: ['romeo juliet'],
			reminder: 'If I cannot find either given user then I will pick someone randomly.',
			multiline: true
		},
		commandShipData: ({ romeoUsername, julietUsername, shipName }) => ({
			title: `**Shipping \`${romeoUsername}\` and \`${julietUsername}\`**`,
			description: `I call it... ${shipName}`
		}),
		commandChaseDescription: 'Get in here!',
		commandChaseExtended: {
			extendedHelp: 'Do you love chasing? Start chasing people now for free! Just mention or write their ID and done!',
			explainedUsage: [['pinger', 'The user who you want to chase.']],
			examples: ['IAmInnocent']
		},
		commandShindeiruDescription: 'Omae wa mou shindeiru.',
		commandShindeiruExtended: {
			extendedHelp: [
				'"You are already dead" Japanese: お前はもう死んでいる; Omae Wa Mou Shindeiru, is an expression from the manga and anime series Fist of the North Star.',
				'This shows a comic strip of the character pronouncing the aforementioned words, which makes the opponent reply with "nani?" (what?).'
			],
			explainedUsage: [['user', "The person you're telling that phrase to."]],
			examples: ['Jack'],
			multiline: true
		},
		commandPeepoloveDescription: "Generates a peepoLove image from a users' avatar.",
		commandPeepoloveExtended: {
			extendedHelp: `Allows you to generate a peepoLove image from a user's avatar.`,
			explainedUsage: [['user', 'The user that peepo should hug.']],
			examples: ['Joe'],
			reminder: 'Custom image support has been temporarily disabled, ETA on it being back is roughly November 2020'
		},
		commandSlapDescription: 'Slap another user using the Batman & Robin Meme.',
		commandSlapExtended: {
			extendedHelp: 'The hell are you saying? *Slaps*. This meme is based on a comic from Batman and Robin.',
			explainedUsage: [['user', 'The user you wish to slap.']],
			examples: ['Jake'],
			reminder: "You try to slap me and I'll slap you instead."
		},
		commandSnipeDescription: 'Retrieve the last deleted message from a channel',
		commandSnipeExtended: {
			extendedHelp: 'This just sends the last deleted message from this channel, somebody is misbehaving? This will catch them.'
		},
		commandThesearchDescription: 'Are we the only one in the universe, this man on earth probably knows.',
		commandThesearchExtended: {
			extendedHelp: 'One man on Earth probably knows if there is intelligent life, ask and you shall receive an answer.',
			explainedUsage: [['answer', 'The sentence that will reveal the truth.']],
			examples: ['Your waifu is not real.']
		},
		commandTriggeredDescription: 'I am getting TRIGGERED!',
		commandTriggeredExtended: {
			extendedHelp:
				"What? My commands are not userfriendly enough?! (╯°□°）╯︵ ┻━┻. This command generates a GIF image your avatar wiggling fast, with a TRIGGERED footer, probably going faster than I thought, I don't know.",
			explainedUsage: [['user', 'The user that is triggered.']],
			examples: ['kyra']
		},
		commandUpvoteDescription: 'Get a link to upvote Skyra in **Bots For Discord**',
		commandUpvoteExtended: {
			extendedHelp:
				'Bots For Discord is a website where you can find amazing bots for your website. If you really love me, you can help me a lot by upvoting me every 24 hours, so more users will be able to find me!'
		},
		commandVaporwaveDescription: 'Vapowave characters!',
		commandVaporwaveExtended: {
			extendedHelp:
				"Well, what can I tell you? This command turns your messages into unicode monospaced characters. That is, what humans call 'Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ'. I wonder what it means...",
			explainedUsage: [['phrase', 'The phrase to convert']],
			examples: ['A E S T H E T I C']
		},

		/**
		 * ##############################
		 * MODERATION/MANAGEMENT COMMANDS
		 */

		commandHistoryDescription: 'Display the count of moderation cases from this guild or from a user.',
		commandHistoryExtended: {
			extendedHelp: 'This command shows the amount of bans, mutes, kicks, and warnings, including temporary, that have not been appealed.',
			examples: ['', '@Pete']
		},
		commandHistoryFooterNew: ({ warnings, mutes, kicks, bans, warningsText, mutesText, kicksText, bansText }) =>
			`This user has ${warnings} ${warningsText}, ${mutes} ${mutesText}, ${kicks} ${kicksText}, and ${bans} ${bansText}`,
		commandHistoryFooterWarning: () => 'warning',
		commandHistoryFooterWarningPlural: () => 'warnings',
		commandHistoryFooterMutes: () => 'mute',
		commandHistoryFooterMutesPlural: () => 'mutes',
		commandHistoryFooterKicks: () => 'kick',
		commandHistoryFooterKicksPlural: () => 'kicks',
		commandHistoryFooterBans: () => 'ban',
		commandHistoryFooterBansPlural: () => 'bans',
		commandModerationsDescription: 'List all running moderation logs from this guild.',
		commandModerationsExtended: {
			extendedHelp: `This command shows you all the temporary moderation actions that are still running. This command uses a reaction-based menu and requires the permission **${this.PERMISSIONS.MANAGE_MESSAGES}** to execute correctly.`,
			examples: ['', '@Pete', 'mutes @Pete', 'warnings']
		},
		commandModerationsEmpty: 'Nobody has behaved badly yet, who will be the first user to be listed here?',
		commandModerationsAmount: () => 'There is 1 entry.',
		commandModerationsAmountPlural: ({ count }) => `There are ${count} entries.`,
		commandMutesDescription: 'List all mutes from this guild or from a user.',
		commandMutesExtended: {
			extendedHelp: [
				'This command shows either all mutes filed in this guild, or all mutes filed in this guild for a specific user.',
				`This command uses a reaction-based menu and requires the permission **${this.PERMISSIONS.MANAGE_MESSAGES}** to execute correctly.`
			],
			examples: ['', '@Pete'],
			multiline: true
		},
		commandWarningsDescription: 'List all warnings from this guild or from a user.',
		commandWarningsExtended: {
			extendedHelp: [
				'This command shows either all warnings filed in this guild, or all warnings filed in this guild for a specific user.',
				`This command uses a reaction-based menu and requires the permission **${this.PERMISSIONS.MANAGE_MESSAGES}** to execute correctly.`
			],
			examples: ['', '@Pete'],
			multiline: true
		},

		/**
		 * #############################
		 * MODERATION/UTILITIES COMMANDS
		 */

		commandSlowmodeDescription: "Set the channel's slowmode value in seconds.",
		commandSlowmodeExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_CHANNELS}** and will modify the channel's ratelimit per user to any value between 0 and 120 seconds.`,
			examples: ['0', 'reset', '4'],
			reminder: "To reset a channel's ratelimit per user, you can use either 0 or 'reset'."
		},

		/**
		 * ###################
		 * MODERATION COMMANDS
		 */

		commandBanDescription: 'Hit somebody with the ban hammer.',
		commandBanExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.BAN_MEMBERS}**, and only members with lower role hierarchy position can be banned by me.`,
				"No, the guild's owner cannot be banned.",
				'This action can be optionally timed to create a temporary ban.'
			],
			examples: ['@Pete', '@Pete Spamming all channels.', '@Pete Spamming all channels, for 24 hours.'],
			multiline: true
		},
		commandDehoistDescription: 'Shoot everyone with the dehoist-inator 3000',
		commandDehoistExtended: {
			extendedHelp: [
				'The act of hoisting involves adding special characters in front of your nickname in order to appear higher in the members list.',
				"This command replaces any member's nickname that includes those special characters with a special character that drags them to the bottom of the list."
			],
			reminder: `This command requires **${this.PERMISSIONS.MANAGE_NICKNAMES}**, and only members with lower role hierarchy position can be dehoisted.`,
			multiline: true
		},
		commandKickDescription: 'Hit somebody with the 👢.',
		commandKickExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.KICK_MEMBERS}**, and only members with lower role hierarchy position can be kicked by me. No, the guild's owner cannot be kicked.`,
			examples: ['@Sarah', '@Sarah Spamming general chat.']
		},
		commandLockdownDescription: 'Close the gates for this channel!',
		commandLockdownExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_CHANNELS}** in order to be able to manage the permissions for a channel.`,
				`This command removes the permission **${this.PERMISSIONS.SEND_MESSAGES}** to the \`@everyone\` role so nobody but the members with roles that have their own overrides (besides administrators, who bypass channel overrides) can send messages.`,
				'Optionally, you can pass time as second argument.'
			],
			examples: ['', '#general', '#general 5m'],
			multiline: true
		},
		commandMuteDescription: 'Mute a user in all text and voice channels.',
		commandMuteExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be muted.",
				"This action can be optionally timed to create a temporary mute. This action saves a member's roles temporarily and will be granted to the user after the unmute.",
				'The muted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Alphonse', '@Alphonse Spamming all channels', '@Alphonse 24h Spamming all channels'],
			multiline: true
		},
		commandSetNicknameDescription: 'Change the nickname of a user.',
		commandSetNicknameExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_NICKNAMES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner nickname cannot be changed."
			],
			examples: ['@Pete peeehteeerrr', '@ꓑ𝗲੮ẻ Pete Unmentionable name'],
			multiline: true
		},
		commandAddRoleDescription: 'Adds a role to a user.',
		commandAddRoleExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner roles cannot be changed."
			],
			examples: ['@John member', '@John member Make John a member'],
			multiline: true
		},
		commandRemoveroleDescription: 'Removes a role from a user',
		commandRemoveroleExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner roles cannot be changed."
			],
			examples: ['@Paula member', '@Paula member Remove member permissions from Paula'],
			multiline: true
		},
		commandPruneDescription: 'Prunes a certain amount of messages w/o filter.',
		commandPruneExtended: {
			extendedHelp: [
				'This command deletes the given amount of messages given a filter within the last 100 messages sent in the channel the command has been run.',
				'Optionally, you can add `--silent` to tell Skyra not to send a response message.'
			],
			explainedUsage: [
				['Messages', 'The amount of messages to prune.'],
				['Filter', 'The filter to apply.'],
				['(Filter) Link', 'Filters messages that have links on the content.'],
				['(Filter) Invite', 'Filters messages that have invite links on the content.'],
				['(Filter) Bots', 'Filters messages sent by bots.'],
				['(Filter) You', 'Filters messages sent by Skyra.'],
				['(Filter) Me', 'Filters your messages.'],
				['(Filter) Upload', 'Filters messages that have attachments.'],
				['(Filter) User', 'Filters messages sent by the specified user.'],
				['(Filter) Human', 'Filters messages sent by humans.'],
				['Position', 'Lets you delete messages before or after a specific message.'],
				['(Position) Before', 'Deletes all messages before the given message.'],
				['(Position) After', 'Deletes all messages after the given message.']
			],
			examples: ['50 me', '75 @kyra', '20 bots', '60 humans before 629992398700675082'],
			reminder: 'Due to a Discord limitation, bots cannot delete messages older than 14 days.',
			multiline: true
		},
		commandCaseDescription: 'Get the information from a case by its index.',
		commandCaseExtended: {
			extendedHelp: 'You can also get the latest moderation case by specifying the case ID as "latest"',
			explainedUsage: [['Case', 'Number of the case ID to get or "latest"']],
			examples: ['5', 'latest']
		},
		commandPermissionsDescription: 'Check the permission for a member, or yours.',
		commandPermissionsExtended: {
			extendedHelp: 'Ideal if you want to know the what permissions are granted to a member when they have a certain set of roles.'
		},
		commandFlowDescription: 'Shows the amount of messages per minute in a channel.',
		commandFlowExtended: {
			extendedHelp: 'This helps you determine the overall activity of a channel',
			explainedUsage: [['channel', '(Optional): The channel to check, if omitted current channel is used']]
		},
		commandReasonDescription: 'Edit the reason field from a moderation log case.',
		commandReasonExtended: {
			extendedHelp: [
				'This command allows moderation log case management, it allows moderators to update the reason.',
				'If you want to modify multiple cases at once you provide a range.',
				'For example `1..3` for the `<range>` will edit cases 1, 2, and 3.',
				'Alternatively you can also give ranges with commas:',
				'`1,3..6` will result in cases 1, 3, 4, 5, and 6',
				'`1,2,3` will result in cases 1, 2, and 3'
			],
			examples: ['420 Spamming all channels', '419..421 Bad memes', '1..3,4,7..9 Posting NSFW', 'latest Woops, I did a mistake!'],
			multiline: true
		},
		commandRestrictAttachmentDescription: 'Restrict a user from sending attachments in all channels.',
		commandRestrictAttachmentExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.',
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Pete', '@Pete Sending weird images', '@Pete 24h Sending NSFW images'],
			multiline: true
		},
		commandRestrictEmbedDescription: 'Restrict a user from attaching embeds in all channels.',
		commandRestrictEmbedExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.',
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Pete', '@Pete Sending weird links', '@Pete 24h Posted a spam link'],
			multiline: true
		},
		commandRestrictEmojiDescription: 'Restrict a user from using external emojis in all channels.',
		commandRestrictEmojiExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.',
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Pete', '@Pete Spamming external emojis', '@Pete 24h Posted cringe'],
			reminder: `This will only prevent the usage of external emojis and so will have no effect for non-nitro users, your own server's emojis and regular build in twemojis can still be used by members with this role.`,
			multiline: true
		},
		commandRestrictReactionDescription: 'Restrict a user from reacting to messages in all channels.',
		commandRestrictReactionExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.',
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Pete', '@Pete Spamming reactions', '@Pete 24h Posting weird reactions'],
			multiline: true
		},
		commandRestrictVoiceDescription: 'Restrict a user from joining any voice channel.',
		commandRestrictVoiceExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.',
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Pete', '@Pete Earraping in general voice channels', '@Pete 24h Making weird noises'],
			multiline: true
		},
		commandSoftBanDescription: 'Hit somebody with the ban hammer, destroying all their messages for some days, and unban it.',
		commandSoftBanExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.BAN_MEMBERS}**, and only members with lower role hierarchy position can be banned by me.`,
				"No, the guild's owner cannot be banned.",
				"The ban feature from Discord has a feature that allows the moderator to remove all messages from all channels that have been sent in the last 'x' days, being a number between 0 (no days) and 7.",
				'The user gets unbanned right after the ban, so it is like a kick, but that can prune many many messages.'
			],
			examples: ['@Pete', '@Pete Spamming all channels', '@Pete 7 All messages sent in 7 are gone now, YEE HAH!'],
			multiline: true
		},
		commandToggleModerationDmDescription: 'Toggle moderation DMs.',
		commandToggleModerationDmExtended: {
			extendedHelp: `This command allows you to toggle moderation DMs. By default, they are on, meaning that any moderation action (automatic or manual) will DM you, but you can disable them with this command.`
		},
		commandUnbanDescription: 'Unban somebody from this guild!.',
		commandUnbanExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.BAN_MEMBERS}**. It literally gets somebody from the rubbish bin, cleans them up, and allows the pass to this guild's gates.`,
			examples: ['@Pete', '@Pete Turns out he was not the one who spammed all channels ¯\\_(ツ)_/¯']
		},
		commandUnmuteDescription: 'Remove the scotch tape from a user.',
		commandUnmuteExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the muted people's list, and gives the old roles back if the user had them.`,
			examples: ['@Pete', '@Pete (Insert random joke here).']
		},
		commandUnrestrictAttachmentDescription: 'Remove the attachment restriction from one or more users.',
		commandUnrestrictAttachmentExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		commandUnrestrictEmbedDescription: 'Remove the embed restriction from one or more users.',
		commandUnrestrictEmbedExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		commandUnrestrictEmojiDescription: 'Remove the external emoji restriction from one or more users.',
		commandUnrestrictEmojiExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		commandUnrestrictReactionDescription: 'Remove the reaction restriction from one or more users.',
		commandUnrestrictReactionExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		commandUnrestrictVoiceDescription: 'Remove the voice restriction from one or more users.',
		commandUnrestrictVoiceExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		commandUnwarnDescription: 'Appeal a warning moderation log case.',
		commandUnwarnExtended: {
			extendedHelp: `This command appeals a warning, it requires no permissions, you only give me the moderation log case to appeal and the reason.`,
			examples: ['0 Whoops, wrong dude.', '42 Turns out this was the definition of life.']
		},
		commandVmuteDescription: "Throw somebody's microphone out the window.",
		commandVmuteExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MUTE_MEMBERS}**, and only members with lower role hierarchy position can be silenced by me.`,
				"No, the guild's owner cannot be silenced.",
				'This action can be optionally timed to create a temporary voice mute.'
			],
			examples: ['@Pete', '@Pete Singing too loud', '@Pete Literally sang hear rape, for 24 hours.'],
			multiline: true
		},
		commandVoiceKickDescription: 'Hit somebody with the 👢 for singing so bad and loud.',
		commandVoiceKickExtended: {
			extendedHelp: [
				`This command requires the permissions **${this.PERMISSIONS.MANAGE_CHANNELS}** to create a temporary (hidden) voice channel, and **${this.PERMISSIONS.MOVE_MEMBERS}** to move the user to the temporary channel.`,
				'After this, the channel is quickly deleted, making the user leave the voice channel.',
				'For scared moderators, this command has almost no impact in the average user, as the channel is created in a way only me and the selected user can see and join, then quickly deleted.'
			],
			examples: ['@Pete', '@Pete Spamming all channels'],
			multiline: true
		},
		commandVunmuteDescription: "Get somebody's microphone back so they can talk.",
		commandVunmuteExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MUTE_MEMBERS}**, and only members with lower role hierarchy position can be un-silenced by me.`,
				"No, the guild's owner cannot be un-silenced."
			],
			examples: ['@Pete', '@Pete Appealed his times signing hear rape.'],
			multiline: true
		},
		commandWarnDescription: 'File a warning to somebody.',
		commandWarnExtended: {
			extendedHelp: [
				'This command files a warning to a user.',
				"This kind of warning is meant to be **formal warnings**, as they will be shown in the 'warnings' command.",
				'It is a good practise to do an informal warning before using this command.'
			],
			examples: ['@Pete Attempted to mention everyone.'],
			multiline: true
		},

		/**
		 * ##################
		 * POKÉMON COMMANDS
		 */
		commandAbilityDescription: 'Gets data for any given Pokémon ability using my Pokémon dataset.',
		commandAbilityExtended: {
			extendedHelp: 'Uses a fuzzy search to also match against near-matches.',
			explainedUsage: [['ability', 'The ability for which you want to find data']],
			examples: ['multiscale', 'pressure']
		},
		commandAbilityEmbedTitles: {
			authorTitle: 'Ability',
			fieldEffectTitle: 'Effect outside of battle'
		},
		commandAbilityQueryFail: ({ ability }) => `I am sorry, but that query failed. Are you sure \`${ability}\` is actually an ability in Pokémon?`,
		commandFlavorsDescription: 'Gets the dex entries across various games for a Pokémon.',
		commandFlavorsExtended: {
			extendedHelp: ['Uses a fuzzy search to also match against near-matches.', 'You can provide a flag of `--shiny` to get the shiny sprite.'],
			explainedUsage: [['pokemon', 'The Pokémon for which you want to get flavour texts']],
			examples: ['dragonite', 'pikachu', 'pikachu --shiny'],
			multiline: true
		},
		commandFlavorsQueryFail: ({ pokemon }) => `I am sorry, but that query failed. Are you sure \`${pokemon}\` is actually a Pokémon?`,
		commandItemDescription: 'Gets data for any given Pokémon item using my Pokémon dataset.',
		commandItemExtended: {
			extendedHelp: 'Uses a fuzzy search to also match against near-matches.',
			explainedUsage: [['item', 'The item for which you want to find data']],
			examples: ['life orb', 'choice specs']
		},
		commandItemEmbedData: ({ availableInGen8 }) => ({
			ITEM: 'Item',
			generationIntroduced: 'Generation introduced',
			availableInGeneration8Title: 'Available in generation 8',
			availableInGeneration8Data: availableInGen8
		}),
		commandItemQueryFail: ({ item }) => `I am sorry, but that query failed. Are you sure \`${item}\` is actually a item in Pokémon?`,
		commandLearnDescription: 'Retrieves whether a given Pokémon can learn one or more given moves using my Pokémon dataset.',
		commandLearnExtended: {
			extendedHelp: [
				'Uses a fuzzy search to also match against near-matches.',
				'Moves split on every `, ` (comma space) and you can provide as many moves as you wish.',
				'You can provide a flag of `--shiny` to get the shiny sprite.'
			],
			explainedUsage: [
				['generation', '(Optional), The generation for which to check the data'],
				['pokemon', 'The Pokémon whose learnset you want to check'],
				['move', 'The move(s) you want to check for']
			],
			examples: ['7 dragonite dragon dance', 'pikachu thunder bolt', 'pikachu thunder bolt --shiny', 'pikachu thunder bolt, thunder'],
			multiline: true
		},
		commandLearnMethodTypes: ({ level }) => ({
			levelUpMoves: `by level up at level ${level}`,
			eventMoves: 'through an event',
			tutorMoves: 'from a move tutor',
			eggMoves: 'as an eggmove',
			virtualTransferMoves: 'by transfering from virtual console games',
			tmMoves: 'by using a technical machine or technical record',
			dreamworldMoves: 'through a Dream World capture'
		}),
		commandLearnInvalidGeneration: ({ generation }) => `I am sorry, but ${generation} is not a supported Pokémon Generation`,
		commandLearnMethod: ({ generation, pokemon, move, method }) =>
			`In generation ${generation} ${pokemon} __**can**__ learn **${move}** ${method}`,
		commandLearnQueryFailed: ({ pokemon, moves }) =>
			`I am sorry, but that query failed. Are you sure you \`${toTitleCase(pokemon)}\` is actually a Pokémon and ${moves} are actually moves?`,
		commandLearnCannotLearn: ({ pokemon, moves }) => `Looks like ${toTitleCase(pokemon)} cannot learn ${moves}`,
		commandLearnTitle: ({ pokemon, generation }) => `Learnset data for ${toTitleCase(pokemon)} in generation ${generation}`,
		commandMoveDescription: 'Gets data for any given Pokémon move using my Pokémon dataset',
		commandMoveExtended: {
			extendedHelp: 'Uses a fuzzy search to also match against near-matches.',
			explainedUsage: [['move', 'The move for which you want to find data']],
			examples: ['dragon dance', 'GMax Wildfire', 'Genesis Supernova'],
			reminder: [
				'Z-Move power may be shown for Generation 8 moves because it is calculated with a conversion table.',
				'If Pokémon ever returns Z-Moves to the game this would be their theoretical power, however as it stands',
				'Z-Moves are **NOT** in Generation 8.'
			],
			multiline: true
		},
		commandMoveEmbedData: ({ availableInGen8 }) => ({
			move: 'Move',
			types: 'Type',
			basePower: 'Base Power',
			pp: 'PP',
			category: 'Category',
			accuracy: 'Accuracy',
			priority: 'Priority',
			target: 'Target',
			contestCondition: 'Contest Condition',
			zCrystal: 'Z-Crystal',
			gmaxPokemon: 'G-MAX Pokémon',
			availableInGeneration8Title: 'Available in Generation 8',
			availableInGeneration8Data: availableInGen8,
			none: 'None',
			maxMovePower: 'Base power as MAX move (Dynamax)',
			zMovePower: 'Base power as Z-Move (Z-Crystal)',
			fieldMoveEffectTitle: 'Effect outside of battle'
		}),
		commandMoveQueryFail: ({ move }) => `I am sorry, but that query failed. Are you sure \`${move}\` is actually a move in Pokémon?`,
		commandPokedexDescription: 'Gets data for any given Pokémon using my Pokémon dataset.',
		commandPokedexExtended: {
			extendedHelp: ['Uses a fuzzy search to also match against near-matches.', 'You can provide a flag of `--shiny` to get the shiny sprite.'],
			explainedUsage: [['pokemon', 'The Pokémon for which you want to find data']],
			examples: ['dragonite', 'pikachu', 'pikachu --shiny'],
			reminder: [
				'If there are any "Other forme(s)" on the optional fourth page, those can be requested as well.',
				'Cosmetic Formes on that page list purely cosmetic changes and these do not have seperate entries in the Pokédex.'
			],
			multiline: true
		},
		commandPokedexEmbedData: ({ otherFormes, cosmeticFormes }) => ({
			types: 'Type(s)',
			abilities: 'Abilities',
			genderRatio: 'Gender Ratio',
			smogonTier: 'Smogon Tier',
			uknownSmogonTier: 'Unknown / Alt form',
			height: 'Height',
			weight: 'Weight',
			eggGroups: 'Egg group(s)',
			evolutionaryLine: 'Evolutionary line',
			baseStats: 'Base stats',
			baseStatsTotal: 'BST',
			flavourText: 'Pokdex entry',
			otherFormesTitle: 'Other forme(s)',
			cosmeticFormesTitle: 'Cosmetic Formes',
			otherFormesList: this.list(otherFormes, 'and'),
			cosmeticFormesList: this.list(cosmeticFormes, 'and')
		}),
		commandPokedexQueryFail: ({ pokemon }) => `I am sorry, but that query failed. Are you sure \`${pokemon}\` is actually a Pokémon?`,
		commandTypeDescription: 'Gives the type matchups for one or two Pokémon types',
		commandTypeExtended: {
			extendedHelp: 'Types have to be exact matches to pokemon types (upper/lowercase can be ignored)',
			explainedUsage: [['type', 'The type(s) to look up']],
			examples: ['dragon', 'fire flying']
		},
		commandTypeEmbedData: ({ types }) => ({
			offensive: 'Offensive',
			defensive: 'Defensive',
			superEffectiveAgainst: 'Supereffective against',
			dealsNormalDamageTo: 'Deals normal damage to',
			doesNotAffect: "Doesn't affect",
			notVeryEffectiveAgainst: 'Not very effective against',
			vulnerableTo: 'Vulnerable to',
			takesNormalDamageFrom: 'Takes normal damage from',
			resists: 'Resists',
			notAffectedBy: 'Not affected by',
			typeEffectivenessFor: `Type effectiveness for ${this.list(types, 'and')}`
		}),
		commandTypeTooManyTypes: 'I am sorry, but you can get the matchup for at most 2 types',
		commandTypeNotAType: ({ type }) => `${type} is not a valid Pokémon type`,
		commandTypeQueryFail: ({ types }) => `I am sorry, but that query failed. Are you sure ${types} are actually types in Pokémon?`,

		/**
		 * ###############
		 * SOCIAL COMMANDS
		 */

		commandSocialDescription: "Configure this guild's member points.",
		commandSocialExtended: {
			extendedHelp: "This command allows for updating other members' points.",
			explainedUsage: [
				['set <user> <amount>', 'Sets an amount of points to the user.'],
				['add <user> <amount>', 'Adds an amount of points to the user.'],
				['remove <user> <amount>', 'Removes an amount of points from the user.'],
				['reset <user>', 'Resets all pointss from the user.']
			],
			examples: ['set @kyra 40000', 'add @kyra 2400', 'remove @kyra 3000', 'reset @kyra']
		},
		commandBannerDescription: 'Configure the banner for your profile.',
		commandBannerExtended: {
			extendedHelp: 'Banners are vertical in Skyra, they decorate your profile card.',
			explainedUsage: [
				['list', '(Default) Lists all available banners.'],
				['reset', 'Set your displayed banner to default.'],
				['buy <bannerID>', 'Buy a banner, must be an ID.'],
				['set <bannerID>', 'Set your displayed banner, must be an ID.']
			],
			examples: ['list', 'buy 0w1p06', 'set 0w1p06', 'reset']
		},
		commandToggleDarkModeDescription: 'Toggle between light and dark templates for your profile and rank cards.',
		commandToggleDarkModeExtended: {
			extendedHelp: 'This command lets you toggle the template used to generate your profile.'
		},

		commandAutoRoleDescription: 'List or configure the autoroles for a guild.',
		commandAutoRoleExtended: {
			extendedHelp: [
				'Autoroles are roles that are available for everyone, and automatically given when they reach a configured',
				'amount of (local) points, an administrator must configure them through a setting command.',
				"Note that if the role name has spaces in the name you need to put `'quotes'` around the name!"
			],
			explainedUsage: [
				['list', 'Lists all the current autoroles.'],
				['add <role> <amount>', 'Add a new autorole.'],
				['remove <role>', 'Remove an autorole from the list.'],
				['update <role> <amount>', 'Change the required amount of points for an existing autorole.']
			],
			reminder: 'The current system grants a random amount of points between 4 and 8 points, for each post with a 1 minute cooldown.',
			examples: ['list', "add 'Trusted Member' 20000", "update 'Trusted Member' 15000", "remove 'Trusted Member'"],
			multiline: true
		},

		commandBalanceDescription: 'Check your current balance.',
		commandBalanceExtended: {
			extendedHelp: `The balance command retrieves your amount of ${SHINY}.`
		},
		commandDailyDescription: `Get your semi-daily ${SHINY}'s.`,
		commandDailyExtended: {
			extendedHelp: 'Shiiiiny!',
			reminder: [
				'Skyra uses a virtual currency called Shiny, and it is used to buy stuff such as banners or bet it on slotmachines.',
				'You can claim dailies once every 12 hours.',
				"If you use the --reminder flag, I will remind you when it's time to collect dailies again."
			],
			multiline: true
		},
		commandLeaderboardDescription: 'Check the leaderboards.',
		commandLeaderboardExtended: {
			extendedHelp: [
				'The leaderboard command shows a list of users sorted by their local or global amount of points, by default, when using no arguments, it will show the local leaderboard.',
				'The leaderboards refresh every 10 minutes.'
			],
			reminder: '"Local" leaderboards refer to the guild\'s top list. "Global" refers to all scores from all guilds.',
			multiline: true
		},
		commandLevelDescription: 'Check your global level.',
		commandLevelExtended: {
			extendedHelp: 'How much until the next level?',
			explainedUsage: [['user', "(Optional) The user's profile to show. Defaults to the message's author!."]]
		},
		commandDivorceDescription: 'Break up with your couple!',
		commandDivorceExtended: {
			extendedHelp:
				'Sniff... This command is used to break up with your couple, hopefully in this virtual world, you are allowed to marry the user again.'
		},
		commandMarryDescription: 'Marry somebody!',
		commandMarryExtended: {
			extendedHelp: 'Marry your waifu!',
			explainedUsage: [['user', '(Optional) The user to marry with. If not given, the command will tell you who are you married with.']],
			examples: ['', '@love']
		},
		commandMarriedDescription: 'Check who you are married with.',
		commandMarriedExtended: {
			extendedHelp: 'This command will tell you who are you married with.'
		},
		commandMylevelDescription: 'Check your local level.',
		commandMylevelExtended: {
			extendedHelp: 'How much until next auto role? How many points do I have in this guild?',
			explainedUsage: [['user', "(Optional) The user's profile to show. Defaults to the message's author!."]]
		},
		commandPayDescription: `Pay somebody with your ${SHINY}'s.`,
		commandPayExtended: {
			extendedHelp: 'Businessmen! Today is payday!',
			explainedUsage: [
				['money', `Amount of ${SHINY} to pay, you must have the amount you are going to pay.`],
				['user', 'The targeted user to pay. (Must be mention/id)']
			],
			examples: ['200 @kyra']
		},
		commandProfileDescription: 'Check your user profile.',
		commandProfileExtended: {
			extendedHelp: [
				'This command sends a card image with some of your user profile such as your global rank, experience...',
				"Additionally, you are able to customize your colours with the 'setColor' command."
			],
			explainedUsage: [['user', "(Optional) The user's profile to show. Defaults to the message's author!."]],
			multiline: true
		},
		commandRemindmeDescription: 'Manage your reminders.',
		commandRemindmeExtended: {
			extendedHelp: 'This command allows you to set, delete and list reminders.',
			explainedUsage: [
				['action', 'The action, one of "list", "show", "delete", or "create"/"me". Defaults to "list".'],
				['idOrDuration', 'Dependent of action; "list" → ignored; "delete"/"show" → reminder ID; else → duration.'],
				['description', '(Optional) Dependent of action, this is only read when creating a new reminder.']
			],
			examples: ['me 6h to fix this command.', 'list', 'show 1234', 'delete 1234']
		},
		commandReputationDescription: 'Give somebody a reputation point.',
		commandReputationExtended: {
			extendedHelp: [
				"This guy is so helpful... I'll give him a reputation point!",
				"Additionally, you can check how many reputation points a user has by writing 'check' before the mention."
			],
			explainedUsage: [
				['check', '(Optional) Whether you want to check somebody (or yours) amount of reputation.'],
				['user', 'The user to give a reputation point.']
			],
			reminder: 'You can give a reputation point once every 24 hours.',
			examples: ['check @kyra', 'check', '@kyra', 'check "User With Spaces"', '"User With Spaces"'],
			multiline: true
		},
		commandSetColorDescription: "Change your user profile's color.",
		commandSetColorExtended: {
			extendedHelp: 'The setColor command sets a color for your profile.',
			explainedUsage: [['color', 'A color resolvable.']],
			possibleFormats: [
				['HEX', '#dfdfdf'],
				['RGB', 'rgb(200, 200, 200)'],
				['HSL', 'hsl(350, 100, 100)'],
				['B10', '14671839']
			]
		},

		/**
		 * ##################
		 * STARBOARD COMMANDS
		 */

		commandStarDescription: 'Get a random starred message from the database or the star leaderboard.',
		commandStarExtended: {
			extendedHelp: 'This command shows a random starred message or the starboard usage and leaderboard for this server.'
		},

		/**
		 * ###############
		 * SYSTEM COMMANDS
		 */

		commandDmDescription: 'Sends a Direct Message.',
		commandDmExtended: {
			extendedHelp: `The DM command is reserved for bot owners, and it's only used for very certain purposes, such as replying feedback messages sent by users.`,
			reminder: 'Reserved for bot owners for replying purposes.'
		},
		commandEvalDescription: 'Evaluates arbitrary Javascript.',
		commandEvalExtended: {
			extendedHelp: [
				'The eval command evaluates code as-in, any error thrown from it will be handled.',
				'It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.',
				'The --wait flag changes the time the eval will run. Defaults to 10 seconds. Accepts time in milliseconds.',
				"The --output and --output-to flag accept either 'file', 'log', 'haste' or 'hastebin'.",
				'The --delete flag makes the command delete the message that executed the message after evaluation.',
				'The --silent flag will make it output nothing.',
				"The --depth flag accepts a number, for example, --depth=2, to customize util.inspect's depth.",
				'The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword',
				'The --showHidden flag will enable the showHidden option in util.inspect.',
				'The --lang and --language flags allow different syntax highlight for the output.',
				'The --json flag converts the output to json',
				'The --no-timeout flag disables the timeout',
				`If the output is too large, it'll send the output as a file, or in the console if the bot does not have the ${this.PERMISSIONS.ATTACH_FILES} permission.`
			],
			examples: ['msg.author!.username;', '1 + 1;'],
			reminder: 'Reserved for bot owners.',
			multiline: true
		},
		commandExecDescription: 'Execute Order 66.',
		commandExecExtended: {
			extendedHelp: 'You better not know about this.'
		},
		commandSetAvatarDescription: "Set Skyra's avatar.",
		commandSetAvatarExtended: {
			extendedHelp: "This command changes Skyra's avatar. You can send a URL or upload an image attachment to the channel.",
			reminder: 'Reserved for bot owners.'
		},
		commandDonateDescription: 'Get information about how to donate to keep Skyra alive longer.',
		commandDonateExtended: {
			extendedHelp: [
				'Skyra Project started on 24th October 2016, if you are reading this, you are',
				`using version ${VERSION}. The development team improves a lot in every iteration of Skyra.`,
				'',
				'However, not everything is free and we need your help to keep Skyra alive.',
				'We will be very thankful if you help us.',
				'We have been working on a lot of things, and Skyra is precious to us. Take care of her ❤',
				'',
				'Do you want to support this amazing project? Feel free to do so! https://donate.skyra.pw/patreon or https://donate.skyra.pw/kofi'
			],
			multiline: true
		},
		commandEchoDescription: 'Make Skyra send a message to this (or another) channel.',
		commandEchoExtended: {
			extendedHelp: 'This should be very obvious...',
			reminder: 'Reserved for bot owners.'
		},
		commandFeedbackDescription: "Send a feedback message to the bot's s.",
		commandFeedbackExtended: {
			extendedHelp: `This command sends a message to a feedback channel which the bot's owners can read. You'll get a reply from me in your DMs when one of the owners has an update for you.`
		},
		commandStatsDescription: 'Provides some details about the bot and stats.',
		commandStatsExtended: {
			extendedHelp: 'This should be very obvious...'
		},

		/**
		 * ##############
		 * TOOLS COMMANDS
		 */

		commandAvatarDescription: "View somebody's avatar in full size.",
		commandAvatarExtended: {
			extendedHelp: "As this command's name says, it shows somebody's avatar.",
			explainedUsage: [['user', '(Optional) A user mention. Defaults to the author if the input is invalid or not given.']],
			reminder: "Use the --size flag to change the avatar's size."
		},
		commandColorDescription: 'Display some awesome colours.',
		commandColorExtended: {
			extendedHelp: 'The color command displays a set of colours with nearest tones given a difference between 1 and 255..',
			explainedUsage: [['color', 'A color resolvable.']],
			possibleFormats: [
				['HEX', '#dfdfdf'],
				['RGB', 'rgb(200, 200, 200)'],
				['HSL', 'hsl(350, 100, 100)'],
				['B10', '14671839']
			],
			examples: ['#dfdfdf >25', 'rgb(200, 130, 75)']
		},
		commandContentDescription: "Get messages' raw content.",
		commandContentExtended: {
			extendedHelp: 'Raw content will help you better copy-paste message content as you will not have to reproduce all the formatting',
			explainedUsage: [
				['channel', '(optional) The channel in which the message is to get the content from'],
				['message', 'ID of the message to get the raw content for']
			]
		},
		commandEmojiDescription: 'Get info on an emoji.',
		commandEmojiExtended: {
			extendedHelp: "I'll give you the emoji name, whether it is a custom emoji or not, the emoji ID and a large image preview of the emoji.",
			explainedUsage: [['emoji', 'The emoji to get information about']],
			reminder: "It doesn't matter whether I share a server with a custom emoji or not!"
		},
		commandEmotesDescription: 'Shows all custom emotes available on this server',
		commandEmotesExtended: {
			extendedHelp: 'The list of emotes is split per 50 emotes'
		},
		commandEmotesTitle: 'Emotes in',
		commandPriceDescription: 'Convert between currencies with this command.',
		commandPriceExtended: {
			extendedHelp: 'Convert between any two currencies, even if they are cryptocurrencies.',
			explainedUsage: [
				['from', 'The currency to convert from'],
				['to', 'The currency to convert to'],
				['amount', 'The amount to convert, will default to 1']
			],
			examples: ['EUR USD', 'USD EUR 5', 'USD BAT 10']
		},
		commandQuoteDescription: "Quote another person's message.",
		commandQuoteExtended: {
			extendedHelp: "Quotes also include the message's image, if any",
			explainedUsage: [
				['channel', '(optional) The channel in which the message is to quote'],
				['message', 'ID of the message to quote']
			]
		},
		commandRolesDescription: 'List, claim or unclaim public roles in this server.',
		commandRolesExtended: {
			extendedHelp: [
				'Public roles are roles that are available for everyone.',
				'An administrator must configure them with the configuration command.'
			],
			explainedUsage: [['roles', 'The list of roles to claim or unclaim. Leave this empty to get a list of available roles.']],
			reminder: [
				'When claiming or unclaiming roles you can provide a single or multiple role(s).',
				'To claim multiple roles, you must separate them by a comma, for example `red,green`.',
				'You can specify which roles you want by providing the role ID, name, or a sub-section of the name.',
				'',
				'Administrators can add public roles using `Skyra, conf set roles.public ExamplePublicRole`.'
			],
			examples: ['', 'Designer,Programmer', 'Designer'],
			multiline: true
		},
		commandDuckDuckGoDescription: 'Search the Internet with DuckDuckGo.',
		commandDuckDuckGoExtended: {
			extendedHelp: 'This uses the alternative search enginge DuckDuckGo to search the web',
			reminder: 'If you want to search google use `Skyra, google`'
		},
		commandPollDescription: 'Simplifies reaction-based polls.',
		commandPollExtended: {
			extendedHelp: 'Separate your options using commas.',
			examples: ['Make an anime channel, Make a gaming channel, Make a serious-discussion channel']
		},
		commandPollReactionLimit: "Please don't add emojis while I am reacting!",
		commandVoteDescription: 'Simplified reaction-based vote.',
		commandVoteExtended: {
			examples: ['Should I implement the #anime channel?']
		},
		commandTopInvitesDescription: 'Shows the top 10 most used invites for this server',
		commandTopInvitesExtended: {
			extendedHelp: "Use this to get some server insights if your server doesn't have access to Discord's official server insights."
		},
		commandTopInvitesNoInvites: 'There are no invites, or none of them have been used!',
		commandTopInvitesTop10InvitesFor: ({ guild }) => `Top 10 invites for ${guild}`,
		commandTopInvitesEmbedData: {
			channel: 'Channel',
			link: 'Link',
			createdAt: 'Date Created',
			createdAtUnknown: 'Creation date unknown',
			expiresIn: 'Expires in',
			neverExpress: 'Never',
			temporary: 'Temporary invite',
			uses: 'Uses'
		},
		commandUrbanDescription: 'Check the definition of a word on UrbanDictionary.',
		commandUrbanExtended: {
			extendedHelp: 'What does "spam" mean?',
			explainedUsage: [
				['Word', 'The word or phrase you want to get the definition from.'],
				['Page', 'Defaults to 1, the page you wish to read.']
			],
			examples: ['spam']
		},
		commandWhoisDescription: 'Who are you?',
		commandWhoisExtended: {
			extendedHelp: 'Gets information on any server member. Also known as `userinfo` in many other bots.'
		},
		commandFollowageDescription: 'Check how long a Twitch user has been following a channel.',
		commandFollowageExtended: {
			extendedHelp: 'Just... that.',
			examples: ['dallas cohhcarnage']
		},
		commandTwitchDescription: 'Check the information about a Twitch profile.',
		commandTwitchExtended: {
			extendedHelp: 'Really, just that.',
			examples: ['riotgames']
		},
		commandTwitchSubscriptionDescription: 'Manage the subscriptions for your server.',
		commandTwitchSubscriptionExtended: {
			extendedHelp: [
				'Manage the subscriptions for this server.',
				'__Online Notifications__',
				'For content, the best way is writing `--embed`, the notifications will then show up in MessageEmbeds with all available data.',
				'Alternatively you can set your own content and it will post as a regular message.',
				'This content can contain some parameters that will be replaced with Twitch data:',
				"- `%TITLE%` for the stream's title",
				'- `%VIEWER_COUNT%` for the amount of current viewers,',
				'- `%GAME_NAME%` for the title being streamed',
				"- `%GAME_ID%` for the game's ID as seen by Twitch",
				'- `%LANGUAGE%` for the language the stream is in',
				"- `%USER_ID%` for the streamer's ID as seen by Twitch",
				"- and `%USER_NAME%` for the Streamer's twitch username.",
				'',
				'__Offline Notifications__',
				"For offline events none of the variables above are available and you'll have to write your own content.",
				'You can still use the `--embed` flag for the notification to show in a nice Twitch-purple MessageEmbed.'
			],
			explainedUsage: [
				['streamer', 'The Twitch username of the streamer to get notifications for.'],
				['channel', 'A Discord channel where to post the notifications in.'],
				['status', `The status that the Twitch streamer should get for an notification, one of online or offline.`],
				['content', 'The message to send in Discord chat. Refer to extended help above for more information.']
			],
			examples: [
				'add favna #twitch online --embed',
				'add favna #twitch online %USER_NAME% went live | %TITLE%',
				'remove kyranet #twitch online',
				'reset kyranet',
				'reset',
				'show kyranet',
				'show'
			],
			multiline: true
		},
		commandWikipediaDescription: 'Search something through Wikipedia.',
		commandWikipediaExtended: {
			extendedHelp:
				'In NSFW channels I will also add the page image. This restriction is in place because Wikipedia has NSFW images for NSFW pages as they have to be accurate (i.e. diseases or human body parts).',
			reminder: 'Most Wikipedia page titles are case sensitive. Some celeberties will have lowercase redirects, but not many.'
		},
		commandYoutubeDescription: 'Search something through YouTube.',
		commandYoutubeExtended: {
			extendedHelp: `If I have the ${this.PERMISSIONS.MANAGE_MESSAGES} ${this.PERMISSIONS.ADD_REACTIONS} permissions then I will provide the option to navigate through the top 10 results.`
		},

		/**
		 * ################
		 * GOOGLE COMMANDS
		 */

		commandCurrentTimeDescription: 'Gets the current time in any location on the world',
		commandCurrentTimeExtended: {
			extendedHelp: [
				'This command uses Google Maps to get the coordinates of the place.',
				'Once this command has the coordinates, it queries TimezoneDB to get the time data.'
			],
			explainedUsage: [['location', 'The locality, governing, country or continent to check the time for.']],
			examples: ['Antarctica', 'Arizona'],
			multiline: true
		},
		commandCurrentTimeLocationNotFound: 'I am sorry, but I could not find time data for that location.',
		commandCurrentTimeTitles: ({ dst }) => ({
			currentTime: 'Current Time',
			currentDate: 'Current Date',
			country: 'Country',
			gmsOffset: 'GMT Offset',
			dst: `**DST**: ${dst}`
		}),
		commandCurrentTimeDst: 'Does not observe DST right now',
		commandCurrentTimeNoDst: 'Observes DST right now',
		commandGsearchDescription: 'Find your favourite things on Google',
		commandGsearchExtended: {
			extendedHelp: `This command queries the powerful Google Search engine to find websites for your query. For images please use the \`gimage\` command.`,
			explainedUsage: [['query', 'The thing you want to find on Google']],
			examples: ['Discord', 'Skyra']
		},
		commandGimageDescription: 'Find your favourite images on Google',
		commandGimageExtended: {
			extendedHelp: `This command queries the powerful Google Search engine to find images for your query. For regular web results please use the \`gsearch\` command.`,
			explainedUsage: [['query', 'The image you want to find on Google']],
			examples: ['Discord', 'Skyra'],
			reminder:
				'This command has been marked as NSFW because it is unavoidable that when you query explicit content, you will get explicit results.'
		},
		commandLmgtfyDescription: 'Annoy another user by sending them a LMGTFY (Let Me Google That For You) link.',
		commandLmgtfyExtended: {
			explainedUsage: [['query', 'The query to google']]
		},
		commandWeatherDescription: 'Check the weather status in a location.',
		commandWeatherExtended: {
			extendedHelp: [
				'This command uses Google Maps to get the coordinates of the place.',
				'Once this command got the coordinates, it queries DarkSky to retrieve information about the weather.'
			],
			explainedUsage: [['city', 'The locality, governing, country or continent to check the weather from.']],
			examples: ['Antarctica', 'Arizona'],
			reminder: 'Temperature is in **Celsius** by default. Use the --imperial or --fahrenheit flag to view it in **Fahrenheit**.',
			multiline: true
		},
		googleErrorZeroResults: 'Your request returned no results.',
		googleErrorRequestDenied: 'The GeoCode API Request was denied.',
		googleErrorInvalidRequest: 'Invalid request.',
		googleErrorOverQueryLimit: 'Query Limit exceeded. Try again tomorrow.',
		googleErrorUnknown: 'I am sorry, but I failed to get a result from Google.',

		/**
		 * #############
		 * WEEB COMMANDS
		 */

		commandWblushDescription: 'Blush with a weeb picture!',
		commandWblushExtended: {
			extendedHelp: 'Blush with a random weeb image!'
		},
		commandWcryDescription: 'Cry to somebody with a weeb picture!',
		commandWcryExtended: {
			extendedHelp: 'Cry with a random weeb image!',
			explainedUsage: [['user', 'The user to cry to.']],
			examples: ['@Skyra']
		},
		commandWcuddleDescription: 'Cuddle somebody with a weeb picture!',
		commandWcuddleExtended: {
			extendedHelp: 'Unlike the original cuddle command, this one displays random weeb images, enjoy!',
			explainedUsage: [['user', 'The user to cuddle with.']],
			examples: ['@Skyra']
		},
		commandWdanceDescription: 'Dance with a weeb picture!',
		commandWdanceExtended: {
			extendedHelp: 'Dance with a random weeb image!'
		},
		commandWhugDescription: 'Hug somebody with a weeb picture!',
		commandWhugExtended: {
			extendedHelp: 'Unlike the original hug command, this one displays random weeb images, enjoy!',
			explainedUsage: [['user', 'The user to give the hug.']],
			examples: ['@Skyra']
		},
		commandWkissDescription: 'Kiss somebody with a weeb picture!',
		commandWkissExtended: {
			extendedHelp: 'Kiss somebody with a random weeb image!',
			explainedUsage: [['user', 'The user to give the kiss to.']],
			examples: ['@Skyra']
		},
		commandWlickDescription: 'Lick somebody with a weeb picture!',
		commandWlickExtended: {
			extendedHelp: 'Lick somebody with a random weeb image!',
			explainedUsage: [['user', 'The user to lick.']],
			examples: ['@Skyra']
		},
		commandWnomDescription: 'Nom nom with a 🍞!',
		commandWnomExtended: {
			extendedHelp: "Nom nom nom! Wha~... I'm busy eating!"
		},
		commandWnekoDescription: 'Human kittens!',
		commandWnekoExtended: {
			extendedHelp: `Unlike the original kitten command, this one displays random weeb images, the difference is that they're weebs... and humans, enjoy!`
		},
		commandWpatDescription: "Pats somebody's head!",
		commandWpatExtended: {
			extendedHelp: "Pat somebody's head with a random weeb image!",
			explainedUsage: [['user', 'The user to pat with.']],
			examples: ['@Skyra']
		},
		commandWpoutDescription: 'I feel somebody... mad',
		commandWpoutExtended: {
			extendedHelp: 'Show your expression with a random weeb image!'
		},
		commandWslapDescription: 'Slap somebody with a weeb picture!',
		commandWslapExtended: {
			extendedHelp: 'Unlike the original slap command, this one displays random weeb images, enjoy!',
			explainedUsage: [['user', 'The user to slap.']],
			examples: ['@Pete']
		},
		commandWsmugDescription: 'Smug',
		commandWsmugExtended: {
			extendedHelp: 'Just an anime smug face!'
		},
		commandWstareDescription: '*Stares*',
		commandWstareExtended: {
			extendedHelp: '*Still stares at you*',
			explainedUsage: [['user', 'The user to stare at.']],
			examples: ['@Pete']
		},
		commandWtickleDescription: 'Give tickles to somebody with a weeb picture!',
		commandWtickleExtended: {
			extendedHelp: 'Tickle somebody!',
			explainedUsage: [['user', 'The user to tickle.']],
			examples: ['@Skyra']
		},
		commandWeebUnavailableError: 'I am sorry, but the source of all my weeb images is not available at the moment. Please try again later!',
		commandWeebUnexpectedError: 'Weird! I encountered an error I should have never received!',
		commandWbangDescription: 'Bang 💥🔫!',
		commandWbangExtended: {
			extendedHelp: 'Shoot a user with a random weeb image!',
			explainedUsage: [['user', 'The user to shoot.']],
			examples: ['@Skyra']
		},
		commandWbangheadDescription: "STAHP! I'm banging my head here!",
		commandWbangheadExtended: {
			extendedHelp: 'Bang your head with a random weeb image!'
		},
		commandWbiteDescription: '*nom nom* you are delicious!',
		commandWbiteExtended: {
			extendedHelp: 'Bite a user with a random weeb image!',
			explainedUsage: [['user', 'The user to bite.']],
			examples: ['@Skyra']
		},
		commandWgreetDescription: 'Say hi! to another user',
		commandWgreetExtended: {
			extendedHelp: 'Greet a user with a random weeb image!',
			explainedUsage: [['user', 'The user to greet.']],
			examples: ['@Skyra']
		},
		commandWlewdDescription: 'Lewds! Lewds! Lewds!',
		commandWlewdExtended: {
			extendedHelp: 'Random lewd weeb image!'
		},
		commandWpunchDescription: '*pow* 👊👊',
		commandWpunchExtended: {
			extendedHelp: 'Punch that annoying user with a random weeb image!',
			explainedUsage: [['user', 'The user to punch.']],
			examples: ['@Skyra']
		},
		commandWsleepyDescription: "I'm so sleeeeepy... *yawn*",
		commandWsleepyExtended: {
			extendedHelp: 'Show how sleepy you are with a random weeb image!'
		},
		commandWsmileDescription: "Huh, because I'm happy. Clap along if you feel like a room without a roof",
		commandWsmileExtended: {
			extendedHelp: 'Show just how happy you are with a random weeb image!'
		},
		commandWthumbsupDescription: 'Raise your thumb into the air in a magnificent show of approval',
		commandWthumbsupExtended: {
			extendedHelp: 'Raise your thumb with a random weeb image!'
		},

		/**
		 * ##############
		 * ANIME COMMANDS
		 */

		commandAnimeTypes: {
			tv: '📺 TV',
			movie: '🎥 Movie',
			ova: '📼 Original Video Animation',
			special: '🎴 Special'
		},
		commandAnimeInvalidChoice: "That's an invalid choice! Please try with another option.",
		commandAnimeOutputDescription: ({ englishTitle, japaneseTitle, canonicalTitle, synopsis }) =>
			`**English title:** ${englishTitle}\n**Japanese title:** ${japaneseTitle}\n**Canonical title:** ${canonicalTitle}\n${synopsis}`,
		commandAnimeNoSynopsis: 'No synopsis available for this title.',
		commandAnimeEmbedData: {
			type: 'Type',
			score: 'Score',
			episodes: 'Episode(s)',
			episodeLength: 'Episode length',
			ageRating: 'Age rating',
			firstAirDate: 'First air date',
			watchIt: 'Watch it here:',
			stillAiring: 'Still airing'
		},
		commandMangaOutputDescription: ({ englishTitle, japaneseTitle, canonicalTitle, synopsis }) =>
			`**English title:** ${englishTitle}\n**Japanese title:** ${japaneseTitle}\n**Canonical title:** ${canonicalTitle}\n${synopsis}`,
		commandMangaTypes: {
			manga: '📘 Manga',
			novel: '📕 Novel',
			manhwa: '🇰🇷 Manhwa',
			oneShot: '☄ One Shot',
			special: '🎴 Special'
		},
		commandMangaEmbedData: {
			ageRating: 'Age Rating',
			firstPublishDate: 'First published on',
			readIt: 'Read it here:',
			score: 'Score',
			type: 'Subtype',
			none: 'None'
		},
		commandWaifuFooter: 'Powered by thiswaifudoesnotexist.net',

		/**
		 * #####################
		 * ANNOUNCEMENT COMMANDS
		 */

		commandSubscribeNoRole: 'This server does not have a configured announcement role.',
		commandSubscribeSuccess: ({ role }) => `Successfully granted the role: **${role}**`,
		commandUnsubscribeSuccess: ({ role }) => `Successfully removed the role: **${role}**`,
		commandSubscribeNoChannel: 'This server does not have a configured announcement channel.',
		commandAnnouncement: ({ role }) => `**New announcement for** ${role}`,
		commandAnnouncementSuccess: 'Successfully posted a new announcement.',
		commandAnnouncementCancelled: 'Cancelled the message.',
		commandAnnouncementPrompt: 'This will be the message sent in the announcement channel. Are you OK with this?',
		commandAnnouncementEmbedMentions: ({ header }) => `${header}:`,
		commandAnnouncementEmbedMentionsWithMentions: ({ header, mentions }) => `${header}, and mentioning: ${mentions}:`,

		/**
		 * ################
		 * GENERAL COMMANDS
		 */

		commandInviteDescription: 'Shows the invite link to add Skyra to your server.',
		commandInviteExtended: {
			extendedHelp:
				'If you would like to get a link where Skyra will not ask for any permissions add either `noperms`, `--noperms` or `--nopermissions` to the command.',
			examples: ['', 'noperms', '--noperms', '--nopermissions']
		},
		commandInvitePermissionInviteText: 'Invite Skyra to your server',
		commandInvitePermissionSupportServerText: 'Join Support Server',
		commandInvitePermissionsDescription:
			"Don't be afraid to uncheck some permissions, I will let you know if you're trying to run a command without permissions.",
		commandInfoBody: [
			`Skyra ${VERSION} is a multi-purpose Discord Bot designed to run the majority of tasks with a great performance and constant 24/7 uptime.`,
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
		],
		commandHelpData: ({ titleDescription, usage, extendedHelp, footerName }) => ({
			title: `${titleDescription}`,
			usage: `📝 | ***Command Usage***\n\`${usage}\`\n`,
			extended: `🔍 | ***Extended Help***\n${extendedHelp}`,
			footer: `Command help for ${footerName}`
		}),
		commandSupportEmbedTitle: ({ username }) => `Looking for help, ${username}?`,
		commandSupportEmbedDescription:
			"Then you should probably join [Skyra's Lounge](https://join.skyra.pw)! There, you can receive support by the developers and other members of the community!",

		/**
		 * #####################
		 * DEVELOPERS COMMANDS
		 */

		commandYarnDescription: 'Responds with information on a NodeJS package using the Yarn package registry',
		commandYarnExtended: {
			extendedHelp: `This is for NodeJS developers who want to quickly find information on a package published to [npm](https://npmjs.com)`,
			explainedUsage: [['package', 'The name of the package to search for, has to be an exact match']],
			examples: ['@skyra/char', '@skyra/saelem', '@skyra/eslint-config']
		},
		commandYarnNoPackage: `${REDCROSS} I am sorry, but you have to give me the name of a package to look up.`,
		commandYarnUnpublishedPackage: ({ pkg }) => `What a silly developer who made ${pkg}! They unpublished it!`,
		commandYarnPackageNotFound: ({ pkg }) => `I'm sorry, but I could not find any package by the name of \`${pkg}\` in the registry.`,
		commandYarnEmbedDescriptionAuthor: ({ author }) => `❯ Author: ${author}`,
		commandYarnEmbedDescriptionMaintainers: `❯ Maintainers: `,
		commandYarnEmbedDescriptionLatestVersion: ({ latestVersionNumber }) => `❯ Latest version: **${latestVersionNumber}**`,
		commandYarnEmbedDescriptionLicense: ({ license }) => `❯ License: **${license}**`,
		commandYarnEmbedDescriptionMainFile: ({ mainFile }) => `❯ Main File: **${mainFile}**`,
		commandYarnEmbedDescriptionDateCreated: ({ dateCreated }) => `❯ Date Created: **${dateCreated}**`,
		commandYarnEmbedDescriptionDateModified: ({ dateModified }) => `❯ Date Modified: **${dateModified}**`,
		commandYarnEmbedDescriptionDeprecated: ({ deprecated }) => `❯ Deprecation Notice: **${deprecated}**`,
		commandYarnEmbedDescriptionDependenciesLabel: '__*Dependencies:*__',
		commandYarnEmbedDescriptionDependenciesNoDeps: `No dependencies ${GREENTICK}!`,
		commandYarnEmbedMoreText: 'more...',

		/**
		 * ##############
		 * FUN COMMANDS
		 */

		command8ballOutput: ({ author, question, response }) => `🎱 Question by ${author}: *${question}*\n${response}`,
		command8ballQuestions: {
			When: 'when',
			What: 'what',
			HowMuch: 'how much',
			HowMany: 'how many',
			Why: 'why',
			Who: 'who'
		},
		command8ballWhen: ['Soon™', 'Maybe tomorrow.', 'Maybe next year...', 'Right now.', 'In a few months.'],
		command8ballWhat: ['A plane.', 'What? Ask again.', 'A gift.', 'Nothing.', 'A ring.', 'I do not know, maybe something.'],
		command8ballHowMuch: [
			'A lot.',
			'A bit.',
			'A few.',
			'Ask me tomorrow.',
			'I do not know, ask a physicist.',
			'Nothing.',
			`Within ${random(10)} and ${random(1000)}L.`,
			`${random(10)}e${random(1000)}L.`,
			"2 or 3 liters, I don't remember.",
			'Infinity.',
			'1010 liters.'
		],
		command8ballHowMany: [
			'A lot.',
			'A bit.',
			'A few.',
			'Ask me tomorrow.',
			"I don't know, ask a physicist.",
			'Nothing.',
			`Within ${random(10)} and ${random(1000)}.`,
			`${random(10)}e${random(1000)}.`,
			'2 or 3, I do not remember.',
			'Infinity',
			'1010.'
		],
		command8ballWhy: [
			'Maybe genetics.',
			'Because somebody decided it.',
			'For the glory of satan, of course!',
			'I do not know, maybe destiny.',
			'Because I said so.',
			'I have no idea.',
			'Ask the owner of this server.',
			'Ask again.',
			'To get to the other side.',
			'It says so in the Bible.'
		],
		command8ballWho: [
			'A human.',
			'A robot.',
			'An airplane.',
			'A bird.',
			'A carbon composition.',
			'A bunch of zeroes and ones.',
			'I have no clue, is it material?',
			'That is not logical.'
		],
		command8ballElse: [
			'Most likely.',
			'Nope.',
			'YES!',
			'Maybe.',
			'As I see it, yes',
			'Ask me tomorrow.',
			"I don't know, ask a physicist.",
			'Better not tell you now.',
			'Don’t count on it.',
			'It is certain.',
			'It is decidedly so.',
			'My sources say no.',
			'Outlook not so good.',
			'Outlook good.',
			'Reply hazy, try again.',
			'Signs point to yes.',
			'Very doubtful.',
			'Without a doubt.',
			'Yes – definitely.',
			'You may rely on it.'
		],

		commandCatfactTitle: 'Cat Fact',
		commandChoiceOutput: ({ user, word }) => `🕺 *Eeny, meeny, miny, moe, catch a tiger by the toe...* ${user}, I choose:${codeBlock('', word)}`,
		commandChoiceMissing: 'Please write at least two options separated by comma.',
		commandChoiceDuplicates: ({ words }) => `Why would I accept duplicated words? '${words}'.`,
		commandDiceOutput: ({ result }) => `You rolled the dice! You got: **${result}**`,
		commandDiceRollsError: 'Amount of rolls must be a number between 1 and 1024.',
		commandDiceSidesError: 'Amount of sides must be a number between 3 and 1024.',
		commandEscaperopeOutput: ({ user }) => `**${user}** used **Escape Rope**`,
		commandLoveLess45: 'Try again next time...',
		commandLoveLess75: 'Good enough!',
		commandLoveLess100: 'Good match!',
		commandLove100: 'Perfect match!',
		commandLoveItself: 'You are a special creature and you should love yourself more than anyone <3',
		commandLoveResult: 'Result',
		commandMarkovTimer: ({ timer }) => `Processed in ${timer}.`,
		commandMarkovNoMessages: 'The channel or user has no messages.',
		commandNorrisOutput: 'Chuck Norris',
		commandRateOutput: ({ author, userToRate, rate, emoji }) => `**${author}**, I would give **${userToRate}** a **${rate}**/100 ${emoji}`,
		commandRateMyself: ['. I love myself a lot 😊', 'myself'],
		commandRateOwners: ['. I love my developers a lot 🥰', 'my developers'],
		commandPunError: 'Something went wrong. Try again later.',
		commandXkcdComics: ({ amount }) => `There are only ${amount} comics.`,
		commandXkcdNotfound: 'I have searched far and wide, but I got no luck finding this comic, try again later or try another!',

		/**
		 * ##############
		 * GAMES COMMANDS
		 */

		commandGamesSkyra: 'I am sorry, I know you want to play with me, but if I do, I will not be able to help other people! 💔',
		commandGamesBot: 'I am sorry, but I do not think they would like to stop doing what they are doing and play with humans.',
		commandGamesSelf: 'You must be so sad to play against yourself. Try again with another user.',
		commandGamesProgress: 'I am sorry, but there is a game in progress in this channel, try again when it finishes.',
		commandGamesNoPlayers: ({ prefix }) => `Please specify some tributes to play the Hunger Games, like so: \`${prefix}hg Bob, Mark, Jim, Kyra\``,
		commandGamesTooManyOrFew: ({ min, max }) => `I am sorry but the amount of players is less than ${min} or greater than ${max}.`,
		commandGamesRepeat: 'I am sorry, but a user cannot play twice.',
		commandGamesPromptTimeout: 'I am sorry, but the challengee did not reply on time.',
		commandGamesPromptDeny: 'I am sorry, but the challengee refused to play.',
		commandGamesTimeout: '**The match concluded in a draw due to lack of a response (60 seconds)**',
		commandC4Prompt: ({ challenger, challengee }) =>
			`Dear ${challengee}, you have been challenged by ${challenger} in a Connect-Four match. Reply with **yes** to accept!`,
		commandC4Start: ({ player }) => `Let's play! Turn for: **${player}**.`,
		commandC4GameColumnFull: 'This column is full. Please try another. ',
		commandC4GameWin: ({ user }) => `${user} (red) won!`,
		commandC4GameWinTurn0: ({ user }) => `${user} (blue) won!`,
		commandC4GameDraw: 'This match concluded in a **draw**!',
		commandC4GameNext: ({ user }) => `Turn for: ${user} (red).`,
		commandC4GameNextTurn0: ({ user }) => `Turn for: ${user} (blue).`,
		commandC4Description: 'Play Connect-Four with somebody.',
		commandC4Extended: {
			extendedHelp: [
				'This game is best played on PC.',
				'Connect Four is a two-player connection game in which the players first choose a color and then take turns dropping colored discs from the top into a seven-column, six-row vertically suspended grid.'
			],
			multiline: true
		},
		commandCoinFlipDescription: 'Flip a coin!',
		commandCoinFlipExtended: {
			extendedHelp: [
				'Flip a coin. If you guess the side that shows up, you get back your wager, doubled.',
				"If you don't, you lose your wager.",
				"You can also run a cashless flip, which doesn't cost anything, but also doesn't reward you with anything.",
				"Now get those coins flippin'."
			],
			examples: ['heads 50', 'tails 200'],
			multiline: true
		},
		commandCoinFlipInvalidCoinname: ({ arg }) => `Excuse me, but ${arg} is not a coin face!`,
		commandCoinFlipCoinnames: ['Heads', 'Tails'],
		commandCoinFlipWinTitle: 'You won!',
		commandCoinFlipLoseTitle: 'You lost.',
		commandCoinFlipNoguessTitle: 'You flipped a coin.',
		commandCoinFlipWinDescription: ({ result }) => `The coin was flipped, and it showed ${result}. You got it right!`,
		commandCoinFlipWinDescriptionWithWager: ({ result, wager }) =>
			`The coin was flipped, and it showed ${result}. You guessed correctly and won ${wager} ${SHINY}!`,
		commandCoinFlipLoseDescription: ({ result }) => `The coin was flipped, and it showed ${result}. You didn\'t guess corectly.`,
		commandCoinFlipLoseDescriptionWithWager: ({ result, wager }) =>
			`The coin was flipped, and it showed ${result}. You didn\'t guess corectly and lost ${wager} ${SHINY}.`,
		commandCoinFlipNoguessDescription: ({ result }) => `The coin was flipped, and it showed ${result}.`,
		commandHigherLowerDescription: 'Play a game of Higher/Lower',
		commandHigherLowerExtended: {
			extendedHelp: [
				'Higher/Lower is a game of luck.',
				"I will pick a number and you'll have to guess if the next number I pick will be **higher** or **lower** than the current one, using the ⬆ or ⬇ emojis.",
				'Your winnings increase as you progress through the rounds, and you can cashout any time by pressing the 💰 emoji.',
				'Be warned though! The further you go, the more chances you have to lose the winnings.'
			],
			multiline: true
		},
		commandHigherLowerLoading: `${LOADING} Starting a new game of Higher/Lower.`,
		commandHigherLowerNewround: 'Alright. Starting new round.',
		commandHigherLowerEmbed: ({ turn, number }) => ({
			title: `Higher or Lower? | Turn ${turn}`,
			description: `Your number is ${number}. Will the next number be higher or lower?`,
			footer: 'The game will expire in 3 minutes, so act fast!'
		}),
		commandHigherLowerLose: ({ number, losses }) => ({
			title: 'You lost!',
			description: `You didn't quite get it. The number was ${number}. You lost ${losses} ${SHINY}.`,
			footer: 'Better luck next time!'
		}),
		commandHigherLowerWin: ({ potentials, number }) => ({
			title: 'You won!',
			description: `The number was ${number}. Want to continue? With another attempt, you can win ${potentials} ${SHINY}!`,
			footer: "Act fast! You don't have much time."
		}),
		commandHigherLowerCancel: ({ username }) => ({
			title: 'Game cancelled by choice',
			description: `Thanks for playing, ${username}! I'll be here when you want to play again.`
		}),
		commandHigherLowerCashout: ({ amount }) => `Paid out ${amount} ${SHINY} to your account. Hope you had fun!`,
		commandHungerGamesResultHeaderBloodbath: () => 'Bloodbath',
		commandHungerGamesResultHeaderSun: ({ game }) => `Day ${game.turn}`,
		commandHungerGamesResultHeaderMoon: ({ game }) => `Night ${game.turn}`,
		commandHungerGamesResultDeaths: ({ deaths }) => `**${deaths} cannon shot can be heard in the distance.**`,
		commandHungerGamesResultDeathsPlural: ({ deaths }) => `**${deaths} cannon shots can be heard in the distance.**`,
		commandHungerGamesResultProceed: 'Proceed?',
		commandHungerGamesStop: 'Game finished by choice! See you later!',
		commandHungerGamesWinner: ({ winner }) => `And the winner is... ${winner}!`,
		commandHungerGamesDescription: 'Play Hunger Games with your friends!',
		commandHungerGamesExtended: {
			extendedHelp: 'Enough discussion, let the games begin!',
			examples: ['Skyra, Katniss, Peeta, Clove, Cato, Johanna, Brutus, Blight']
		},
		commandSlotmachineDescription: `I bet 100 ${SHINY}'s you ain't winning this round.`,
		commandSlotmachineExtended: {
			extendedHelp: `Spin a slot machine of 3 reels and gamble your shinies for larger rewards.`,
			explainedUsage: [['Amount', `Either 50, 100, 200, 500, or even, 1000 ${SHINY} to bet.`]],
			reminder: 'You will receive at least 5 times the amount (cherries/tada) at win, and up to 24 times (seven, diamond without skin).'
		},
		commandSlotmachinesWin: ({ roll, winnings }) => `**You rolled:**\n${roll}\n**Congratulations!**\nYou won ${winnings}${SHINY}!`,
		commandSlotmachinesLoss: ({ roll }) => `**You rolled:**\n${roll}\n**Mission failed!**\nWe'll get em next time!`,
		commandSlotmachineCanvasTextWon: 'You won',
		commandSlotmachineCanvasTextLost: 'You lost',
		commandSlotmachineTitles: {
			previous: 'Previous',
			new: 'New'
		},
		commandTicTacToeDescription: 'Play Tic-Tac-Toe with somebody.',
		commandTicTacToeExtended: {
			extendedHelp: [
				'Tic-tac-toe (also known as noughts and crosses or Xs and Os) is a paper-and-pencil game for two players, X and O, who take turns marking the spaces in a 3×3 grid.',
				'The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row wins the game.'
			],
			multiline: true
		},
		commandTicTacToePrompt: ({ challenger, challengee }) =>
			`Dear ${challengee}, you have been challenged by ${challenger} in a Tic-Tac-Toe match. Reply with **yes** to accept!`,
		commandTicTacToeTurn: ({ icon, player, board }) => `(${icon}) Turn for ${player}!\n${board}`,
		commandTicTacToeWinner: ({ winner, board }) => `Winner is... ${winner}!\n${board}`,
		commandTicTacToeDraw: ({ board }) => `This match concluded in a **draw**!\n${board}`,
		commandTriviaDescription: 'Play a game of Trivia.',
		commandTriviaExtended: {
			extendedHelp: [
				'Answer questions of trivia here, with categories ranging from books to mythology! (powered by OpenTDB)',
				'',
				`**Categories**: ${Object.keys(CATEGORIES).join(', ')}`
			],
			explainedUsage: [
				['category', 'The category questions are asked from.'],
				['type', 'The type of question asked: can be boolean (true/false) or multiple choice.'],
				['difficulty', 'The difficulty level of the questions asked.'],
				['duration', 'The amount of time you get to answer.']
			],
			examples: ['trivia history.', 'trivia books multiple easy.', 'trivia videogames 45.'],
			multiline: true
		},
		commandTriviaInvalidCategory: 'Invalid category: Please use `Skyra, help trivia` for a list of categories.',
		commandTriviaActiveGame: 'A game of trivia is already being played in this channel',
		commandTriviaIncorrect: ({ attempt }) => `I am sorry, but **${attempt}** is not the correct answer. Better luck next time!`,
		commandTriviaNoAnswer: ({ correctAnswer }) => `Looks like nobody got it! The right answer was **${correctAnswer}**.`,
		commandTriviaEmbedTitles: {
			trivia: 'Trivia',
			difficulty: 'Difficulty'
		},
		commandTriviaWinner: ({ winner, correctAnswer }) => `We have a winner! ${winner} had a right answer with **${correctAnswer}**!`,
		commandVaultDescription: `Store your ${SHINY}'s securily in a vault so you cannot accidentally spend them gambling.`,
		commandVaultExtended: {
			extendedHelp: [
				'This is for the greedy spenders among us that tend to play a bit too much at the slot machine or spin the wheel of fortune.',
				`You need to actively withdraw ${SHINY}'s from your vault before they can be spend gambling.`
			],
			explainedUsage: [
				['action', 'The action to perform: **withdraw** to withdraw from your vault or **deposit** to deposit into your vault.'],
				['money', `The amount of ${SHINY}'s to withdraw or deposit.`]
			],
			examples: ['deposit 10000.', 'withdraw 10000.'],
			multiline: true
		},
		commandVaultEmbedData: ({ coins }) => ({
			depositedDescription: `Deposited ${coins} ${SHINY} from your account balance into your vault.`,
			withdrewDescription: `Withdrew ${coins} ${SHINY}\ from your vault.`,
			showDescription: 'Your current account and vault balance are:',
			accountMoney: 'Account Money',
			accountVault: 'Account Vault'
		}),
		commandVaultInvalidCoins: 'I am sorry, but that is an invalid amount of coins. Be sure it is a positive number!',
		commandVaultNotEnoughMoney: ({ money }) =>
			`I am sorry, but you do not have enough money to make that deposit! Your current money balance is ${money} ${SHINY}`,
		commandVaultNotEnoughInVault: ({ vault }) =>
			`I am sorry, but you do not have enough money in your vault to make that withdrawal! Your current vault balance is ${vault} ${SHINY}`,
		commandWheelOfFortuneDescription: 'Gamble your shinies by spinning a wheel of fortune',
		commandWheelOfFortuneExtended: {
			extendedHelp: `You can lose 0.1, 0.2, 0.3 or 0.5 times your input or win 1.2, 1.5, 1.7 or 2.4 times your input`
		},
		commandWheelOfFortuneTitles: {
			previous: 'Previous',
			new: 'New'
		},
		commandWheelOfFortuneCanvasTextWon: 'You won',
		commandWheelOfFortuneCanvasTextLost: 'You lost',
		gamesNotEnoughMoney: ({ money }) =>
			`I am sorry, but you do not have enough money to pay your bet! Your current account balance is ${money} ${SHINY}`,
		gamesCannotHaveNegativeMoney: `You cannot have a negative amount of ${SHINY}s`,

		/**
		 * #################
		 * GIVEAWAY COMMANDS
		 */

		giveawayTime: 'A giveaway must last at least 10 seconds.',
		giveawayTimeTooLong: "Hey! That's an incredibly long time to keep track of!",
		giveawayEndsAt: 'Ends at:',
		giveawayDuration: ({ time }) => `This giveaway ends in **${this.duration(time)}**! React to this message with 🎉 to join.`,
		giveawayTitle: '🎉 **GIVEAWAY** 🎉',
		giveawayLastchance: ({ time }) => `**LAST CHANCE**! Remaining time: **${this.duration(time)}**. React to this message with 🎉 to join.`,
		giveawayLastchanceTitle: '🎉 **LAST CHANCE GIVEAWAY** 🎉',
		giveawayEnded: ({ winners }) => `Winner: ${winners}`,
		giveawayEndedPlural: ({ winners }) => `Winners: ${winners}`,
		giveawayEndedNoWinner: 'No winner...',
		giveawayEndedAt: 'Ended at:',
		giveawayEndedTitle: '🎉 **GIVEAWAY ENDED** 🎉',
		giveawayEndedMessage: ({ winners, title }) => `Congratulations ${winners.join(' ')}! You won the giveaway **${title}**`,
		giveawayEndedMessageNoWinner: ({ title }) => `The giveaway **${title}** ended without enough participants.`,
		giveawayScheduled: ({ scheduledTime }) => `The giveaway will start in ${this.duration(scheduledTime)}.`,

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		commandNickSet: ({ nickname }) => `Changed the nickname to **${nickname}**.`,
		commandNickCleared: 'Nickname cleared.',
		commandPermissionNodesHigher: `${REDCROSS} You cannot modify nor preview the permission nodes for this target.`,
		commandPermissionNodesInvalidType: `${REDCROSS} Invalid type, expected either of \`allow\` or \`deny\`.`,
		commandPermissionNodesAdd: `${GREENTICK} Successfully added the command to the permission node.`,
		commandPermissionNodesNodeNotExists: `${REDCROSS} The selected permission node does not exist.`,
		commandPermissionNodesCommandNotExists: `${REDCROSS} The selected command does not exist in the permision node.`,
		commandPermissionNodesRemove: `${GREENTICK} Successfully removed the command from the permission node.`,
		commandPermissionNodesReset: `${GREENTICK} Successfully removed all commands from the permission node.`,
		commandPermissionNodesShowName: ({ name }) => `Permissions for: __${name}__`,
		commandPermissionNodesShowAllow: ({ allow }) => `**Allow**: ${allow}`,
		commandPermissionNodesShowDeny: ({ deny }) => `**Deny**: ${deny}`,
		commandTriggersNotype: 'You need to insert a trigger type (**alias**|**reaction**)',
		commandTriggersNooutput: 'You need to insert the trigger output.',
		commandTriggersInvalidreaction: 'This reaction does not seem valid for me, either it is not valid unicode or I do not have access to it.',
		commandTriggersInvalidalias: 'There is no command like this.',
		commandTriggersRemoveNottaken: 'There is no trigger with this input.',
		commandTriggersRemove: 'Successfully removed this trigger.',
		commandTriggersAddTaken: 'There is already a trigger with this input.',
		commandTriggersAdd: 'Successfully added the trigger.',
		commandTriggersListEmpty: 'The trigger list for this guild is empty.',
		commandGuildInfoTitles: {
			CHANNELS: 'Channels',
			MEMBERS: 'Members',
			OTHER: 'Other'
		},
		commandGuildInfoRoles: ({ roles }) => `**Roles**\n\n${roles}`,
		commandGuildInfoNoroles: 'Roles? Where? There is no other than the `@everyone` role!',
		commandGuildInfoChannels: ({ text, voice, categories, afkChannelText }) => [
			`• **${text}** Text, **${voice}** Voice, **${categories}** categories.`,
			`• AFK: ${afkChannelText}`
		],
		commandGuildInfoChannelsAfkChannelText: ({ afkChannel, afkTime }) => `**<#${afkChannel}>** after **${afkTime / 60}**min`,
		commandGuildInfoMembers: ({ count, owner }) => [`• **${count}** members`, `• Owner: **${owner.tag}**`, `  (ID: **${owner.id}**)`],
		commandGuildInfoOther: ({ size, region, createdAt, verificationLevel }) => [
			`• Roles: **${size}**`,
			`• Region: **${region}**`,
			`• Created at: **${timestamp.displayUTC(createdAt)}** (UTC - YYYY/MM/DD)`,
			`• Verification Level: **${this.HUMAN_LEVELS[verificationLevel]}**`
		],
		commandRoleInfoTitles: { PERMISSIONS: 'Permissions' },
		commandRoleInfoData: ({ role, hoisted, mentionable }) => [
			`ID: **${role.id}**`,
			`Name: **${role.name}**`,
			`Color: **${role.hexColor}**`,
			`Hoisted: **${hoisted}**`,
			`Position: **${role.rawPosition}**`,
			`Mentionable: **${mentionable}**`
		],
		commandRoleInfoAll: 'All Permissions granted.',
		commandRoleInfoNoPermissions: 'Permissions not granted.',
		commandFilterUndefinedWord: 'You must write what you want me to filter.',
		commandFilterAlreadyFiltered: `This word is already filtered.`,
		commandFilterNotFiltered: `This word is not filtered.`,
		commandFilterAdded: ({ word }) => `${GREENTICK} Success! Added the word ${word} to the filter.`,
		commandFilterRemoved: ({ word }) => `${GREENTICK} Success! Removed the word ${word} from the filter.`,
		commandFilterReset: `${GREENTICK} Success! The filter has been reset.`,
		commandFilterShowEmpty: 'The list of filtered words is empty!',
		commandFilterShow: ({ words }) => `Filtered words in this server: ${words}`,

		/**
		 * #################################
		 * MANAGEMENT/CONFIGURATION COMMANDS
		 */

		commandManageCommandAutoDeleteTextChannel:
			'You must input a valid text channel, people cannot use commands in a voice or a category channel!',
		commandManageCommandAutoDeleteRequiredDuration: 'You must specify an amount of seconds for the command to be automatically deleted.',
		commandManageCommandAutoDeleteShowEmpty: 'There are no command autodelete configured right now.',
		commandManageCommandAutoDeleteShow: ({ codeblock }) => `All command autodeletes configured:${codeblock}`,
		commandManageCommandAutoDeleteAdd: ({ channel, time }) =>
			`${GREENTICK} Success! All successful commands in ${channel} will be deleted after ${this.duration(time)}!`,
		commandManageCommandAutoDeleteRemove: ({ channel }) =>
			`${GREENTICK} Success! Commands will not be automatically deleted in ${channel} anymore!`,
		commandManageCommandAutoDeleteRemoveNotset: ({ channel }) =>
			`${REDCROSS} The channel ${channel} was not configured to automatically delete messages!`,
		commandManageCommandAutoDeleteReset: 'All the command autodeletes have been reset.',
		commandManageCommandChannelTextChannel: 'You must input a valid text channel, people cannot use commands in a voice or a category channel!',
		commandManageCommandChannelRequiredCommand: "You must specify what command do you want to add or remove from the channel's filter.",
		commandManageCommandChannelShow: ({ channel, commands }) => `List of disabled commands in ${channel}: ${commands}`,
		commandManageCommandChannelShowEmpty: 'The list of disabled commands for the specified channel is empty!',
		commandManageCommandChannelAddAlreadyset: 'The command you are trying to disable is already disabled!',
		commandManageCommandChannelAdd: ({ channel, command }) => `Successfully disabled the command ${command} for the channel ${channel}!`,
		commandManageCommandChannelRemoveNotset: ({ channel }) => `The command you are trying to enable was not disabled for ${channel}.`,
		commandManageCommandChannelRemove: ({ channel, command }) => `Successfully enabled the command ${command} for the channel ${channel}!`,
		commandManageCommandChannelResetEmpty: 'This channel had no disabled command, so I decided to do nothing.',
		commandManageCommandChannelReset: ({ channel }) => `Successfully enabled all disabled commands in ${channel}, enjoy!`,
		commandManageReactionRolesShowEmpty: 'There are no reaction roles set up in this server.',
		commandManageReactionRolesAddChannel: ({ emoji, channel }) =>
			`${GREENTICK} Success! I will now give the role when people react with ${emoji} to any message from ${channel}!`,
		commandManageReactionRolesAddPrompt: 'Listening now! Please react to a message and I will bind the reaction with the role!',
		commandManageReactionRolesAddMissing: 'I waited, but you did not seem to have reacted to a message.',
		commandManageReactionRolesAdd: ({ emoji, url }) =>
			`${GREENTICK} Success! I will now give the role when people react with ${emoji} at ${url}!`,
		commandManageReactionRolesRemoveNotExists: 'The reaction role you specified does not exist.',
		commandManageReactionRolesRemove: ({ emoji, url }) =>
			`${GREENTICK} Success! I will not longer give the role when people react with ${emoji} at ${url}!`,
		commandManageReactionRolesResetEmpty: 'There were no reaction roles set up.',
		commandManageReactionRolesReset: `${GREENTICK} Successfully removed all reaction roles.`,
		commandSetStarboardEmojiSet: ({ emoji }) => `Successfully set a new emoji for the next star messages: ${emoji}`,
		configurationTextChannelRequired: 'The selected channel is not a valid text channel, try again with another.',
		configurationEquals: 'Successfully configured: no changes were made.',
		commandSetIgnoreChannelsSet: ({ channel }) => `Ignoring all command input from ${channel} now.`,
		commandSetIgnoreChannelsRemoved: ({ channel }) => `Listening all command input from ${channel} now.`,
		commandSetImageLogsSet: ({ channel }) => `Successfully set the image logs channel to ${channel}.`,
		commandSetMemberLogsSet: ({ channel }) => `Successfully set the member logs channel to ${channel}.`,
		commandSetMessageLogsSet: ({ channel }) => `Successfully set the message logs channel to ${channel}.`,
		commandSetModLogsSet: ({ channel }) => `Successfully set the mod logs channel to ${channel}.`,
		commandSetPrefixSet: ({ prefix }) => `Successfully set the prefix to ${prefix}. Use ${prefix}setPrefix <prefix> to change it again.`,

		/**
		 * ###########################
		 * MANAGEMENT/MEMBERS COMMANDS
		 */

		commandStickyRolesRequiredUser: 'A user target is required for this command to work.',
		commandStickyRolesRequiredRole: 'A role name is required when adding or removing a role.',
		commandStickyRolesNotExists: ({ user }) => `The user ${user} does not have any sticky roles or does not have the specified one.`,
		commandStickyRolesReset: ({ user }) => `Successfully removed all sticky roles from ${user}.`,
		commandStickyRolesRemove: ({ user }) => `Successfully removed the specified role from ${user}.`,
		commandStickyRolesAddExists: ({ user }) => `The user ${user} already had the specified role as sticky.`,
		commandStickyRolesAdd: ({ user }) => `Successfully added the specified role as sticky to ${user}.`,
		commandStickyRolesShowEmpty: 'There are no sticky roles to show.',
		commandStickyRolesShowSingle: ({ user, roles }) => `Sticky Role(s) for **${user}**: ${roles}.`,

		/**
		 * #############
		 * MISC COMMANDS
		 */

		commandRandRedditRequiredReddit: 'You must give the name of a reddit.',
		commandRandRedditInvalidArgument: `${REDCROSS} The name you gave was not a valid name for a subreddit.`,
		commandRandRedditBanned: 'This reddit is banned and should not be used.',
		commandRandRedditFail: 'I failed to retrieve data, are you sure you wrote the reddit correctly?',
		commandRandRedditAllNsfw: 'Nothing could be posted as all retrieved posts are NSFW.',
		commandRandRedditAllNsfl: 'Nothing could be posted as all retrieved posts are NSFL. You do not want to see that.',
		commandRandRedditMessage: ({ title, author, url }) => `**${title}** submitted by ${author}\n${url}`,
		commandRandRedditErrorPrivate: `${REDCROSS} No data could be downloaded as the subreddit is marked as private.`,
		commandRandRedditErrorQuarantined: `${REDCROSS} No data could be downloaded as the subreddit is marked as quarantined.`,
		commandRandRedditErrorNotFound: `${REDCROSS} No data could be downloaded as the subreddit does not exist.`,
		commandRandRedditErrorBanned: `${REDCROSS} No data could be downloaded as the subreddit is marked as banned.`,
		commandRedditUserComplexityLevels: ['very low', 'low', 'medium', 'high', 'very high', 'very high'],
		commandRedditUserInvalidUser: ({ user }) => `\`${user}\` is not a valid Reddit username`,
		commandRedditUserQueryFailed: "Couldn't find any data for that reddit user",
		commandRedditUserTitles: {
			linkKarma: 'Link Karma',
			commentKarma: 'Comment Karma',
			totalComments: 'Total Comments',
			totalSubmissions: 'Total Submissions',
			commentControversiality: 'Comment Controversiality',
			textComplexity: 'Text Complexity',
			top5Subreddits: 'Top 5 Subreddits',
			bySubmissions: 'by submission',
			byComments: 'by comments',
			bestComment: 'Best Comment',
			worstComment: 'Worst Comment'
		},
		commandRedditUserData: ({ user, timestamp }) => ({
			overviewFor: `Overview for /u/${user}`,
			permalink: 'Permalink',
			dataAvailableFor: 'Data is available for the past 1000 comments and submissions (Reddit API limitation)',
			joinedReddit: `Joined Reddit ${timestamp}`
		}),
		commandSnipeEmpty: 'There are no sniped messages in this channel.',
		commandSnipeTitle: 'Sniped Message',
		commandUpvoteMessage:
			'Upvote me on **https://top.gg/bot/266624760782258186**, **https://botsfordiscord.com/bot/266624760782258186**, or **https://botlist.space/bot/266624760782258186** for free shinies! Remember, you can vote every 24 hours.',
		commandVaporwaveOutput: ({ str }) => `Here is your converted message:\n${str}`,

		/**
		 * #############################
		 * MODERATION/UTILITIES COMMANDS
		 */

		commandPermissions: ({ username, id }) => `Permissions for ${username} (${id})`,
		commandPermissionsAll: 'All Permissions',
		commandFlow: ({ amount }) => `${amount} messages have been sent within the last minute.`,
		commandTimeTimed: 'The selected moderation case has already been timed.',
		commandTimeUndefinedTime: 'You must specify a time.',
		commandTimeUnsupportedType: 'The type of action for the selected case cannot be reverse, therefore this action is unsupported.',
		commandTimeNotScheduled: 'This task is not scheduled.',
		commandTimeAborted: ({ title }) => `Successfully aborted the schedule for ${title}`,
		commandTimeScheduled: ({ title, user, time }) =>
			`${GREENTICK} Successfully scheduled a moderation action type **${title}** for the user ${user.tag} (${
				user.id
			}) with a duration of ${this.duration(time)}`,

		/**
		 * ###################
		 * MODERATION COMMANDS
		 */

		commandSlowmodeSet: ({ cooldown }) => `The cooldown for this channel has been set to ${this.duration(cooldown)}.`,
		commandSlowmodeReset: 'The cooldown for this channel has been reset.',
		commandSlowmodeTooLong: `${REDCROSS} The maximum amount of time you can set is 6 hours.`,
		commandTimeDescription: 'Set the timer.',
		commandTimeExtended: {
			extendedHelp: 'Updates the timer for a moderation case..',
			explainedUsage: [
				['cancel', 'Whether or not you want to cancel the timer.'],
				['case', 'The case you want to update'],
				['timer', 'The timer, ignored if `cancel` was defined.']
			],
			examples: ['cancel 1234', '1234 6h']
		},
		commandBanNotBannable: 'The target is not bannable for me.',
		commandDehoistStarting: ({ count }) => `I will start dehoisting ${count} members...`,
		commandDehoistProgress: ({ count, percentage }) => `Dehoisted ${count} members so far! (${percentage}%)`,
		commandDehoistEmbed: ({ users, dehoistedMemberCount, dehoistedWithErrorsCount, errored }) => ({
			title: `Finished dehoisting ${users} members`,
			descriptionNoone: 'No members were dehoisted. A round of applause for your law-abiding users!',
			descriptionWithError: `${dehoistedWithErrorsCount} member was dehoisted. We also tried to dehoist an additional ${errored} member, but they errored out`,
			descriptionWithMultipleErrors: `${dehoistedWithErrorsCount} members were dehoisted. We also tried to dehoist an additional ${errored} members, but they errored out`,
			description: `${dehoistedMemberCount} member was dehoisted`,
			descriptionMultipleMembers: `${dehoistedMemberCount} members were dehoisted`,
			fieldErrorTitle: 'The users we encountered an error for:'
		}),
		commandKickNotKickable: 'The target is not kickable for me.',
		commandLockdownLock: ({ channel }) => `The channel ${channel} is now locked.`,
		commandLockdownLocking: ({ channel }) => `${LOADING} Locking the channel ${channel}... I might not be able to reply after this.`,
		commandLockdownLocked: ({ channel }) => `The channel ${channel} was already locked.`,
		commandLockdownUnlocked: ({ channel }) => `The channel ${channel} was not locked.`,
		commandLockdownOpen: ({ channel }) => `The lockdown for the channel ${channel} has been released.`,
		commandMuteLowlevel: 'I am sorry, there is no Mute role configured. Please ask an Administrator or the Guild Owner to set it up.',
		commandMuteConfigureCancelled: 'Prompt aborted, the Mute role creation has been cancelled.',
		commandMuteConfigure: 'Do you want me to create and configure the Mute role now?',
		commandMuteConfigureToomanyRoles: 'There are too many roles (250). Please delete a role before proceeding.',
		commandMuteMuted: 'The target user is already muted.',
		commandMuteUserNotMuted: 'This user is not muted.',
		commandMuteUnconfigured: 'This guild does not have a **Muted** role. Aborting command execution.',
		commandMutecreateMissingPermission: `I need the **${this.PERMISSIONS.MANAGE_ROLES}** permission to create the role and **${this.PERMISSIONS.MANAGE_CHANNELS}** to edit the channels permissions.`,
		commandRestrictLowlevel: `${REDCROSS} I'm sorry, there is no restriction role configured. Please ask an Administrator or the server owner to set it up.`,
		commandPruneInvalid: `${REDCROSS} You did not specify the arguments correctly, please make sure you gave a correct limit or filter.`,
		commandPruneAlert: ({ count, total }) => `Successfully deleted ${count} message from ${total}.`,
		commandPruneAlertPlural: ({ count, total }) => `Successfully deleted ${count} messages from ${total}.`,
		commandPruneInvalidPosition: `${REDCROSS} Position must be one of "before" or "after".`,
		commandPruneInvalidFilter: `${REDCROSS} Filter must be one of "file", "author", "bot", "human", "invite", "link", or "skyra".`,
		commandPruneNoDeletes: 'No message has been deleted, either no message match the filter or they are over 14 days old.',
		commandPruneLogHeader:
			'The following messages have been generated by request of a moderator.\nThe date formatting is of `YYYY/MM/DD hh:mm:ss`.',
		commandPruneLogMessage: ({ channel, author, count }) => `${count} message deleted in ${channel} by ${author}.`,
		commandPruneLogMessagePlural: ({ channel, author, count }) => `${count} messages deleted in ${channel} by ${author}.`,
		commandReasonMissingCase: 'You need to provide a case or a case range.',
		commandReasonNotExists: `The selected modlog  doesn't seem to exist.`,
		commandReasonUpdated: ({ newReason }) => [`${GREENTICK} Updated 1 case`, ` └─ **Set its reason to:** ${newReason}`],
		commandReasonUpdatedPlural: ({ entries, newReason }) => [
			`${GREENTICK} Updated ${entries.length} cases`,
			` └─ **Set their reasons to:** ${newReason}`
		],
		commandToggleModerationDmToggledEnabled: `${GREENTICK} Successfully enabled moderation DMs.`,
		commandToggleModerationDmToggledDisabled: `${GREENTICK} Successfully disabled moderation DMs`,
		commandUnbanMissingPermission: `I will need the **${this.PERMISSIONS.BAN_MEMBERS}** permission to be able to unban.`,
		commandUnmuteMissingPermission: `I will need the **${this.PERMISSIONS.MANAGE_ROLES}** permission to be able to unmute.`,
		commandVmuteMissingPermission: `I will need the **${this.PERMISSIONS.MUTE_MEMBERS}** permission to be able to voice unmute.`,
		commandVmuteUserNotMuted: 'This user is not voice muted.',
		commandWarnDm: ({ moderator, guild, reason }) => `You have been warned by ${moderator} in ${guild} for the reason: ${reason}`,
		commandWarnMessage: ({ user, log }) => `|\`🔨\`| [Case::${log}] **WARNED**: ${user.tag} (${user.id})`,
		commandModerationOutput: ({ range, users }) => `${GREENTICK} Created case ${range} | ${users}.`,
		commandModerationOutputPlural: ({ range, users }) => `${GREENTICK} Created cases ${range} | ${users}.`,
		commandModerationOutputWithReason: ({ range, users, reason }) =>
			`${GREENTICK} Created case ${range} | ${users}.\nWith the reason of: ${reason}`,
		commandModerationOutputWithReasonPlural: ({ range, users, reason }) =>
			`${GREENTICK} Created cases ${range} | ${users}.\nWith the reason of: ${reason}`,
		commandModerationFailed: ({ users }) => `${REDCROSS} Failed to moderate user:\n${users}`,
		commandModerationFailedPlural: ({ users }) => `${REDCROSS} Failed to moderate users:\n${users}`,
		commandModerationDmFooter: 'To disable moderation DMs, write `toggleModerationDM`.',
		commandModerationDmDescription: ({ guild, title }) => [
			`**❯ Server**: ${guild}`, //
			`**❯ Type**: ${title}`,
			`**❯ Reason**: None specified`
		],
		commandModerationDmDescriptionWithReason: ({ guild, title, reason }) => [
			`**❯ Server**: ${guild}`,
			`**❯ Type**: ${title}`,
			`**❯ Reason**: ${reason}`
		],
		commandModerationDmDescriptionWithDuration: ({ guild, title, duration: pDuration }) => [
			`**❯ Server**: ${guild}`,
			`**❯ Type**: ${title}`,
			`**❯ Duration**: ${this.duration(pDuration!)}`,
			`**❯ Reason**: None specified`
		],
		commandModerationDmDescriptionWithReasonWithDuration: ({ guild, title, reason, duration: pDuration }) => [
			`**❯ Server**: ${guild}`,
			`**❯ Type**: ${title}`,
			`**❯ Duration**: ${this.duration(pDuration!)}`,
			`**❯ Reason**: ${reason}`
		],
		commandModerationDays: 'days?',

		/**
		 * ###############
		 * SOCIAL COMMANDS
		 */

		commandAutoRolePointsRequired: 'You must input a valid amount of points.',
		commandAutoRoleUpdateConfigured: 'This role is already configured as an autorole. Use the remove type instead.',
		commandAutoRoleUpdateUnconfigured: 'This role is not configured as an autorole. Use the add type instead.',
		commandAutoRoleUpdate: ({ role, points, before }) =>
			`Updated autorole: ${role.name} (${role.id}). Points required: ${points} (before: ${before})`,
		commandAutoRoleRemove: ({ role, before }) => `Removed the autorole: ${role.name} (${role.id}), which required ${before} points.`,
		commandAutoRoleAdd: ({ role, points }) => `Added new autorole: ${role.name} (${role.id}). Points required: ${points}`,
		commandAutoRoleListEmpty: 'There is no role configured as an autorole in this server.',
		commandAutoRoleUnknownRole: ({ role }) => `Unknown role: ${role}`,
		commandBalance: ({ user, amount }) => `The user ${user} has a total of ${amount}${SHINY}`,
		commandBalanceSelf: ({ amount }) => `You have a total of ${amount}${SHINY}`,
		commandBalanceBots: `I think they have 5 gears as much, bots don't have ${SHINY}`,
		commandSocialMemberNotexists: `${REDCROSS} The member is not in this server, and is not in my database either.`,
		commandSocialAdd: ({ user, amount, count }) => `${GREENTICK} Successfully added ${count} point to ${user}. Current amount: ${amount}.`,
		commandSocialAddPlural: ({ user, amount, count }) => `${GREENTICK} Successfully added ${count} points to ${user}. Current amount: ${amount}.`,
		commandSocialRemove: ({ user, amount, count }) => `${GREENTICK} Successfully removed ${count} point from ${user}. Current amount: ${amount}.`,
		commandSocialRemovePlural: ({ user, amount, count }) =>
			`${GREENTICK} Successfully removed ${count} points from ${user}. Current amount: ${amount}.`,
		commandSocialUnchanged: ({ user }) => `${REDCROSS} The user ${user} already had the given amount of points, no update was needed.`,
		commandSocialReset: ({ user }) => `${GREENTICK} The user ${user} got his points removed.`,
		commandBannerMissing: ({ type }) => `You must specify a banner id to ${type}.`,
		commandBannerNotexists: ({ prefix }) =>
			`This banner id does not exist. Please check \`${prefix}banner list\` for a list of banners you can buy.`,
		commandBannerUserlistEmpty: ({ prefix }) => `You did not buy a banner yet. Check \`${prefix}banner list\` for a list of banners you can buy.`,
		commandBannerResetDefault: 'You are already using the default banner.',
		commandBannerReset: 'Your banner has been reset to the default.',
		commandBannerSetNotBought: 'You did not buy this banner yet.',
		commandBannerSet: ({ banner }) => `|\`✅\`| **Success**. You have set your banner to: __${banner}__`,
		commandBannerBought: ({ prefix, banner }) =>
			`You already have this banner, you may want to use \`${prefix}banner set ${banner}\` to make it visible in your profile.`,
		commandBannerMoney: ({ money, cost }) =>
			`You do not have enough money to buy this banner. You have ${money}${SHINY}, the banner costs ${cost}${SHINY}`,
		commandBannerPaymentCancelled: '|`❌`| The payment has been cancelled.',
		commandBannerBuy: ({ banner }) => `|\`✅\`| **Success**. You have bought the banner: __${banner}__`,
		commandBannerPrompt:
			'Reply to this message choosing an option:\n`all` to check a list of all available banners.\n`user` to check a list of all bought banners.',
		commandToggleDarkModeEnabled: `${GREENTICK} Successfully enabled the dark mode.`,
		commandToggleDarkModeDisabled: `${GREENTICK} Successfully disabled the dark mode.`,
		commandDailyTime: ({ time }) => `Next dailies are available in ${this.duration(time)}`,
		commandDailyTimeSuccess: ({ amount }) => `Yay! You earned ${amount}${SHINY}! Next dailies in: 12 hours.`,
		commandDailyGrace: ({ remaining }) => [
			'Would you like to claim the dailies early? The remaining time will be added up to a normal 12h wait period.',
			`Remaining time: ${this.duration(remaining)}`
		],
		commandDailyGraceAccepted: ({ amount, remaining }) => `Successfully claimed ${amount}${SHINY}! Next dailies in: ${this.duration(remaining)}`,
		commandDailyGraceDenied: 'Got it! Come back soon!',
		commandDailyCollect: 'Collect dailies',
		commandLevel: {
			level: 'Level',
			experience: 'Experience',
			nextIn: 'Next level in'
		},
		commandDivorceSelf: 'I am sorry, but you cannot divorce yourself.',
		commandDivorceNotTaken: 'Who would you divorce? You are not even taken!',
		commandDivorcePrompt: 'Ooh... that sounds quite bad 💔... are you 100% sure about this?',
		commandDivorceCancel: 'Oh lord. I am very glad you will continue with your partner!',
		commandDivorceDm: ({ user }) => `Pardon... but... do you remember ${user}? They decided to break up with you 💔!`,
		commandDivorceSuccess: ({ user }) => `Successful divorce 💔... You are no longer married to ${user}!`,
		commandMarryWith: ({ users }) => `Dear, how could you forget it... You are currently married to ${this.list(users, 'and')}!`,
		commandMarryNotTaken: 'Uh... I am sorry, but I am not aware of you being married... have you tried proposing to somebody?',
		commandMarrySkyra: 'I am sorry, I know you love me, but I am already taken by a brave man I love 💞!',
		commandMarryAelia: 'In your dreams. She is my sister, I am not letting somebody harm her!',
		commandMarryBots: 'Oh no! You should not be marrying bots! They still do not understand what true love is, and they are not warm!',
		commandMarrySelf: 'No! This is not how this works! You cannot marry yourself, who would you spend your life with? 💔',
		commandMarryAuthorTaken: ({ author }) =>
			`You are already married. Is your love big enough for two people? <@${author.id}>, reply with **yes** to confirm!`,
		commandMarryAuthorMultipleCancel: ({ user }) => `Cancelling. Your commitment to ${user} is admirable.`,
		commandMarryTaken: () => `This user is already married to someone. Would you like to join their harem?`,
		commandMarryTakenPlural: ({ count: spousesCount }) =>
			`This user is already married to ${spousesCount} people. Would you like to join their harem?`,
		commandMarryAlreadyMarried: ({ user }) => `You are already married with ${user}, did you forget it?`,
		commandMarryAuthorTooMany: ({ limit }) => `${REDCROSS} You are married to too many people, your maximum is ${limit}!`,
		commandMarryTargetTooMany: ({ limit }) =>
			`${REDCROSS} The user you are trying to marry to is already married to too many people, their maximum is ${limit}!`,
		commandMarryMultipleCancel: "Cancelling. Don't worry, you'll find someone you don't have to share!",
		commandMarryPetition: ({ author, user }) =>
			`Fresh pair of eyes! ${author.username} is proposing to ${user.username}! 💞 <@${user.id}>, reply with **yes** to accept!`,
		commandMarryNoreply: 'The user did not reply on time... Maybe it was a hard decision?',
		commandMarryDenied: 'O-oh... The user rejected your proposal! 💔',
		commandMarryAccepted: ({ author, user }) => `Congratulations dear ${author}! You're now officially married with ${user}! ❤`,
		commandMylevel: ({ points, next, user }) => `The user ${user} has a total of ${points} points.${next}`,
		commandMylevelSelf: ({ points, next }) => `You have a total of ${points} points.${next}`,
		commandMylevelNext: ({ remaining, next }) => `Points for next rank: **${remaining}** (at ${next} points).`,
		commandPayMissingMoney: ({ needed, has }) => `I am sorry, but you need ${needed}${SHINY} and you have ${has}${SHINY}`,
		commandPayPrompt: ({ user, amount }) => `You are about to pay ${user} ${amount}${SHINY}, are you sure you want to proceed?`,
		commandPayPromptAccept: ({ user, amount }) => `Payment accepted, ${amount}${SHINY} has been sent to ${user}'s profile.`,
		commandPayPromptDeny: 'Payment denied.',
		commandPaySelf: 'If I taxed this, you would lose money, therefore, do not try to pay yourself.',
		commandSocialPayBot: 'Oh, sorry, but money is meaningless for bots, I am pretty sure a human would take advantage of it better.',
		commandProfile: {
			globalRank: 'Global Rank',
			credits: 'Credits | Vault',
			reputation: 'Reputation',
			experience: 'Experience',
			level: 'Level'
		},
		commandRemindmeCreate: ({ id }) => `A reminder with ID \`${id}\` has been created.`,
		commandRemindmeCreateNoDuration: 'You must tell me what you want me to remind you and when.',
		commandRemindmeCreateNoDescription: 'Something, you did not tell me what.',
		commandRemindmeDeleteNoId: 'You must give a valid ID, you can get them using the `list` sub-command.',
		commandRemindmeDelete: ({ task, id }) =>
			`The reminder with ID \`${id}\` and with a remaining time of **${this.duration(
				task.time.getTime() - Date.now()
			)}** has been successfully deleted.`,
		commandRemindmeListEmpty: 'You do not have any active reminder',
		commandRemindmeShowFooter: ({ id }) => `ID: ${id} | Ends at:`,
		commandRemindmeInvalidId: 'I am sorry, but the ID provided does not seem to be valid.',
		commandRemindmeNotfound: 'I cannot find something here. The reminder either never existed or it ended.',

		commandReputationTime: ({ remaining }) => `You can give a reputation point in ${this.duration(remaining)}`,
		commandReputationUsable: 'You can give a reputation point now.',
		commandReputationUserNotfound: 'You must mention a user to give a reputation point.',
		commandReputationSelf: 'You cannot give a reputation point to yourself.',
		commandReputationBots: 'You cannot give a reputation point to bots.',
		commandReputationGive: ({ user }) => `You have given a reputation point to **${user}**!`,
		commandReputationsBots: 'Bots cannot have reputation points...',
		commandReputationsSelf: ({ points }) => `You have a total of ${points} reputation points.`,
		commandReputation: ({ count }) => `${count} reputation point`,
		commandReputationPlural: ({ count }) => `${count} reputation points`,
		commandReputations: ({ user, points }) => `The user ${user} has a total of ${points}.`,
		commandRequireRole: 'I am sorry, but you must provide a role for this command.',
		commandScoreboardPosition: ({ position }) => `Your placing position is: ${position}`,
		commandSetColor: ({ color }) => `Color changed to ${color}`,

		/**
		 * ##################
		 * STARBOARD COMMANDS
		 */

		commandStarNostars: 'There is no starred message.',
		commandStarNoChannel: `I'm sorry, but a starboard channel hasn't been set up.`,
		commandStarStats: 'Starboard Stats',
		commandStarMessages: ({ count }) => `${count} message`,
		commandStarMessagesPlural: ({ count }) => `${count} messages`,
		commandStars: ({ count }) => `${count} star`,
		commandStarsPlural: ({ count }) => `${count} stars`,
		commandStarStatsDescription: ({ messages, stars }) => `${messages} starred with a total of ${stars}`,
		commandStarTopstarred: 'Top Starred Posts',
		commandStarTopstarredDescription: ({ medal, id, count }) => `${medal}: ${id} (${count} star)`,
		commandStarTopstarredDescriptionPlural: ({ medal, id, count }) => `${medal}: ${id} (${count} stars)`,
		commandStarTopreceivers: 'Top Star Receivers',
		commandStarTopreceiversDescription: ({ medal, id, count }) => `${medal}: <@${id}> (${count} star)`,
		commandStarTopreceiversDescriptionPlural: ({ medal, id, count }) => `${medal}: <@${id}> (${count} stars)`,

		/**
		 * ####################
		 * SUGGESTIONS COMMANDS
		 */
		commandSuggestDescription: 'Posts a suggestion for the server.',
		commandSuggestExtended: {
			extendedHelp: "Posts a suggestion to the server's suggestion channel, if configured.",
			explainedUsage: [['suggestion', 'Your suggestion']],
			examples: ["Let's make a music channel!"],
			reminder:
				'You need to have a suggestions channel setup for this command to work. If you are an administrator, you will be given the chance to do so upon invoking the command.'
		},
		commandSuggestNoSetup: ({ username }) => `I'm sorry ${username}, but a suggestions channel hasn't been set up.`,
		commandSuggestNoSetupAsk: ({ username }) =>
			`I'm sorry ${username}, but a suggestions channel hasn't been set up. Would you like to set up a channel now?`,
		commandSuggestNoSetupAbort: 'Alright then. Aborted creating a new suggestion.',
		commandSuggestNopermissions: ({ username, channel }) =>
			`I'm sorry ${username}, but the administrators didn't give me permission to send messages in ${channel}!`,
		commandSuggestChannelPrompt: 'Please mention the channel you want to set as the suggestions channel.',
		commandSuggestTitle: ({ id }) => `Suggestion #${id}`,
		commandSuggestSuccess: ({ channel }) => `Thank you for your suggestion! It has been successfully posted to ${channel}!`,
		commandResolveSuggestionDescription: "Set the suggestion's status.",
		commandResolveSuggestionExtended: {
			extendedHelp: "This command allows you to update a suggestion's status, marking it either as accepted, considered or denied.",
			examples: [
				'1 accept Thank you for your suggestion!',
				'1 a Thank you for your suggestion!',
				"1 consider Hmm... we may do this, but it's really low priority",
				"1 c Hmm... we may do this, but it's really low priority",
				'1 deny There is no way this is going to happen.',
				'1 d There is no way this is going to happen.'
			],
			reminder: [
				'Suggestions also can be configured to DM the author regarding the status of their suggestion, with the `suggestions.on-action.dm` setting.',
				'Furthermore, in case you wish to preserve anonymity, you can hide your name using the `suggestions.on-action` setting, which can be overridden with the `--hide-author` and `--show-author` flags.'
			],
			multiline: true
		},
		commandResolveSuggestionInvalidId: `${REDCROSS} That\'s not a valid suggestion ID!`,
		commandResolveSuggestionMessageNotFound: `${REDCROSS} I was not able to retrieve the suggestion as its message has been deleted.`,
		commandResolveSuggestionIdNotFound: `${REDCROSS} Couldn\'t find a suggestion with that ID`,
		commandResolveSuggestionDefaultComment: 'No comment was provided.',
		commandResolveSuggestionAuthorAdmin: 'An administrator',
		commandResolveSuggestionAuthorModerator: 'A moderator',
		commandResolveSuggestionActions: ({ author }) => ({
			accept: `${author} accepted this suggestion:`,
			consider: `${author} considered this suggestion:`,
			deny: `${author} denied this suggestion:`
		}),
		commandResolveSuggestionActionsDms: ({ author, guild }) => ({
			accept: `${author} accepted this suggestion in ${guild}:`,
			consider: `${author} considered this suggestion in ${guild}:`,
			deny: `${author} denied this suggestion in ${guild}:`
		}),
		commandResolveSuggestionDmFail: `${REDCROSS} I wasn\'t able to send the author a DM. Are their DMs closed?`,
		commandResolveSuggestionSuccess: ({ id, actionText }) => `${GREENTICK} Successfully ${actionText} suggestion \`${id}\`!`,
		commandResolveSuggestionSuccessAcceptedText: 'accepted',
		commandResolveSuggestionSuccessDeniedText: 'denied',
		commandResolveSuggestionSuccessConsideredText: 'considered',

		/**
		 * ###############
		 * SYSTEM COMMANDS
		 */

		commandEvalTimeout: ({ seconds }) => `TIMEOUT: Took longer than ${seconds} seconds.`,
		commandEvalError: ({ time, output, type }) => `**Error**:${output}\n**Type**:${type}\n${time}`,

		commandStatsTitles: {
			stats: 'Statistics',
			uptime: 'Uptime',
			serverUsage: 'Server Usage'
		},
		commandStatsFields: ({ stats, uptime, usage }) => ({
			stats: [
				`• **Users**: ${stats.users}`,
				`• **Guilds**: ${stats.guilds}`,
				`• **Channels**: ${stats.channels}`,
				`• **Discord.js**: ${stats.version}`,
				`• **Node.js**: ${stats.nodeJs}`,
				`• **Klasa**: ${klasaVersion}`
			],
			uptime: [
				`• **Host**: ${this.duration(uptime.host, 2)}`,
				`• **Total**: ${this.duration(uptime.total, 2)}`,
				`• **Client**: ${this.duration(uptime.client, 2)}`
			],
			serverUsage: [`• **CPU Load**: ${usage.cpuLoad.join('% | ')}%`, `• **Heap**: ${usage.ramUsed} (Total: ${usage.ramTotal})`]
		}),

		/**
		 * #############
		 * TAGS COMMANDS
		 */

		commandTagDescription: "Manage this guilds' tags.",
		commandTagExtended: {
			extendedHelp: [
				'Tags, also known as custom commands, can give you a chunk of text stored under a specific name.',
				'For example after adding a tag with `Skyra, tag add rule1 <your first rule>` you can use it with `Skyra, rule1` or `Skyra, tag rule1`',
				"When adding tags you can customize the final look by adding flags to the tag content (these won't show up in the tag itself!):",
				'❯ Add `--embed` to have Skyra send the tag embedded.',
				'The content will be in the description, so you can use all the markdown you wish. for example, adding [masked links](https://skyra.pw).',
				'❯ Add `--color=<a color>` or `--colour=<a colour>` to have Skyra colourize the embed. Does nothing unless also specifying `--embed`.',
				'Colours can be RGB, HSL, HEX or Decimal.'
			],
			explainedUsage: [
				[
					'action',
					`The action to perform: ${this.list(
						[
							'`add` to add new tags',
							'`remove` to delete a tag',
							'`edit` to edit a tag',
							'`source` to get the source of a tag',
							'`list` to list all known tags',
							'`show` to show a tag'
						],
						'or'
					)}.`
				],
				['tag', "The tag's name."],
				['contents', 'Required for the actions `add` and `edit`, specifies the content for the tag.']
			],
			examples: [
				'add rule1 Respect other users. Harassment, hatespeech, etc... will not be tolerated.',
				'add rule1 --embed --color=#1E88E5 Respect other users. Harassment, hatespeech, etc... will not be tolerated.',
				'edit rule1 Just be respectful with the others.',
				'rule1',
				'source rule1',
				'remove rule1',
				'list'
			],
			multiline: true
		},
		commandTagPermissionlevel: 'You must be a staff member, moderator, or admin, to be able to manage tags.',
		commandTagNameNotAllowed: 'A tag name may not have a grave accent nor invisible characters.',
		commandTagNameTooLong: 'A tag name must be 50 or less characters long.',
		commandTagExists: ({ tag }) => `The tag '${tag}' already exists.`,
		commandTagContentRequired: 'You must provide a content for this tag.',
		commandTagAdded: ({ name, content }) => `Successfully added a new tag: **${name}** with a content of:\n${content}`,
		commandTagRemoved: ({ name }) => `Successfully removed the tag **${name}**.`,
		commandTagNotexists: ({ tag }) => `The tag '${tag}' does not exist.`,
		commandTagEdited: ({ name, content }) => `Successfully edited the tag **${name}** with a content of:\n${content}`,
		commandTagListEmpty: 'The tag list for this server is empty.',
		commandTagReset: 'All tags have been successfully removed from this server.',

		/**
		 * ##############
		 * TOOLS COMMANDS
		 */

		commandAvatarNone: 'The user does not have an avatar set.',
		commandColor: ({ hex, rgb, hsl }) => [`HEX: **${hex}**`, `RGB: **${rgb}**`, `HSL: **${hsl}**`],
		commandEmojiCustom: ({ emoji, id }) => [
			`→ ${inlineCodeBlock('Emoji ::')} **${emoji}**`,
			`→ ${inlineCodeBlock('Type  ::')} **Custom**`,
			`→ ${inlineCodeBlock('ID    ::')} **${id}**`
		],
		commandEmojiTwemoji: ({ emoji, id }) => [
			`→ ${inlineCodeBlock('Emoji ::')} \`${emoji}\``,
			`→ ${inlineCodeBlock('Type  ::')} **Twemoji**`,
			`→ ${inlineCodeBlock('ID    ::')} **${id}**`
		],
		commandEmojiInvalid: `The argument you provided is not a valid emoji.`,
		commandEmojiTooLarge: ({ emoji }) => `'${emoji}' is so heavy the hamsters couldn't keep with its size. Maybe try one that is smaller?`,
		commandCountryDescription: 'Shows information about a country.',
		commandCountryExtended: {
			extendedHelp: 'This command uses https://restcountries.eu to get information on the provided country.',
			explainedUsage: [['country', 'The name of the country.']],
			examples: ['United Kingdom']
		},
		commandCountryTitles: {
			OVERVIEW: 'Overview',
			LANGUAGES: 'Languages',
			OTHER: 'Other'
		},
		commandCountryFields: {
			overview: {
				officialName: 'Official Name',
				capital: 'Capital',
				population: 'Population'
			},
			other: {
				demonym: 'Demonym',
				area: 'Area',
				currencies: 'Currencies'
			}
		},
		commandEshopDescription: 'Request information for any American Nintendo Digital Store',
		commandEshopExtended: {
			extendedHelp: 'This command queries Nintendo of America to show data for the game you request.',
			explainedUsage: [['query', "The name of the game you're looking for."]],
			examples: ['Breath of the Wild', 'Pokemon', 'Splatoon']
		},
		commandEshopNotInDatabase: 'None available',
		commandEshopTitles: {
			price: 'Price',
			availability: 'Availability',
			releaseDate: 'Release Date',
			numberOfPlayers: 'Number of Players',
			platform: 'Platform',
			categories: 'Categories',
			noCategories: 'This game has not been sorted into any categories',
			nsuid: 'NSUID',
			esrb: 'ESRB'
		},
		commandEshopPricePaid: ({ price }) => `$${price} USD`,
		commandEshopPriceFree: 'Free',
		commandHoroscopeDescription: 'Get your latest horoscope',
		commandHoroscopeExtended: {
			extendedHelp: "Gets the horoscope for a given sun sign from Kelli Fox's The Astrologer.",
			explainedUsage: [
				['sunsign', 'The sun sign you want to get the horoscope for'],
				[
					'today|tomorrow|yesterday',
					'(Optional, defaults to "today") If you want to get the horoscope of yesterday or tomorrow you can specify that.'
				]
			],
			examples: ['pisces', 'virgo tomorrow', 'gemini yesterday', 'aries today']
		},
		commandHoroscopeInvalidSunsign: ({ sign, maybe }) => `${sign} is an invalid sun sign, maybe try ${maybe}`,
		commandHoroscopeTitles: ({ sign, intensity, keywords, mood, rating }) => ({
			dailyHoroscope: `Daily horoscope for ${sign}`,
			metadataTitle: 'Metadata',
			metadata: [`**Intensity:** ${intensity}`, `**Keywords:** ${this.list(keywords, 'and')}`, `**Mood:** ${mood}`, `**Rating:** ${rating}`]
		}),
		commandIgdbDescription: 'Searches IGDB (Internet Game Database) for your favourite games',
		commandIgdbExtended: {
			extendedHelp: 'This command queries the IGDB API to show data on your favourite games.',
			explainedUsage: [['query', 'The name of the game']],
			examples: ['Breath of the Wild', 'Borderlands 3']
		},
		commandIgdbTitles: {
			userScore: 'User score',
			ageRating: 'Age rating(s)',
			releaseDate: 'Release date',
			genres: 'Genre(s)',
			developers: 'Developer(s)',
			platform: 'Platform(s)'
		},
		commandIgdbData: {
			noDevelopers: 'Developer(s) unknown',
			noPlatforms: 'Platform(s) unknown',
			noReleaseDate: 'Release date unknown',
			noRating: 'No user rating',
			noSummary: 'No game summary available',
			noGenres: 'No known genres',
			noAgeRatings: 'No age ratings available'
		},
		commandItunesDescription: 'Searches iTunes API for music tracks',
		commandItunesExtended: {
			extendedHelp: 'This command queries the Apple iTunes API to show data on a music you request.',
			explainedUsage: [['query', 'The name of the song']],
			examples: ['Apocalyptica feat. Brent Smith', "You're Gonna Go Far, Kid"]
		},
		commandItunesTitles: {
			artist: 'Artist',
			collection: 'Collection',
			collectionPrice: 'Collection price (USD)',
			trackPrice: 'Track price (USD)',
			trackReleaseDate: 'Track Release Date',
			numberOfTracksInCollection: '# Tracks in collection',
			primaryGenre: 'Primary genre',
			preview: 'Preview',
			previewLabel: 'Click here'
		},
		commandLmgtfyClick: 'Click me to search',
		commandMoviesDescription: 'Searches TheMovieDatabase for any movie',
		commandMoviesExtended: {
			extendedHelp: [
				'This command queries TheMovieDatabase API for data on your favourite movies',
				"Tip: You can use the 'y:' filter to narrow your results by year. Example: 'star wars y:1977'."
			],
			explainedUsage: [['query', 'The name of the movie']],
			examples: ["Ocean's Eleven y:2001", 'Star Wars Revenge of the Sith', 'Spirited Away'],
			multiline: true
		},
		commandMoviesTitles: {
			runtime: 'Runtime',
			userScore: 'User score',
			status: 'Status',
			releaseDate: 'Release date',
			imdbPage: 'IMDB Page',
			homePage: 'Home Page',
			collection: 'Collection',
			genres: 'Genres'
		},
		commandMoviesData: {
			variableRuntime: 'Variable',
			movieInProduction: 'Movie in production',
			linkClickHere: 'Click here',
			none: 'None',
			notPartOfCollection: 'Not part of a collection',
			noGenres: 'None on TheMovieDB'
		},
		commandShowsDescription: 'Searches The Movie Database for any show',
		commandShowsExtended: {
			extendedHelp: 'This command queries TheMovieDatabase for data on your favorite shows',
			explainedUsage: [['query', 'The name of the show']],
			examples: ['Final Space', 'Gravity Falls', 'Rick and Morty']
		},
		commandShowsTitles: {
			episodeRuntime: 'Episode runtime',
			userScore: 'User score',
			status: 'Status',
			firstAirDate: 'First air date',
			genres: 'Genres'
		},
		commandShowsData: {
			variableRuntime: 'Variable',
			unknownUserScore: 'No user score',
			noGenres: 'None on TheMovieDB'
		},
		commandPriceCurrency: ({ fromCurrency, fromAmount, worths }) =>
			`**${fromAmount}** ${fromCurrency.toUpperCase()} is worth ${this.list(worths, 'and')}.`,
		commandPriceCurrencyNotFound: 'There was an error, please make sure you specified an appropriate coin and currency.',
		commandQuoteMessage: 'It is very weird, but said message does not have a content nor a image.',
		commandRolesListEmpty: 'This server does not have a role listed as a public role.',
		commandRolesAbort: ({ prefix }) =>
			`I looked far and wide, but I seem to not have found what you were looking for. Please run \`${prefix}roles\` for the full list!`,
		commandRolesListTitle: 'List of public roles',
		commandRolesAdded: ({ roles }) => `The following roles have been added to your profile: \`${roles}\``,
		commandRolesRemoved: ({ roles }) => `The following roles have been removed from your profile: \`${roles}\``,
		commandRolesNotPublic: ({ roles }) => `The following roles are not public: \`${roles}\``,
		commandRolesNotManageable: ({ roles }) => `The following roles cannot be given by me due to their hierarchy role position: \`${roles}\``,
		commandRolesAuditlog: "Authorized: Public Role Management | 'Roles' Command.",
		commandDuckDuckGoNotfound: 'I am sorry, but DuckDuckGo API returned a blank response. Try again with different keywords.',
		commandDuckDuckGoLookalso: 'Related to this topic:',

		commandUrbanNotFound: 'I am sorry, the word you are looking for does not seem to be defined in UrbanDictionary. Try another word?',
		commandUrbanIndexNotfound: 'You may want to try a lower page number.',
		systemTextTruncated: ({ definition, url }) => `${definition}... [continue reading](${url})`,
		commandWhoisMemberTitles: {
			joined: 'Joined',
			createdAt: 'Created At'
		},
		commandWhoisMemberFields: ({ member }) => ({
			joinedWithTimestamp: `${timestamp.displayUTC(member.joinedTimestamp!)}\n${this.duration(Date.now() - member.joinedTimestamp!, 2)} ago`,
			joinedUnknown: 'Unknown',
			createdAt: `${timestamp.displayUTC(member.user.createdAt)}\n${this.duration(Date.now() - member.user.createdTimestamp, 2)} ago`,
			footer: `ID: ${member.id}`
		}),
		commandWhoisMemberRoles: () => 'Role [1]',
		commandWhoisMemberRolesPlural: ({ count }) => `Roles [${count}]`,
		commandWhoisMemberPermissions: 'Key Permissions',
		commandWhoisMemberPermissionsAll: 'All Permissions',
		commandWhoisUserTitles: {
			createdAt: 'Created At'
		},
		commandWhoisUserFields: ({ user }) => ({
			createdAt: `${timestamp.displayUTC(user.createdAt)}\n${this.duration(Date.now() - user.createdTimestamp, 2)} ago`,
			footer: `ID: ${user.id}`
		}),
		commandFollowage: ({ user, channel, time }) => `${user} has been following ${channel} for ${this.duration(time, 2)}.`,
		commandFollowageMissingEntries: 'Either the user or the channel do not exist. Make sure you wrote their names correctly.',
		commandFollowageNotFollowing: 'That user is not following the specified channel.',
		commandTwitchNoEntries: 'There are no entries. Are you sure you wrote the user name correctly?',
		commandTwitchTitles: {
			followers: 'Followers',
			views: 'Views',
			clickToVisit: "Click to go to streamer's channel",
			partner: 'Partner'
		},
		commandTwitchPartnershipWithoutAffiliate: 'This channel is not part of the Twitch affiliate program.',
		commandTwitchAffiliateStatus: {
			affiliated: 'This is an affiliated channel.',
			partnered: 'This is a partnered channel.'
		},
		commandTwitchCreatedAt: 'Created At:',
		commandTwitchSubscriptionRequiredStreamer: `${REDCROSS} You must specify which streamer you want to subscribe to.`,
		commandTwitchSubscriptionStreamerNotFound: `${REDCROSS} Sorry, I could not find the streamer. Are you sure you wrote their name correctly?`,
		commandTwitchSubscriptionRequiredChannel: `${REDCROSS} You must tell me where do you want the messages to be sent.`,
		commandTwitchSubscriptionRequiredStatus: `${REDCROSS} You must tell me which type of notification do you want, the options are "online" and "offline".`,
		commandTwitchSubscriptionStatusValues: ['online', 'offline'],
		commandTwitchSubscriptionInvalidStatus: `${REDCROSS} Woah there! I expected "online" or "offline", but I cannot understand what you gave me instead.`,
		commandTwitchSubscriptionRequiredContent: `${REDCROSS} Mhmm, I wonder what you want me to send when the user goes live or something. Can you give me a hint please?`,
		commandTwitchSubscriptionAddDuplicated: `${REDCROSS} You're already subscribed to that streamer in this channel for that status.`,
		commandTwitchSubscriptionAddSuccessOffline: ({ name, channel }) =>
			`${GREENTICK} Success! Whenever ${name} goes offline, I will post a new message in ${channel}.`,
		commandTwitchSubscriptionAddSuccessLive: ({ name, channel }) =>
			`${GREENTICK} Success! Whenever ${name} goes live, I will post a new message in ${channel}.`,
		commandTwitchSubscriptionRemoveStreamerNotSubscribed: `${REDCROSS} I'm sorry, you cannot unsubscribe from a channel you're not subscribed to. Please subscribe to be able to unsubscribe.`,
		commandTwitchSubscriptionRemoveEntryNotExists: `${REDCROSS} I'm sorry; while you're subscribed to this user, their subscriptions are not posted in that channel.`,
		commandTwitchSubscriptionRemoveSuccessOffline: ({ name, channel }) =>
			`${GREENTICK} Success! I will not longer post messages to ${channel} whenever ${name} goes offline.`,
		commandTwitchSubscriptionRemoveSuccessLive: ({ name, channel }) =>
			`${GREENTICK} Success! I will not longer post messages to ${channel} whenever ${name} goes live.`,
		commandTwitchSubscriptionResetEmpty: `${REDCROSS} You were not subscribed to any streamer, mission abort!`,
		commandTwitchSubscriptionResetSuccess: ({ count }) => `${GREENTICK} Success! ${count} subscription has been removed from this server.`,
		commandTwitchSubscriptionResetSuccessPlural: ({ count }) =>
			`${GREENTICK} Success! ${count} subscriptions have been removed from this server.`,
		commandTwitchSubscriptionResetStreamerNotSubscribed: `${REDCROSS} You were not subscribed to this streamer. Are you sure you specified the right one?`,
		commandTwitchSubscriptionResetChannelSuccess: ({ name, count }) =>
			`${GREENTICK} Success! Removed ${count} subscription from the streamer ${name}.`,
		commandTwitchSubscriptionResetChannelSuccessPlural: ({ name, count }) =>
			`${GREENTICK} Success! Removed ${count} subscriptions from the streamer ${name}.`,
		commandTwitchSubscriptionShowStreamerNotSubscribed: `${REDCROSS} You wanted to see all subscriptions from this streamer, but there are none!`,
		commandTwitchSubscriptionShowStatus: ['Online', 'Offline'],
		commandTwitchSubscriptionShowEmpty: `${REDCROSS} There are no subscriptions, who will be the first?`,
		commandTwitchSubscriptionShowUnknownUser: 'Unknown',
		commandWikipediaNotfound: 'I am sorry, I could not find something that could match your input in Wikipedia.',
		commandYoutubeNotfound: 'I am sorry, I could not find something that could match your input in YouTube.',
		commandYoutubeIndexNotfound: 'You may want to try a lower page number, because I am unable to find something at this index.',
		commandDefineDescription: 'Check the definition of a word.',
		commandDefineExtended: {
			extendedHelp: `What does "heel" mean?`,
			explainedUsage: [['Word', 'The word or phrase you want to get the definition from.']],
			examples: ['heel']
		},
		commandDefineNotfound: 'I could not find a definition for this word.',
		commandDefinePronounciation: 'Pronunciation',
		commandDefineUnknown: 'Unknown',

		/**
		 * #############
		 * WEEB COMMANDS
		 */

		commandWbang: ({ user }) => `Hey ${user}... bang!`,
		commandWbanghead: 'Head bang in progress!',
		commandWbite: ({ user }) => `Biting ${user}!`,
		commandWblush: 'You made them blush! 😊',
		commandWcry: ({ user }) => `Dear ${user}, did you make them cry? 💔`,
		commandWcuddle: ({ user }) => `Here is a cuddle for you, ${user} 💞`,
		commandWdance: 'Dancing! 💃',
		commandWgreet: ({ user }) => `Hello there ${user}!`,
		commandWhug: ({ user }) => `Here is a nice hug for you, ${user} ❤`,
		commandWkiss: ({ user }) => `Here is a kiss for you, ${user} 💜`,
		commandWlewd: 'Too lewd for my tastes!',
		commandWlick: ({ user }) => `Licking ${user} 👅`,
		commandWnom: 'Nom, nom, nom! 😊',
		commandWneko: 'Nya! 🐱',
		commandWpat: ({ user }) => `Gently pats ${user}'s head ❤`,
		commandWpout: 'Uh?',
		commandWpunch: ({ user }) => `Punching ${user}!`,
		commandWslap: ({ user }) => `Slapping ${user}!`,
		commandWsleepy: 'Falling asleep...',
		commandWsmile: 'Showing a radiant smile!',
		commandWsmug: "There's a smug face!",
		commandWstare: ({ user }) => `Dear ${user}, somebody is staring at you 👀`,
		commandWthumbsup: 'You have their thumbs up!',
		commandWtickle: ({ user }) => `Tickles for you, ${user}!`,

		/**
		 * #################################
		 * #            MONITORS           #
		 * #################################
		 */

		constMonitorInvitelink: 'Invite link',
		constMonitorLink: 'Filtered Link',
		constMonitorNms: '[NOMENTIONSPAM]',
		constMonitorWordfilter: 'Filtered Word',
		constMonitorCapsfilter: 'Too Many UpperCases',
		constMonitorAttachmentfilter: 'Too Many Attachments',
		constMonitorMessagefilter: 'Too Many Message Duplicates',
		constMonitorNewlinefilter: 'Too Many Lines',
		constMonitorReactionfilter: 'Filtered Reaction',
		moderationMonitorAttachments: '[Auto-Moderation] Triggered attachment filter, no threshold.',
		moderationMonitorAttachmentsWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered attachment filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorCapitals: '[Auto-Moderation] Triggered capital filter, no threshold.',
		moderationMonitorCapitalsWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered capital filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorInvites: '[Auto-Moderation] Triggered invite filter, no threshold.',
		moderationMonitorInvitesWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered invite filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorLinks: '[Auto-Moderation] Triggered link filter, no threshold.',
		moderationMonitorLinksWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered link filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorMessages: '[Auto-Moderation] Triggered duplicated message filter, no threshold.',
		moderationMonitorMessagesWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered duplicated message filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorNewlines: '[Auto-Moderation] Triggered newline filter, no threshold.',
		moderationMonitorNewlinesWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered newline filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorWords: '[Auto-Moderation] Triggered word filter, no threshold.',
		moderationMonitorWordsWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered word filter, reached ${amount} out of ${maximum} infractions.`,
		monitorAttachmentFilter: ({ user }) => `${REDCROSS} Dear ${user}, file attachments aren't allowed here.`,
		monitorInviteFilterAlert: ({ user }) => `${REDCROSS} Dear ${user}, invite links aren't allowed here.`,
		monitorInviteFilterLog: ({ links }) => `**Link**: ${this.list(links, 'and')}`,
		monitorInviteFilterLogPlural: ({ links }) => `**Links**: ${this.list(links, 'and')}`,
		monitorNolink: ({ user }) => `${REDCROSS} Hey ${user}, you are not allowed to post links here!`,
		monitorWordFilterDm: ({ filtered }) =>
			`Shush! You said some words that are not allowed in the server! But since you took a moment to write the message, I will post it here:\n${filtered}`,
		monitorCapsFilterDm: ({ message }) => `Speak lower! I know you need to express your thoughts. There is the message I deleted:${message}`,
		monitorWordFilter: ({ user }) => `${REDCROSS} Pardon, dear ${user}, you said something that is not allowed in this server.`,
		monitorCapsFilter: ({ user }) => `${REDCROSS} EEEOOO ${user}! PLEASE DO NOT SHOUT IN THIS PLACE! YOU HAVE HIT THE CAPS LIMIT!`,
		monitorMessageFilter: ({ user }) => `${REDCROSS} Woah woah woah, please stop re-posting so much ${user}!`,
		monitorNewlineFilter: ({ user }) => `${REDCROSS} Wall of text incoming from ${user}, wall of text taken down!`,
		monitorReactionsFilter: ({ user }) => `${REDCROSS} Hey ${user}, please do not add that reaction!`,
		monitorNmsMessage: ({ user }) => [
			`The banhammer has landed and now the user ${user.tag} with id ${user.id} is banned for mention spam.`,
			"Do not worry! I'm here to help you! 😄"
		],
		monitorNmsModlog: ({ threshold }) => `[NOMENTIONSPAM] Automatic: Mention Spam threshold exceeded.\nThreshold: ${threshold}.`,
		monitorNmsAlert: "Be careful mentioning any more, as you are about to be banned for exceeding this server's mention threshold.",
		monitorSocialAchievement: 'Congratulations dear %MEMBER%, you achieved the role %ROLE%',

		/**
		 * #################################
		 * #           INHIBITORS          #
		 * #################################
		 */

		inhibitorSpam: ({ channel }) =>
			`Can we move to ${channel} please? This command might be too spammy and can ruin other people's conversations.`,

		/**
		 * #################################
		 * #              GAMES            #
		 * #################################
		 */

		hgBloodbath: [
			'{1} grabs a shovel.',
			'{1} grabs a backpack and retreats.',
			'{1} and {2} fight for a bag. {1} gives up and retreats.',
			'{1} and {2} fight for a bag. {2} gives up and retreats.',
			'{1} finds a bow, some arrows, and a quiver.',
			'{1} runs into the cornucopia and hides.',
			'{1} takes a handful of throwing knives.',
			"{1} rips a mace out of {2}'s hands.",
			'{1} finds a canteen full of water.',
			'{1} stays at the cornucopia for resources.',
			'{1} gathers as much food as they can.',
			'{1} grabs a sword.',
			'{1} takes a spear from inside the cornucopia.',
			'{1} finds a bag full of explosives.',
			'{1} clutches a first aid kit and runs away.',
			'{1} takes a sickle from inside the cornucopia.',
			'{1}, {2}, and {3} work together to get as many supplies as possible.',
			'{1} runs away with a lighter and some rope.',
			'{1} snatches a bottle of alcohol and a rag.',
			'{1} finds a backpack full of camping equipment.',
			'{1} grabs a backpack, not realizing it is empty.',
			"{1} breaks {2}'s nose for a basket of bread.",
			'{1}, {2}, {3}, and {4} share everything they gathered before running.',
			'{1} retrieves a trident from inside the cornucopia.',
			'{1} grabs a jar of fishing bait while {2} gets fishing gear.',
			'{1} scares {2} away from the cornucopia.',
			'{1} grabs a shield leaning on the cornucopia.',
			'{1} snatches a pair of sais.',
			'{1} grabs a lone pair of pants.',
			'{1T} steps off their podium too soon and blows up.',
			"{1} throws a knife into {2T}'s head.",
			'{1T} accidently steps on a landmine.',
			'{1} catches {2T} off guard and kills them.',
			'{1} and {2} work together to drown {3T}.',
			'{1} strangles {2T} after engaging in a fist fight.',
			"{1} shoots an arrow into {2T}'s head.",
			'{1T} cannot handle the circumstances and commits suicide.',
			"{1} bashes {2T}'s head against a rock several times.",
			"{1} snaps {2T}'s neck.",
			'{1} decapitates {2T} with a sword.',
			'{1} spears {2T} in the abdomen.',
			'{1} sets {2T} on fire with a molotov.',
			'{1T} falls into a pit and dies.',
			'{1} stabs {2T} while their back is turned.',
			'{1} severely injures {2T}, but puts them out of their misery.',
			'{1} severely injures {2T} and leaves them to die.',
			"{1} bashes {2T}'s head in with a mace.",
			'{1} pushes {2T} off a cliff during a knife fight.',
			"{1} throws a knife into {2T}'s chest.",
			'{1T} is unable to convince {2} to not kill them.',
			'{1} convinces {2T} to not kill them, only to kill {2T} instead.',
			'{1T} falls into a frozen lake and drowns.',
			'{1}, {2}, and {3T} start fighting, but {2} runs away as {1} kills {3T}.',
			'{1} kills {2T} with their own weapon.',
			'{1} overpowers {2T}, killing them.',
			'{1} sets an explosive off, killing {2T}.',
			'{1} sets an explosive off, killing {2T}, and {3T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, and {4T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, {4T} and {5T}.',
			'{1} kills {2T} as they try to run.',
			'{1T} and {2T} threaten a double suicide. It fails and they die.',
			'{1T}, {2T}, {3T}, and {4T} form a suicide pact, killing themselves.',
			'{1} kills {2T} with a hatchet.',
			'{1} and {2} fight {3T} and {4T}. {1} and {2} survive.',
			'{1T} and {2T} fight {3} and {4}. {3} and {4} survive.',
			'{1T} attacks {2}, but {3} protects them, killing {1T}.',
			'{1} severely slices {2T} with a sword.',
			'{1} strangles {2T} with a rope.',
			'{1} kills {2T} for their supplies.',
			'{1} shoots an arrow at {2}, but misses and kills {3T} instead.',
			"{1} shoots a poisonous blow dart into {2T}'s neck, slowly killing them.",
			'{1} stabs {2T} with a tree branch.',
			'{1} stabs {2T} in the back with a trident.',
			'{1}, {2T}, and {3T} get into a fight. {1} triumphantly kills them both.',
			'{1T}, {2}, and {3T} get into a fight. {2} triumphantly kills them both.',
			'{1T}, {2T}, and {3} get into a fight. {3} triumphantly kills them both.',
			'{1} finds {2T} hiding in the cornucopia and kills them.',
			'{1T} finds {2} hiding in the cornucopia, but {2} kills them.',
			'{1} kills {2T} with a sickle.',
			'{1} and {2T} fight for a bag. {1} strangles {2T} with the straps and runs.',
			'{1T} and {2} fight for a bag. {2} strangles {1T} with the straps and runs.',
			'{1} repeatedly stabs {2T} to death with sais.',
			'{1T} trips over while running from the cornucopia, and is killed by {2}.',
			'{1} trips over while running from the cornucopia, {2} picks them up, they run off together.',
			"{1} aims an arrow at {2}'s head and shoots, {3T} jumps in the way and sacrifies their life to save them."
		],
		hgDay: [
			'{1} goes hunting.',
			'{1} injures themself.',
			'{1} explores the arena.',
			'{1} scares {2} off.',
			"{1} diverts {2}'s attention and runs away.",
			'{1} stalks {2}.',
			'{1} fishes.',
			'{1} camouflauges themself in the bushes.',
			"{1} steals from {2} while they aren't looking.",
			'{1} makes a wooden spear.',
			'{1} discovers a cave.',
			'{1} attacks {2}, but they manage to escape.',
			'{1} chases {2}.',
			'{1} runs away from {2}.',
			'{1} collects fruit from a tree.',
			'{1} receives a hatchet from an unknown sponsor.',
			'{1} receives clean water from an unknown sponsor.',
			'{1} receives medical supplies from an unknown sponsor.',
			'{1} receives fresh food from an unknown sponsor.',
			'{1} searches for a water source.',
			'{1} defeats {2} in a fight, but spares their life.',
			'{1} and {2} work together for the day.',
			'{1} begs for {2} to kill them. They refuse, keeping {1} alive.',
			'{1} tries to sleep through the entire day.',
			"{1}, {2}, {3}, and {4} raid {5}'s camp while they are hunting.",
			'{1} constructs a shack.',
			'{1} overhears {2} and {3} talking in the distance.',
			'{1} practices their archery.',
			'{1} thinks about home.',
			'{1} is pricked by thorns while picking berries.',
			'{1} tries to spear fish with a trident.',
			'{1} searches for firewood.',
			'{1} and {2} split up to search for resources.',
			'{1} picks flowers.',
			"{1} tends to {2}'s wounds.",
			'{1} sees smoke rising in the distance, but decides not to investigate.',
			'{1} sprains their ankle while running away from {2}.',
			'{1} makes a slingshot.',
			'{1} travels to higher ground.',
			'{1} discovers a river.',
			'{1} hunts for other tributes.',
			'{1} and {2} hunt for other tributes.',
			'{1}, {2}, and {3} hunt for other tributes.',
			'{1}, {2}, {3}, and {4} hunt for other tributes.',
			'{1}, {2}, {3}, {4}, and {5} hunt for other tributes.',
			'{1} receives an explosive from an unknown sponsor.',
			'{1} questions their sanity.',
			'{1} forces {2} to eat pant.',
			'{1} forces {2T} to eat pant. {2T} chokes and dies.',
			'{1} catches {2T} off guard and kills them.',
			"{1} throws a knife into {2T}'s head.",
			'{1T} begs for {2} to kill them. They reluctantly oblige, killing {1T}.',
			'{1} and {2} work together to drown {3T}.',
			'{1} strangles {2T} after engaging in a fist fight.',
			"{1} shoots an arrow into {2T}'s head.",
			'{1T} bleeds out due to untreated injuries.',
			'{1T} cannot handle the circumstances and commits suicide.',
			"{1} bashes {2T}'s head against a rock several times.",
			'{1T} unknowingly eats toxic berries.',
			"{1} silently snaps {2T}'s neck.",
			"{1} taints {2T}'s food, killing them.",
			'{1} decapitates {2T} with a sword.',
			'{1T} dies from an infection.',
			'{1} spears {2T} in the abdomen.',
			'{1} sets {2T} on fire with a molotov.',
			'{1T} falls into a pit and dies.',
			'{1} stabs {2T} while their back is turned.',
			'{1} severely injures {2T}, but puts them out of their misery.',
			'{1} severely injures {2T} and leaves them to die.',
			"{1} bashes {2T}'s head in with a mace.",
			'{1T} attempts to climb a tree, but falls to their death.',
			'{1} pushes {2T} off a cliff during a knife fight.',
			"{1} throws a knife into {2T}'s chest.",
			"{1}'s trap kills {2T}.",
			'{1} kills {2T} while they are resting.',
			'{1T} is unable to convince {2} to not kill them.',
			'{1} convinces {2T} to not kill them, only to kill {2T} instead.',
			'{1T} falls into a frozen lake and drowns.',
			'{1}, {2}, and {3T} start fighting, but {2} runs away as {1} kills {3T}.',
			'{1} kills {2T} with their own weapon.',
			'{1} overpowers {2T}, killing them.',
			'{1} sets an explosive off, killing {2T}.',
			'{1} sets an explosive off, killing {2T}, and {3T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, and {4T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, {4T} and {5T}.',
			'{1} kills {2T} as they try to run.',
			'{1T} and {2T} threaten a double suicide. It fails and they die.',
			'{1T}, {2T}, {3T}, and {4T} form a suicide pact, killing themselves.',
			'{1T} dies from hypothermia.',
			'{1T} dies from hunger.',
			'{1T} dies from thirst.',
			'{1} kills {2T} with a hatchet.',
			'{1} and {2} fight {3T} and {4T}. {1} and {2} survive.',
			'{1T} and {2T} fight {3} and {4}. {3} and {4} survive.',
			'{1T} dies trying to escape the arena.',
			'{1T} dies of dysentery.',
			'{1T} accidently detonates a land mine while trying to arm it.',
			'{1T} attacks {2}, but {3} protects them, killing {1T}.',
			'{1} ambushes {2T} and kills them.',
			'{1T} accidently steps on a landmine.',
			'{1} severely slices {2T} with a sword.',
			'{1} strangles {2T} with a rope.',
			'{1} kills {2T} for their supplies.',
			'{1} shoots an arrow at {2}, but misses and kills {3T} instead.',
			"{1} shoots a poisonous blow dart into {2T}'s neck, slowly killing them.",
			'{1}, {2}, and {3} successfully ambush and kill {4T}, {5T}, and {6T}.',
			'{1T}, {2T}, and {3T} unsuccessfully ambush {4}, {5}, and {6}, who kill them instead.',
			'{1} stabs {2T} with a tree branch.',
			'{1} forces {2} to kill {3T} or {4}. They decide to kill {3T}.',
			'{1} forces {2} to kill {3} or {4T}. They decide to kill {4T}.',
			'{1} forces {2T} to kill {3} or {4}. They refuse to kill, so {1} kills them instead.',
			"{1T} poisons {2}'s drink, but mistakes it for their own and dies.",
			"{1} poisons {2T}'s drink. They drink it and die.",
			'{1} stabs {2T} in the back with a trident.',
			'{1T} attempts to climb a tree, but falls on {2T}, killing them both.',
			'{1}, {2T}, and {3T} get into a fight. {1} triumphantly kills them both.',
			'{1T}, {2}, and {3T} get into a fight. {2} triumphantly kills them both.',
			'{1T}, {2T}, and {3} get into a fight. {3} triumphantly kills them both.',
			'{1} kills {2T} with a sickle.',
			'{1}, {2}, {3}, {4}, and {5} track down and kill {6T}.',
			'{1}, {2}, {3}, and {4} track down and kill {5T}.',
			'{1}, {2}, and {3} track down and kill {4T}.',
			'{1} and {2} track down and kill {3T}.',
			'{1} tracks down and kills {2T}.',
			'{1} repeatedly stabs {2T} to death with sais.',
			'{1} doodles in the dirt.',
			'{1} chases a butterfly.',
			'{1T} falls off a cliff, and is impaled by a stick.',
			'{1} runs into {2}, they decide to team up.',
			'{1} sees {2} through the trees, and plans on killing them.',
			'{1} sneaks up behind {2T}, and snaps their neck.',
			'{1T} challenges {2} to a fight, and promptly dies.',
			'{1} murders their partner, {2T}, to have more supplies for themself.'
		],
		hgNight: [
			'{1} starts a fire.',
			'{1} sets up camp for the night.',
			'{1} loses sight of where they are.',
			'{1} climbs a tree to rest.',
			'{1} goes to sleep.',
			'{1} and {2} tell stories about themselves to each other.',
			'{1}, {2}, {3}, and {4} sleep in shifts.',
			'{1}, {2}, and {3} sleep in shifts.',
			'{1} and {2} sleep in shifts.',
			'{1} tends to their wounds.',
			'{1} sees a fire, but stays hidden.',
			'{1} screams for help.',
			'{1} stays awake all night.',
			'{1} passes out from exhaustion.',
			'{1} cooks their food before putting their fire out.',
			'{1} and {2} run into each other and decide to truce for the night.',
			'{1} fends {2}, {3}, and {4} away from their fire.',
			'{1}, {2}, and {3} discuss the games and what might happen in the morning.',
			'{1} cries themself to sleep.',
			'{1} tries to treat their infection.',
			'{1} and {2} talk about the tributes still alive.',
			'{1} is awoken by nightmares.',
			'{1} and {2} huddle for warmth.',
			'{1} thinks about winning.',
			'{1}, {2}, {3}, and {4} tell each other ghost stories to lighten the mood.',
			'{1} looks at the night sky.',
			'{1} defeats {2} in a fight, but spares their life.',
			'{1} begs for {2} to kill them. They refuse, keeping {1} alive.',
			"{1} destroys {2}'s supplies while they are asleep.",
			'{1}, {2}, {3}, {4}, and {5} sleep in shifts.',
			'{1} lets {2} into their shelter.',
			'{1} receives a hatchet from an unknown sponsor.',
			'{1} receives clean water from an unknown sponsor.',
			'{1} receives medical supplies from an unknown sponsor.',
			'{1} receives fresh food from an unknown sponsor.',
			'{1} tries to sing themself to sleep.',
			'{1} attempts to start a fire, but is unsuccessful.',
			'{1} thinks about home.',
			"{1} tends to {2}'s wounds.",
			'{1} quietly hums.',
			'{1}, {2}, and {3} cheerfully sing songs together.',
			'{1} is unable to start a fire and sleeps without warmth.',
			'{1} and {2} hold hands.',
			'{1} convinces {2} to snuggle with them.',
			'{1} receives an explosive from an unknown sponsor.',
			'{1} questions their sanity.',
			'{1} forces {2} to eat pant.',
			'{1} forces {2T} to eat pant. {2T} chokes and dies.',
			'{1} catches {2T} off guard and kills them.',
			"{1} throws a knife into {2T}'s head.",
			'{1T} begs for {2} to kill them. They reluctantly oblige, killing {1T}.',
			'{1} and {2} work together to drown {3T}.',
			'{1} strangles {2T} after engaging in a fist fight.',
			"{1} shoots an arrow into {2T}'s head.",
			'{1T} bleeds out due to untreated injuries.',
			'{1T} cannot handle the circumstances and commits suicide.',
			"{1} bashes {2T}'s head against a rock several times.",
			'{1T} unknowingly eats toxic berries.',
			"{1} silently snaps {2T}'s neck.",
			"{1} taints {2T}'s food, killing them.",
			'{1} decapitates {2T} with a sword.',
			'{1T} dies from an infection.',
			'{1} spears {2T} in the abdomen.',
			'{1} sets {2T} on fire with a molotov.',
			'{1T} falls into a pit and dies.',
			'{1} stabs {2T} while their back is turned.',
			'{1} severely injures {2T}, but puts them out of their misery.',
			'{1} severely injures {2T} and leaves them to die.',
			"{1} bashes {2T}'s head in with a mace.",
			'{1T} attempts to climb a tree, but falls to their death.',
			'{1} pushes {2T} off a cliff during a knife fight.',
			"{1} throws a knife into {2T}'s chest.",
			"{1}'s trap kills {2T}.",
			'{1} kills {2T} while they are sleeping.',
			'{1T} is unable to convince {2} to not kill them.',
			'{1} convinces {2T} to not kill them, only to kill {2T} instead.',
			'{1T} falls into a frozen lake and drowns.',
			'{1}, {2}, and {3T} start fighting, but {2} runs away as {1} kills {3T}.',
			'{1} kills {2T} with their own weapon.',
			'{1} overpowers {2T}, killing them.',
			'{1} sets an explosive off, killing {2T}.',
			'{1} sets an explosive off, killing {2T}, and {3T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, and {4T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, {4T} and {5T}.',
			'{1} kills {2T} as they try to run.',
			'{1T} and {2T} threaten a double suicide. It fails and they die.',
			'{1T}, {2T}, {3T}, and {4T} form a suicide pact, killing themselves.',
			'{1T} dies from hypothermia.',
			'{1T} dies from hunger.',
			'{1T} dies from thirst.',
			'{1} kills {2T} with a hatchet.',
			'{1} and {2} fight {3T} and {4T}. {1} and {2} survive.',
			'{1T} and {2T} fight {3} and {4}. {3} and {4} survive.',
			'{1T} dies trying to escape the arena.',
			'{1T} dies of dysentery.',
			'{1T} accidently detonates a land mine while trying to arm it.',
			'{1T} attacks {2}, but {3} protects them, killing {1T}.',
			'{1} ambushes {2T} and kills them.',
			'{1T} accidently steps on a landmine.',
			'{1} severely slices {2T} with a sword.',
			'{1} strangles {2T} with a rope.',
			'{1} kills {2T} for their supplies.',
			'{1} shoots an arrow at {2}, but misses and kills {3T} instead.',
			"{1} shoots a poisonous blow dart into {2T}'s neck, slowly killing them.",
			'{1}, {2}, and {3} successfully ambush and kill {4T}, {5T}, and {6T}.',
			'{1T}, {2T}, and {3T} unsuccessfully ambush {4}, {5}, and {6}, who kill them instead.',
			'{1} stabs {2T} with a tree branch.',
			'{1} forces {2} to kill {3T} or {4}. They decide to kill {3T}.',
			'{1} forces {2} to kill {3} or {4T}. They decide to kill {4T}.',
			'{1} forces {2T} to kill {3} or {4}. They refuse to kill, so {1} kills them instead.',
			"{1T} poisons {2}'s drink, but mistakes it for their own and dies.",
			"{1} poisons {2T}'s drink. They drink it and die.",
			'{1} stabs {2T} in the back with a trident.',
			'{1T} attempts to climb a tree, but falls on {2T}, killing them both.',
			'{1}, {2T}, and {3T} get into a fight. {1} triumphantly kills them both.',
			'{1T}, {2}, and {3T} get into a fight. {2} triumphantly kills them both.',
			'{1T}, {2T}, and {3} get into a fight. {3} triumphantly kills them both.',
			'{1} kills {2T} with a sickle.',
			'{1}, {2}, {3}, {4}, and {5} track down and kill {6T}.',
			'{1}, {2}, {3}, and {4} track down and kill {5T}.',
			'{1}, {2}, and {3} track down and kill {4T}.',
			'{1} and {2} track down and kill {3T}.',
			'{1} tracks down and kills {2T}.',
			'{1} repeatedly stabs {2T} to death with sais.',
			'{1} writes in their journal.',
			'{1} watches {2} sitting at their campfire, and considers killing them.'
		],

		/**
		 * #################################
		 * #          SERIALIZERS          #
		 * #################################
		 */

		serializerAutoRoleInvalid: 'Invalid autorole data.',
		serializerCommandAutoDeleteInvalid: 'Invalid command auto-delete data.',
		serializerPermissionNodeDuplicatedCommand: ({ command }) => `You have set \`${command}\` twice, either allow it, or deny it.`,
		serializerPermissionNodeInvalidCommand: ({ command }) => `The command \`${command}\` does not exist or is invalid.`,
		serializerPermissionNodeInvalidTarget: 'No data could be found from the ID.',
		serializerPermissionNodeInvalid: 'Invalid data.',
		serializerPermissionNodeSecurityEveryoneAllows: 'For security, the everyone role cannot have allows.',
		serializerPermissionNodeSecurityGuarded: ({ command }) =>
			`For security and for me to work properly, you cannot deny the usage for the command \`${command}\`.`,
		serializerPermissionNodeSecurityOwner: 'You cannot set permission overrides on the server owner.',
		serializerReactionRoleInvalid: 'Invalid reaction role data.',
		serializerStickyRoleInvalid: 'Invalid sticky role data.',
		serializerTriggerAliasInvalid: 'Invalid trigger alias data.',
		serializerTriggerIncludeInvalid: 'Invalid trigger includes data.',
		serializerTriggerIncludeInvalidAction: 'Invalid trigger action.',
		serializerTwitchSubscriptionInvalidStreamer: 'Invalid data streamer.',
		serializerTwitchSubscriptionInvalid: 'Invalid data.',
		serializerUniqueRoleSetInvalid: 'Invalid unique role set data.',
		serializerUnsupported: 'This configuration key cannot be updated via Discord at the moment, please use the dashboard at <https://skyra.pw>!',
		serializerCustomCommandInvalidId: 'The property "id" must be a string.',
		serializerCustomCommandInvalidEmbed: 'The property "embed" must be a boolean.',
		serializerCustomCommandInvalidColor: 'The property "color" must be a number.',
		serializerCustomCommandInvalidContent: 'The property "content" must be a string.',
		serializerCustomCommandInvalidArgs: 'The property "args" must be an array of strings.',
		serializerDisabledCommandChannelsChannelsDoesNotExist: 'The channel does not exist.',
		serializerDisabledCommandChannelsChannelsCommandDoesNotExist: ({ name }) => `The command \`${name}\` does not exist.`,

		/**
		 * #################################
		 * #        NOTIFICATIONS          #
		 * #################################
		 */
		notificationsTwitchNoGameName: '*Game name not set*',
		notificationsTwitchEmbedDescription: ({ userName }) => `${userName} is now live!`,
		notificationsTwitchEmbedDescriptionWithGame: ({ userName, gameName }) => `${userName} is now live - Streaming ${gameName}!`,
		notificationTwitchEmbedFooter: 'Skyra Twitch Notifications',

		/**
		 * #################################
		 * #             UTILS             #
		 * #################################
		 */

		selfModerationCommandInvalidMissingAction: ({ name }) =>
			`${REDCROSS} Action must be any of the following: \`enable\`, \`disable\`, \`action\`, \`punish\`, \`punish-duration\`, \`threshold-maximum\`, \`threshold-duration\`, or \`show\`. Check \`Skyra, help ${name}\` for more information.`,
		selfModerationCommandInvalidMissingArguments: ({ name }) =>
			`${REDCROSS} The specified action requires an extra argument to be passed. Check \`Skyra, help ${name}\` for more information.`,
		selfModerationCommandInvalidSoftaction: ({ name }) =>
			`${REDCROSS} Value must be any of the following: \`alert\`, \`log\`, or \`delete\`. Check \`Skyra, help ${name}\` for more information.`,
		selfModerationCommandInvalidHardaction: ({ name }) =>
			`${REDCROSS} Value must be any of the following: \`none\`, \`warn\`, \`mute\`, \`kick\`, \`softban\`, or \`ban\`. Check \`Skyra, help ${name}\` for more information.`,
		selfModerationCommandEnabled: `${GREENTICK} Successfully enabled sub-system.`,
		selfModerationCommandDisabled: `${GREENTICK} Successfully disabled sub-system.`,
		selfModerationCommandSoftAction: `${GREENTICK} Successfully disabled actions.`,
		selfModerationCommandSoftActionWithValue: ({ value }) => `${GREENTICK} Successfully set actions to: \`${value}\``,
		selfModerationCommandHardAction: ({ value }) => `${GREENTICK} Successfully set punishment: ${value}`,
		selfModerationCommandHardActionDuration: `${GREENTICK} Successfully removed the punishment appeal timer.`,
		selfModerationCommandHardActionDurationWithValue: ({ value }) =>
			`${GREENTICK} Successfully set the punishment appeal timer to: ${this.duration(value)}`,
		selfModerationCommandThresholdMaximum: `${GREENTICK} Successfully removed the threshold maximum, punishment will take place instantly if set.`,
		selfModerationCommandThresholdMaximumWithValue: ({ value }) => `${GREENTICK} Successfully set the threshold maximum to: ${value}`,
		selfModerationCommandThresholdDuration: `${GREENTICK} Successfully removed the threshold duration, punishments will take place instantly if set.`,
		selfModerationCommandThresholdDurationWithValue: ({ value }) =>
			`${GREENTICK} Successfully set the threshold duration to: ${this.duration(value)}`,
		selfModerationCommandShow: ({
			kEnabled,
			kAlert,
			kLog,
			kDelete,
			kHardAction,
			hardActionDurationText,
			thresholdMaximumText,
			thresholdDurationText
		}) => [
			`Enabled      : ${kEnabled}`,
			'Action',
			` - Alert     : ${kAlert}`,
			` - Log       : ${kLog}`,
			` - Delete    : ${kDelete}`,
			'Punishment',
			` - Type      : ${kHardAction}`,
			` - Duration  : ${hardActionDurationText}`,
			'Threshold',
			` - Maximum   : ${thresholdMaximumText}`,
			` - Duration  : ${thresholdDurationText}`
		],
		selfModerationCommandShowDurationPermanent: 'Permanent',
		selfModerationCommandShowUnset: 'Unset',
		selfModerationSoftActionAlert: 'Alert',
		selfModerationSoftActionLog: 'Log',
		selfModerationSoftActionDelete: 'Delete',
		selfModerationHardActionBan: 'Ban',
		selfModerationHardActionKick: 'Kick',
		selfModerationHardActionMute: 'Mute',
		selfModerationHardActionSoftban: 'SoftBan',
		selfModerationHardActionWarning: 'Warning',
		selfModerationHardActionNone: 'None',
		selfModerationEnabled: 'Yes',
		selfModerationDisabled: 'No',
		selfModerationMaximumTooShort: ({ minimum, value }) => `${REDCROSS} The value (${value}) was too short, expected at least ${minimum}.`,
		selfModerationMaximumTooLong: ({ maximum, value }) => `${REDCROSS} The value (${value}) was too long, expected maximum ${maximum}.`,
		selfModerationDurationTooShort: ({ minimum, value }) =>
			`${REDCROSS} The value (${this.duration(value)}) was too short, expected at least ${this.duration(minimum)}.`,
		selfModerationDurationTooLong: ({ maximum, value }) =>
			`${REDCROSS} The value (${this.duration(value)}) was too long, expected maximum ${this.duration(maximum)}.`,
		moderationActions: {
			addRole: 'Added Role',
			mute: 'Mute',
			ban: 'Ban',
			kick: 'Kick',
			softban: 'Softban',
			vkick: 'Voice Kick',
			vmute: 'Voice Mute',
			restrictedReact: 'Reaction Restriction',
			restrictedEmbed: 'Embed Restriction',
			restrictedAttachment: 'Attachment Restriction',
			restrictedVoice: 'Voice Restriction',
			setNickname: 'Set Nickname',
			removeRole: 'Remove Role'
		},
		actionApplyReason: ({ action, reason }) => `[Action] Applied ${action} | Reason: ${reason}`,
		actionApplyNoReason: ({ action }) => `[Action] Applied ${action}`,
		actionRevokeReason: ({ action, reason }) => `[Action] Revoked ${action} | Reason: ${reason}`,
		actionRevokeNoReason: ({ action }) => `[Action] Revoked ${action}`,
		actionSetNicknameSet: ({ reason }) => `[Action] Set Nickname | Reason: ${reason}`,
		actionSetNicknameRemoved: ({ reason }) => `[Action] Removed Nickname | Reason: ${reason}`,
		actionSetNicknameNoReasonSet: `[Action] Set Nickname.`,
		actionSetNicknameNoReasonRemoved: `[Action] Removed Nickname.`,
		actionSoftbanNoReason: '[Action] Applying Softban.',
		actionSoftbanReason: ({ reason }) => `[Action] Applying Softban | Reason: ${reason}`,
		actionUnSoftbanNoReason: '[Action] Applied Softban.',
		actionUnSoftbanReason: ({ reason }) => `[Action] Applied Softban | Reason: ${reason}`,
		actionRequiredMember: 'The user does not exist or is not in this server.',
		actionSetupMuteExists: '**Aborting mute role creation**: There is already one that exists.',
		actionSetupRestrictionExists: '**Aborting restriction role creation**: There is already one that exists.',
		actionSetupTooManyRoles: '**Aborting role creation**: There are 250 roles in this guild, you need to delete one role.',
		actionSharedRoleSetupExisting: 'I could not find a configured role. Do you want to configure an existing one?',
		actionSharedRoleSetupExistingName: 'Please give me the name of the role you want to use for further actions of this type.',
		actionSharedRoleSetupNew: 'Do you want me to create a new role and configure it automatically?',
		actionSharedRoleSetupAsk: ({ role, channels, permissions }) =>
			`${LOADING} Can I modify ${channels} channel to apply the role ${role} the following permission: ${permissions}?`,
		actionSharedRoleSetupAskMultipleChannels: ({ role, channels, permissions }) =>
			`${LOADING} Can I modify ${channels} channels to apply the role ${role} the following permission: ${permissions}?`,
		actionSharedRoleSetupAskMultiplePermissions: ({ role, channels, permissions }) =>
			`${LOADING} Can I modify ${channels} channel to apply the role ${role} the following permissions: ${permissions}?`,
		actionSharedRoleSetupAskMultipleChannelsMultiplePermissions: ({ role, channels, permissions }) =>
			`${LOADING} Can I modify ${channels} channels to apply the role ${role} the following permissions: ${permissions}?`,
		muteNotConfigured: 'The muted role must be configured for this action to happen.',
		restrictionNotConfigured: 'The restriction role must be configured for this action to happen',
		muteNotInMember: 'The muted role is not set in the member.',
		muteLowHierarchy: 'I cannot mute a user which higher role hierarchy than me.',
		muteCannotManageRoles: `I must have **${this.PERMISSIONS.MANAGE_ROLES}** permissions to be able to mute.`,
		muteNotExists: 'The specified user is not muted.',

		resolverDateSuffix: ' seconds',
		resolverPositiveAmount: 'You must give me a positive number.',
		systemPoweredByWeebsh: 'Powered by weeb.sh',
		prefixReminder: ({ prefix }) => `The prefix in this guild is set to: \`${prefix}\``,

		unexpectedIssue: 'An unexpected error popped up! Safely aborting this command...',

		commandDmNotSent: 'I cannot send you a message in DMs, did you block me?',
		commandDmSent: 'I have sent you the message in DMs.',
		commandRoleHigherSkyra: 'The selected member has a role position that is higher than or equal to mine.',
		commandRoleHigher: 'The selected member has a role position that is higher than or equal to yours.',
		commandSuccess: 'Successfully executed the command.',
		commandToskyra: 'Why... I thought you loved me! 💔',
		commandUserself: 'Why would you do that to yourself?',

		systemParseError: `${REDCROSS} I failed to process the data I was given, sorry~!`,
		systemHighestRole: "This role's hierarchy position is higher or equal than me, I am not able to grant it to anyone.",
		systemChannelNotPostable: 'I am not allowed to send messages to this channel.',
		systemFetchbansFail: `Failed to fetch bans. Do I have the **${this.PERMISSIONS.BAN_MEMBERS}** permission?`,
		systemLoading: [
			`${LOADING} Watching hamsters run...`,
			`${LOADING} Finding people at hide-and-seek...`,
			`${LOADING} Trying to figure out this command...`,
			`${LOADING} Fetching data from the cloud...`,
			`${LOADING} Calibrating lenses...`,
			`${LOADING} Playing rock, paper, scissors...`,
			`${LOADING} Tuning in to the right frequencies...`,
			`${LOADING} Reticulating splines...`
		],
		systemError: `Something bad happened! Please try again, or if the issue keeps happening join the support server (hint: use \`Skyra, support\`)`,
		systemDatabaseError: `I wasn't able get that in my database! Please try again, or if the issue keeps happening join the support server (hint: use \`Skyra, support\`)`,
		systemDiscordAborterror: 'I had a small network error when messaging Discord, please run this command again!',
		systemMessageNotFound: 'I am sorry, but either you wrote the message ID incorrectly, or it got deleted.',
		systemNotenoughParameters: 'I am sorry, but you did not provide enough parameters...',
		systemQueryFail: 'I am sorry, but the application could not resolve your request. Are you sure you wrote the name correctly?',
		systemNoResults: "I wasn't able to find any results for that query",
		systemCannotAccessChannel: 'I am sorry, but you do not have permission to see that channel.',
		systemExceededLengthOutput: ({ output }) => `**Output**:${output}`,
		systemExceededLengthOutputWithTypeAndTime: ({ output, time, type }) => `**Output**:${output}\n**Type**:${type}\n${time}`,
		systemExceededLengthOutputConsole: () => `Sent the result to console.`,
		systemExceededLengthOutputConsoleWithTypeAndTime: ({ time, type }) => `Sent the result to console.\n**Type**:${type}\n${time}`,
		systemExceededLengthOutputFile: () => `Sent the result as a file.`,
		systemExceededLengthOutputFileWithTypeAndTime: ({ time, type }) => `Sent the result as a file.\n**Type**:${type}\n${time}`,
		systemExceededLengthOutputHastebin: ({ url }) => `Sent the result to hastebin: ${url}`,
		systemExceededLengthOutputHastebinWithTypeAndTime: ({ url, time, type }) => `Sent the result to hastebin: ${url}\n**Type**:${type}\n${time}`,
		systemExceededLengthChooseOutput: ({ output }) => `Choose one of the following options: ${this.list(output, 'or')}`,
		systemExternalServerError: 'The external service we use could not process our message. Please try again later.',
		systemPokedexExternalResource: 'External Resources',
		jumpTo: 'Jump to Message ►',

		resolverInvalidChannelName: ({ name }) => `${name} must be a valid channel name, id, or tag.`,
		resolverInvalidRoleName: ({ name }) => `${name} must be a valid role name, id, or mention.`,
		resolverInvalidUsername: ({ name }) => `${name} must be a valid user name, id, or mention.`,
		resolverChannelNotInGuild: 'I am sorry, but that command can only be ran in a server.',
		resolverChannelNotInGuildSubcommand: ({ command, subcommand }) =>
			`${REDCROSS} I am sorry, but the subcommand \`${subcommand}\` for the command \`${command}\` can only be used in a server.`,
		resolverMembernameUserLeftDuringPrompt: 'User left during prompt.',

		listifyPage: ({ page, pageCount, results }) => `Page ${page} / ${pageCount} | ${results} Total`,

		moderationLogAppealed: `${REDCROSS} I am sorry, but the selected moderation log has expired or cannot be cannot be made temporary.`,
		moderationLogExpiresIn: ({ duration }) => `\n❯ **Expires In**: ${this.duration(duration)}`,
		moderationLogDescription: ({ data: { caseID, formattedDuration, prefix, reason, type, userDiscriminator, userID, userName } }) =>
			[
				`❯ **Type**: ${type}`,
				`❯ **User:** ${userName}#${userDiscriminator} (${userID})`,
				`❯ **Reason:** ${reason || `Please use \`${prefix}reason ${caseID} <reason>\` to set the reason.`}${formattedDuration}`
			].join('\n'),
		moderationLogFooter: ({ caseID }) => `Case ${caseID}`,
		moderationCaseNotExists: () => `${REDCROSS} I am sorry, but the selected moderation log case does not exist.`,
		ModerationCaseNotExistsPlural: () => `${REDCROSS} I am sorry, but none of the selected moderation log cases exist.`,

		guildSettingsChannelsMod: 'You need to configure a modlog channel. Use `Skyra, conf set channels.moderation-logs #modlogs`.',
		guildSettingsRolesRestricted: ({ prefix, path }) =>
			`${REDCROSS} You need to configure a role for this action, use \`${prefix}settings set ${path} <rolename>\` to set it up.`,
		guildMuteNotFound:
			'I failed to fetch the modlog that sets this user as muted. Either you did not mute this user or all the mutes are appealed.',
		guildBansEmpty: 'There are no bans registered in this server.',
		guildBansNotFound: 'I tried and failed to find this user from the ban list. Are you certain this user is banned?',
		channelNotReadable: `I am sorry, but I need the permissions **${this.PERMISSIONS.VIEW_CHANNEL}** and **${this.PERMISSIONS.READ_MESSAGE_HISTORY}**`,

		userNotInGuild: 'This user is not in this server.',
		userNotExistent: 'This user does not exist. Are you sure you used a valid user ID?',

		eventsGuildMemberAdd: 'User Joined',
		eventsGuildMemberAddMute: 'Muted User joined',
		eventsGuildMemberAddDescription: ({ mention, time }) => `${mention} | **Joined Discord**: ${this.duration(time, 2)} ago.`,
		eventsGuildMemberRemove: 'User Left',
		eventsGuildMemberKicked: 'User Kicked',
		eventsGuildMemberBanned: 'User Banned',
		eventsGuildMemberSoftBanned: 'User Softbanned',
		eventsGuildMemberRemoveDescription: ({ mention }) => `${mention} | **Joined Server**: Unknown.`,
		eventsGuildMemberRemoveDescriptionWithJoinedAt: ({ mention, time }) => `${mention} | **Joined Server**: ${this.duration(time, 2)} ago.`,
		eventsGuildMemberUpdateNickname: ({ previous, current }) => `Updated the nickname from **${previous}** to **${current}**`,
		eventsGuildMemberAddedNickname: ({ current }) => `Added a new nickname **${current}**`,
		eventsGuildMemberRemovedNickname: ({ previous }) => `Removed the nickname **${previous}**`,
		eventsNicknameUpdate: 'Nickname Edited',
		eventsUsernameUpdate: 'Username Edited',
		eventsNameUpdatePreviousWasSet: ({ previousName }) => `**Previous**: \`${previousName}\``,
		eventsNameUpdatePreviousWasNotSet: () => `**Previous**: Unset`,
		eventsNameUpdateNextWasSet: ({ nextName }) => `**Next**: \`${nextName}\``,
		eventsNameUpdateNextWasNotSet: () => `**Next**: Unset`,
		eventsGuildMemberNoUpdate: 'No update detected',
		eventsGuildMemberAddedRoles: ({ addedRoles }) => `**Added role**: ${addedRoles}`,
		eventsGuildMemberAddedRolesPlural: ({ addedRoles }) => `**Added roles**: ${addedRoles}`,
		eventsGuildMemberRemovedRoles: ({ removedRoles }) => `**Removed role**: ${removedRoles}`,
		eventsGuildMemberRemovedRolesPlural: ({ removedRoles }) => `**Removed roles**: ${removedRoles}`,
		eventsRoleUpdate: 'Roles Edited',
		eventsMessageUpdate: 'Message Edited',
		eventsMessageDelete: 'Message Deleted',
		eventsReaction: 'Reaction Added',
		eventsCommand: ({ command }) => `Command Used: ${command}`,

		settingsDeleteChannelsDefault: 'Reseated the value for `channels.default`',
		settingsDeleteRolesInitial: 'Reseated the value for `roles.initial`',
		settingsDeleteRolesMute: 'Reseated the value for `roles.muted`',

		modlogTimed: ({ remaining }) => `This moderation log is already timed. Expires in ${this.duration(remaining)}`,

		guildWarnNotFound: 'I failed to fetch the modlog for appealing. Either it does not exist, is not type of warning, or it is appealed.',
		guildMemberNotVoicechannel: 'I cannot execute this action in a member that is not connected to a voice channel.',

		promptlistMultipleChoice: ({ list, count }) =>
			`There are ${count} result. Please choose a number between 1 and ${count}, or write **"CANCEL"** to cancel the prompt.\n${list}`,
		promptlistMultipleChoicePlural: ({ list, count }) =>
			`There are ${count} results. Please choose a number between 1 and ${count}, or write **"CANCEL"** to cancel the prompt.\n${list}`,
		promptlistAttemptFailed: ({ list, attempt, maxAttempts }) => `Invalid input. Attempt **${attempt}** out of **${maxAttempts}**\n${list}`,
		promptlistAborted: 'Successfully aborted the prompt.',

		fuzzySearchMatches: ({ matches, codeblock }) =>
			`I found multiple matches! **Please select a number within 0 and ${matches}**:\n${codeblock}\nWrite **ABORT** if you want to exit the prompt.`,
		fuzzySearchAborted: 'Successfully aborted the prompt.',
		fuzzySearchInvalidNumber: 'I expected you to give me a (single digit) number, got a potato.',
		fuzzySearchInvalidIndex: 'That number was out of range, aborting prompt.',

		eventsErrorWtf: `${REDCROSS} What a Terrible Failure! I am very sorry!`,
		eventsErrorString: ({ mention, message }) => `${REDCROSS} Dear ${mention}, ${message}`,

		constUsers: 'Users',
		unknownChannel: 'Unknown channel',
		unknownRole: 'Unknown role',
		unknownUser: 'Unknown user'
	};

	public async init() {
		// noop
	}
}
