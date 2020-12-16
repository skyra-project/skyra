/* eslint-disable @typescript-eslint/no-invalid-this, @typescript-eslint/member-ordering */
export default class extends Language {
	public PERMISSIONS = {
		ADMINISTRATOR: "Administrator",
		VIEW_AUDIT_LOG: "View Audit Log",
		MANAGE_GUILD: "Manage Server",
		MANAGE_ROLES: "Manage Roles",
		MANAGE_CHANNELS: "Manage Channels",
		KICK_MEMBERS: "Kick Members",
		BAN_MEMBERS: "Ban Members",
		CREATE_INSTANT_INVITE: "Create Instant Invite",
		CHANGE_NICKNAME: "Change Nickname",
		MANAGE_NICKNAMES: "Manage Nicknames",
		MANAGE_EMOJIS: "Manage Emojis",
		MANAGE_WEBHOOKS: "Manage Webhooks",
		VIEW_CHANNEL: "Read Messages",
		SEND_MESSAGES: "Send Messages",
		SEND_TTS_MESSAGES: "Send TTS Messages",
		MANAGE_MESSAGES: "Manage Messages",
		EMBED_LINKS: "Embed Links",
		ATTACH_FILES: "Attach Files",
		READ_MESSAGE_HISTORY: "Read Message History",
		MENTION_EVERYONE: "Mention Everyone",
		USE_EXTERNAL_EMOJIS: "Use External Emojis",
		ADD_REACTIONS: "Add Reactions",
		CONNECT: "Connect",
		SPEAK: "Speak",
		STREAM: "Stream",
		MUTE_MEMBERS: "Mute Members",
		DEAFEN_MEMBERS: "Deafen Members",
		MOVE_MEMBERS: "Move Members",
		USE_VAD: "Use Voice Activity",
		PRIORITY_SPEAKER: "Priority Speaker",
		VIEW_GUILD_INSIGHTS: "View Guild Insights"
	};

	public HUMAN_LEVELS = {
		NONE: "None",
		LOW: "Low",
		MEDIUM: "Medium",
		HIGH: "High",
		VERY_HIGH: "Highest"
	};

	public duration(time: number, precision?: number) {
		return duration.format(time, precision);
	}

	/** Parses cardinal numbers to the ordinal counterparts */
	public ordinal(cardinal: number) {
		const cent = cardinal % 100;
		const dec = cardinal % 10;

		if (cent >= 10 && cent <= 20) {
			return `{{cardinal}}th`;
		}

		switch (dec) {
			case 1:
				return `{{cardinal}}st`;
			case 2:
				return `{{cardinal}}nd`;
			case 3:
				return `{{cardinal}}rd`;
			default:
				return `{{cardinal}}th`;
		}
	}

	public list(values: readonly string[], conjunction: "or' | 'and') {
		switch (values.length) {
			case 0:
				return '';
			case 1:
				return values[0];
			case 2:
				return `${values[0]} {{conjunction}} ${values[1]}`;
			default: {
				const trail = values.slice(0, -1);
				const head = values[values.length - 1];
				return `${trail.join(", ")}, {{conjunction}} {{head}}`;
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

		default: "{{key}} has not been localized for en-US yet.",
		defaultLanguage: "Default Language",
		globalYes: "Yes",
		globalNo: "No",
		globalNone: "None",
		globalIs: "is",
		globalAnd: "and",
		globalOr: "or",
		globalUnknown: "Unknown",
		settingGatewayKeyNoext: "The key "{{key}}" does not exist in the data schema.",
		settingGatewayChooseKey: "You cannot edit a settings group, pick any of the following: "{{keys}}"",
		settingGatewayUnconfigurableFolder: "This settings group does not have any configurable sub-key.",
		settingGatewayUnconfigurableKey: "The settings key "{{key}}" has been marked as non-configurable by the bot owner.",
		settingGatewayMissingValue: "The value "{{value}}" cannot be removed from the key "{{path}}" because it does not exist.",
		settingGatewayDuplicateValue: "The value "{{value}}" cannot be added to the key "{{path}}" because it was already set.",
		settingGatewayInvalidFilteredValue: "The settings key "{{path}}" does not accept the value "{{value}}".",
		reactionhandlerPrompt: "Which page would you like to jump to?",
		// used for help command
		systemHelpTitles: {
			explainedUsage: "⚙ | ***Explained usage***",
			possibleFormats: "🔢 | ***Possible formats***",
			examples: "🔗 | ***Examples***",
			reminders: "⏰ | ***Reminder***'
		},
		commandmessageMissing: "Missing one or more required arguments after end of input.",
		commandmessageMissingRequired: "{{name}} is a required argument.",
		commandmessageMissingOptionals: "Missing a required option: ({{possibles}})",
		commandmessageNomatch: "Your option didn't match any of the possibilities: ({{possibles}})",
		monitorCommandHandlerReprompt:
			`{{tag}} | **{{name}}** | You have **{{time}}** seconds to respond to this prompt with a valid argument. Type **{{cancelOptions}}** to abort this prompt.",
		monitorCommandHandlerRepeatingReprompt:
			`{{tag}} | **{{name}}** is a repeating argument | You have **{{time}}** seconds to respond to this prompt with additional valid arguments. Type **{{cancelOptions}}** to cancel this prompt.",
		monitorCommandHandlerAborted: "Aborted",
		inhibitorCooldown: "You have just used this command. You can use this command again in {{remaining}}.",
		inhibitorMissingBotPerms: "I don't have sufficient permissions! I'm missing: {{missing}}",
		inhibitorNsfw: "You may not use NSFW commands in this channel!",
		inhibitorPermissions: "You do not have permission to use this command!",
		inhibitorRequiredSettings: "The guild is missing the **{{settings}}** guild setting and thus the command cannot run.",
		inhibitorRequiredSettings_plural: "The guild is missing the **{{settings}}** guild settings and thus the command cannot run.",
		inhibitorRunin: "This command is only available in {{type}} channels.",
		inhibitorRuninNone: "The {{name}} command is not configured to run in any channel.",
		inhibitorDisabledGuild: "This command has been disabled by an admin in this guild!",
		inhibitorDisabledGlobal:
			'This command has been globally disabled by the bot owners. Want to know why and find out when it will be back? Join the official Skyra server: <https://join.skyra.pw>",
		commandBlocklistDescription: "Block or allow users and guilds from using my functionalities.",
		commandBlocklistSaveSuccess: "{{GREENTICK}} Successfully updated blocked users and/or guilds",
		commandBlocklistResetSuccess: "{{GREENTICK}} Successfully reset blocked users and guilds",
		commandUnload: "{{GREENTICK}} Unloaded {{type}}: {{name}}",
		commandUnloadDescription: "Unloads the klasa piece.",
		commandTransferError: "{{REDCROSS}} That file has been transferred already or never existed.",
		commandTransferSuccess: "{{GREENTICK}} Successfully transferred {{type}}: {{name}}",
		commandTransferFailed: "Transfer of {{type}}: {{name}} to Client has failed. Please check your Console.",
		commandTransferDescription: "Transfers a core piece to its respective folder",
		commandReload: "{{GREENTICK}} Reloaded {{type}}: {{name}}. (Took: {{time}})",
		commandReloadFailed: "{{REDCROSS}} Failed to reload {{type}}: {{name}}. Please check your Console.",
		commandReloadAll: "{{GREENTICK}} Reloaded all {{type}}. (Took: {{time}})",
		commandReloadEverything: "{{GREENTICK}} Reloaded everything. (Took: {{time}})",
		commandReloadDescription: "Reloads a klasa piece, or all pieces of a klasa store.",
		commandReboot: "{{LOADING}} Rebooting...",
		commandRebootDescription: "Reboots the bot.",
		commandPing: "{{LOADING}} Ping?",
		commandPingDescription: "Runs a connection test to Discord.",
		commandPingPong: "Pong! (Roundtrip took: {{diff}}ms. Heartbeat: {{ping}}ms.)",
		commandInfoDescription: "Provides some information about this bot.",
		commandHelpDescription: "Display help for a command.",
		commandHelpNoExtended: "No extended help available.",
		commandHelpDm: "📥 | The list of commands you have access to has been sent to your DMs.",
		commandHelpNodm: "{{REDCROSS}} | You have DMs disabled so I couldn't send you the list of commands.",
		commandHelpAllFlag:
			`Displaying one category per page. Have issues with the embed? Run `{{prefix}}help --all` for a full list in DMs.",
		commandHelpCommandCount: "{{count}} command",
		commandHelpCommandCount_plural: "{{count}} commands",
		commandEnable: "+ Successfully enabled {{type}}: {{name}}",
		commandEnableDescription: "Re-enables or temporarily enables a command/inhibitor/monitor/finalizer. Default state restored on reboot.",
		commandDisable: "+ Successfully disabled {{type}}: {{name}}",
		commandDisableDescription:
			'Re-disables or temporarily disables a command/inhibitor/monitor/finalizer/event. Default state restored on reboot.",
		commandDisableWarn: "You probably don't want to disable that, since you wouldn't be able to run any command to enable it again",
		commandConfNoKey: "You must provide a key",
		commandConfNoValue: "You must provide a value",
		commandConfGuarded: "${toTitleCase(name)} may not be disabled.",
		commandConfUpdated: "Successfully updated the key **{{key}}**: `{{response}}`",
		commandConfKeyNotArray: "This key is not array type. Use the action 'reset' instead.",
		commandConfGetNoExt: "The key **{{key}}** does not seem to exist.",
		commandConfGet: "The value for the key **{{key}}** is: `{{value}}`",
		commandConfReset: "The key **{{key}}** has been reset to: `{{value}}`",
		commandConfNochange: "The value for **{{key}}** was already that value.",
		commandConfServerDescription: "Define per-server settings.",
		commandConfServer: "**Server Setting {{key}}**\n{{list}}",
		commandConfUserDescription: "Define per-user settings.",
		commandConfDashboardOnlyKey: "`{{key}}` can only be configured through the web dashboard (<https://skyra.pw>)",
		commandConfUser: "**User Setting {{key}}**\n{{list}}",
		commandConfSettingNotSet: "Not Set",
		messagePromptTimeout: "The prompt has timed out.",
		textPromptAbortOptions: ["abort", "stop", "cancel"],
		commandLoad: "{{GREENTICK}} Successfully loaded {{type}}: {{name}}. (Took: {{time}})",
		commandLoadFail: "The file does not exist, or an error occurred while loading your file. Please check your console.",
		commandLoadError: "{{REDCROSS}} Failed to load {{type}}: {{name}}. Reason:${codeBlock('js", error)}",
		commandLoadDescription: "Load a piece from your bot.",

		/**
		 * ################################
		 * #     COMMAND DESCRIPTIONS     #
		 * ################################
		 */

		argumentRangeInvalid: "{{name}} must be a number or a range of numbers.",
		argumentRangeMax: "{{name}} accepts a range of maximum {{maximum}} 'number'",
		argumentRangeMax_plural: "{{name}} accepts a range of maximum {{maximum}} 'numbers'",

		commandRolesetDescription: "Manage unique role sets.",
		commandRolesetExtended: {
			extendedHelp: [
				'A role set is a group of roles Skyra identifies as unique for all members in the server, i.e. a roleset named "region" could have the roles `Africa", "America", "Asia", and `Europe", and members will only be able to have one of them. This is like a kind of "rule" that is applied in the three following situations:",
				'",
				'- When somebody claims a role via the `Skyra, roles`.",
				'- When somebody claims a role via reaction roles.",
				'- When somebody receives a role either manually or from another bot.'
			],
			explainedUsage: [
				["add", "Create a new roleset or add a role to an existing one."],
				["remove", "Remove a role from an existing roleset."],
				["reset", "Removes all roles from a roleset or, if not specified, all existing rolesets."],
				["list", "Lists all rolesets."],
				["auto", "Adds or removes a roleset."]
			],
			examples: [
				'add regions America",
				'add regions Africa America Asia Europe",
				'remove regions America",
				'reset",
				'reset regions",
				'list",
				'regions America",
				'regions Africa America Asia Europe'
			],
			reminder: "This command can add and/or remove multiple roles at the same time.",
			multiline: true
		},
		commandRolesetCreated: "The {{name}} unique role set has been created with the following roles: {{roles}}",
		commandRolesetAdded: "The {{name}} unique role set now has the following roles as well: {{roles}}.",
		commandRolesetInvalidName: "You can not remove the {{name}} unique role set because it does not exist.",
		commandRolesetRemoved: "The {{name}} unique role set will no longer include the following roles: {{roles}}",
		commandRolesetResetEmpty: "{{REDCROSS}} There are no rolesets configured in this groupo.",
		commandRolesetResetAll: "{{GREENTICK}} Successfully removed all rolesets.",
		commandRolesetResetNotExists: "{{REDCROSS}} The roleset `{{name}}` does not exist in this server.",
		commandRolesetResetGroup: "{{GREENTICK}} Successfully removed the roleset `{{name}}` from this server.",
		commandRolesetUpdated: "The {{name}} unique role set has been updated.",
		commandRolesetNoRolesets: "You have no rolesets.",

		inhibitorMusicQueueEmpty: "{{REDCROSS}} The queue's empty! The session will start as soon as we have some songs queued.",
		inhibitorMusicNotPlaying: "{{REDCROSS}} Hmm, doesn't look like I'm playing anything right now.",
		inhibitorMusicPaused: "{{REDCROSS}} The queue's playing and the session is still up 'till the night ends!",
		inhibitorMusicDjMember: "{{REDCROSS}} I believe this is something only a moderator or a deejay of this session is supposed to do!",
		inhibitorMusicUserVoiceChannel: "{{REDCROSS}} Hey, I need you to join a voice channel before I can run this command!",
		inhibitorMusicBotVoiceChannel: "{{REDCROSS}} I am afraid I need to be in a voice channel to operate this command, please show me the way!",
		inhibitorMusicBothVoiceChannel: "{{REDCROSS}} Hey! It looks like you're not in the same voice channel as me! Please come join me!",
		inhibitorMusicNothingPlaying: "{{REDCROSS}} Looks like nothing is playing right now, how about you start the party 🎉?",

		musicManagerFetchNoArguments: "I need you to give me the name of a song!",
		musicManagerFetchNoMatches: "I'm sorry but I wasn't able to find the track!",
		musicManagerFetchLoadFailed: "I'm sorry but I couldn't load this song! Maybe try other song!",
		musicManagerImportQueueError: "{{REDCROSS}} Sorry, but I'm having issues trying to import that playlist. Are you sure it's from my own DJ deck?",
		musicManagerImportQueueNotFound: "{{REDCROSS}} I need a queue to import!",
		musicManagerTooManySongs: "{{REDCROSS}} Woah there, you are adding more songs than allowed!",
		musicManagerSetvolumeSilent: "Woah, you can just leave the voice channel if you want silence!",
		musicManagerSetvolumeLoud: "I'll be honest, an airplane's nacelle would be less noisy than this!",
		musicManagerPlayNoSongs: "There are no songs left in the queue!",
		musicManagerPlayPlaying: "The deck's spinning, can't you hear it?",
		musicManagerStuck: "{{LOADING}} Hold on, I got a little problem, I'll be back in: {{milliseconds | duration}}!",

		commandConfMenuNopermissions: "I need the {{this.PERMISSIONS.ADD_REACTIONS}} and {{this.PERMISSIONS.MANAGE_MESSAGES}} permissions to be able to run the menu.",
		commandConfMenuRenderAtFolder: "Currently at: 📁 {{path}}",
		commandConfMenuRenderAtPiece: "Currently at: ⚙️ {{path}}",
		commandConfMenuRenderNokeys: "There are no configurable keys for this folder",
		commandConfMenuRenderSelect: "Please type in any of the following entries' names",
		commandConfMenuRenderTctitle: "Text Commands:",
		commandConfMenuRenderUpdate: "• Update Value → `set <value>`",
		commandConfMenuRenderRemove: "• Remove Value → `remove <value>`",
		commandConfMenuRenderReset: "• Reset Value → `reset`",
		commandConfMenuRenderUndo: "• Undo Update → `undo`",
		commandConfMenuRenderCvalue: "Current Value: **``{{value}}``**",
		commandConfMenuRenderBack: "Press ◀ to go back",
		commandConfMenuInvalidKey: "Invalid Key, please try again with any of the following options.",
		commandConfMenuInvalidAction: "Invalid Action, please try again with any of the following options.",
		commandConfMenuSaved: "Successfully saved all changes.",

		/**
		 * ################
		 * GENERAL COMMANDS
		 */

		commandSupportDescription: "Show support instructions",
		commandSupportExtended: {
			extendedHelp: "This command gives you a link to *Skyra's Lounge*, the best place for everything related to me."
		},

		/**
		 * #############
		 * MISC COMMANDS
		 */

		commandCuddleDescription: "Cuddle somebody!",
		commandCuddleExtended: {
			extendedHelp:
				"Do you know something that I envy from humans? The warm feeling when somebody cuddles you. It's so cute ❤! I can imagine and draw a image of you cuddling somebody in the bed, I hope you like it!",
			explainedUsage: [["user", "The user to cuddle with."]],
			examples: ["Skyra"]
		},
		commandDeletthisDescription: "*Sees offensive post* DELETTHIS!",
		commandDeletthisExtended: {
			extendedHelp:
				"I see it! I see the hammer directly from your hand going directly to the user you want! Unless... unless it's me! If you try to tell me this, I'm going to take the MJOLNIR! Same if you do with my creator!",
			explainedUsage: [["user", "The user that should start deleting his post."]],
			examples: ["John Doe"]
		},
		commandFDescription: "Press F to pay respects.",
		commandFExtended: {
			extendedHelp:
				'This command generates an image... to pay respects reacting with 🇫. This command also makes Skyra react the image if she has permissions to react messages.",
			explainedUsage: [["user", "The user to pray respects to."]],
			examples: ["John Doe", "Jake"]
		},
		commandGoodnightDescription: "Give somebody a nice Good Night!",
		commandGoodnightExtended: {
			extendedHelp: "Let me draw you giving a goodnight kiss to the person who is going to sleep! Who doesn't like goodnight kisses?",
			explainedUsage: [["user", "The user to give the goodnight kiss."]],
			examples: ["Jake", "DefinitivelyNotSleeping"]
		},
		commandGoofytimeDescription: "It's Goofy time!",
		commandGoofytimeExtended: {
			extendedHelp:
				"IT'S GOOFY TIME! *Screams loudly in the background* NO, DAD! NO! This is a command based on the Goofy Time meme, what else would it be?",
			explainedUsage: [["user", "The user who will say IT'S GOOFY TIME!"]],
			examples: ["TotallyNotADaddy"]
		},
		commandHugDescription: "Hugs!",
		commandHugExtended: {
			extendedHelp:
				"What would be two people in the middle of the snow with coats and hugging each other? Wait! I get it! Mention somebody you want to hug with, and I'll try my best to draw it in a canvas!",
			explainedUsage: [["user", "The user to hug with."]],
			examples: ["Bear"]
		},
		commandIneedhealingDescription: "*Genji's voice* I NEED HEALING!",
		commandIneedhealingExtended: {
			extendedHelp: [
				'Do you know the worst nightmare for every single healer in Overwatch, specially for Mercy? YES!",
				'You know it, it's a cool cyborg ninja that looks like a XBOX and is always yelling "I NEED HEALING" loudly during the entire match.",
				"Well, don't expect so much, this command actually shows a medic with some tool in your chest."
			],
			explainedUsage: [["healer", "The healer you need to heal you."]],
			examples: ["Mercy"],
			multiline: true
		},
		commandRandRedditDescription: "Retrieve a random Reddit post.",
		commandRandRedditExtended: {
			extendedHelp: "This is actually something like a Russian Roulette, you can get a good meme, but you can also get a terrible meme.",
			explainedUsage: [["reddit", "The reddit to look at."]],
			examples: ["discordapp"]
		},
		commandRedditUserDescription: "Retrieve statistics for a Reddit user.",
		commandRedditUserExtended: {
			extendedHelp: "Gets statistics of any given Reddit user",
			explainedUsage: [["user", "The reddit user to look at."]],
			examples: ["GloriousGe0rge"]
		},
		commandShipDescription: "Ships 2 members",
		commandShipExtended: {
			extendedHelp: [
				'This commands generates a ship name between two users and creates more love in the world.",
				'Users are optional, you can provide none, just one or both users. For any non-provided users I will pick a random guild member.'
			],
			explainedUsage: [
				["firstUser", "The first user to ship"],
				["secondUser", "The second user to ship"]
			],
			examples: ["romeo juliet"],
			reminder: "If I cannot find either given user then I will pick someone randomly.",
			multiline: true
		},
		commandShipData: ({
			title: "**Shipping `{{romeoUsername}}` and `{{julietUsername}}`**",
			description: "I call it... {{shipName}}`
		}),
		commandChaseDescription: "Get in here!",
		commandChaseExtended: {
			extendedHelp: "Do you love chasing? Start chasing people now for free! Just mention or write their ID and done!",
			explainedUsage: [["pinger", "The user who you want to chase."]],
			examples: ["IAmInnocent"]
		},
		commandShindeiruDescription: "Omae wa mou shindeiru.",
		commandShindeiruExtended: {
			extendedHelp: [
				'"You are already dead" Japanese: お前はもう死んでいる; Omae Wa Mou Shindeiru, is an expression from the manga and anime series Fist of the North Star.",
				'This shows a comic strip of the character pronouncing the aforementioned words, which makes the opponent reply with "nani?" (what?).'
			],
			explainedUsage: [["user", "The person you're telling that phrase to."]],
			examples: ["Jack"],
			multiline: true
		},
		commandPeepoloveDescription: "Generates a peepoLove image from a users' avatar.",
		commandPeepoloveExtended: {
			extendedHelp: "Allows you to generate a peepoLove image from a user's avatar.",
			explainedUsage: [["user", "The user that peepo should hug."]],
			examples: ["Joe"],
			reminder: "Custom image support has been temporarily disabled, ETA on it being back is roughly November 2020'
		},
		commandSlapDescription: "Slap another user using the Batman & Robin Meme.",
		commandSlapExtended: {
			extendedHelp: "The hell are you saying? *Slaps*. This meme is based on a comic from Batman and Robin.",
			explainedUsage: [["user", "The user you wish to slap."]],
			examples: ["Jake"],
			reminder: "You try to slap me and I'll slap you instead."
		},
		commandSnipeDescription: "Retrieve the last deleted message from a channel",
		commandSnipeExtended: {
			extendedHelp: "This just sends the last deleted message from this channel, somebody is misbehaving? This will catch them.'
		},
		commandThesearchDescription: "Are we the only one in the universe, this man on earth probably knows.",
		commandThesearchExtended: {
			extendedHelp: "One man on Earth probably knows if there is intelligent life, ask and you shall receive an answer.",
			explainedUsage: [["answer", "The sentence that will reveal the truth."]],
			examples: ["Your waifu is not real."]
		},
		commandTriggeredDescription: "I am getting TRIGGERED!",
		commandTriggeredExtended: {
			extendedHelp:
				"What? My commands are not userfriendly enough?! (╯°□°）╯︵ ┻━┻. This command generates a GIF image your avatar wiggling fast, with a TRIGGERED footer, probably going faster than I thought, I don't know.",
			explainedUsage: [["user", "The user that is triggered."]],
			examples: ["kyra"]
		},
		commandUpvoteDescription: "Get a link to upvote Skyra in **Bots For Discord**",
		commandUpvoteExtended: {
			extendedHelp:
				'Bots For Discord is a website where you can find amazing bots for your website. If you really love me, you can help me a lot by upvoting me every 24 hours, so more users will be able to find me!'
		},
		commandVaporwaveDescription: "Vapowave characters!",
		commandVaporwaveExtended: {
			extendedHelp:
				"Well, what can I tell you? This command turns your messages into unicode monospaced characters. That is, what humans call 'Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ'. I wonder what it means...",
			explainedUsage: [["phrase", "The phrase to convert"]],
			examples: ["A E S T H E T I C"]
		},

		/**
		 * ##############################
		 * MODERATION/MANAGEMENT COMMANDS
		 */

		commandHistoryDescription: "Display the count of moderation cases from this guild or from a user.",
		commandHistoryExtended: {
			extendedHelp: "This command shows the amount of bans, mutes, kicks, and warnings, including temporary, that have not been appealed.",
			examples: ["", "@Pete"]
		},
		commandHistoryFooterNew:
			`This user has {{warnings}} {{warningsText}}, {{mutes}} {{mutesText}}, {{kicks}} {{kicksText}}, and {{bans}} {{bansText}}",
		commandHistoryFooterWarning: 'warning",
		commandHistoryFooterWarning_plural: 'warnings",
		commandHistoryFooterMutes: 'mute",
		commandHistoryFooterMutes_plural: 'mutes",
		commandHistoryFooterKicks: 'kick",
		commandHistoryFooterKicks_plural: 'kicks",
		commandHistoryFooterBans: 'ban",
		commandHistoryFooterBans_plural: 'bans",
		commandModerationsDescription: "List all running moderation logs from this guild.",
		commandModerationsExtended: {
			extendedHelp: "This command shows you all the temporary moderation actions that are still running. This command uses a reaction-based menu and requires the permission **{{this.PERMISSIONS.MANAGE_MESSAGES}}** to execute correctly.",
			examples: ["", "@Pete", "mutes @Pete", "warnings"]
		},
		commandModerationsEmpty: "Nobody has behaved badly yet, who will be the first user to be listed here?",
		commandModerationsAmount: 'There is 1 entry.",
		commandModerationsAmount_plural: "There are {{count}} entries.",
		commandMutesDescription: "List all mutes from this guild or from a user.",
		commandMutesExtended: {
			extendedHelp: [
				'This command shows either all mutes filed in this guild, or all mutes filed in this guild for a specific user.",
				`This command uses a reaction-based menu and requires the permission **{{this.PERMISSIONS.MANAGE_MESSAGES}}** to execute correctly.`
			],
			examples: ["", "@Pete"],
			multiline: true
		},
		commandWarningsDescription: "List all warnings from this guild or from a user.",
		commandWarningsExtended: {
			extendedHelp: [
				'This command shows either all warnings filed in this guild, or all warnings filed in this guild for a specific user.",
				`This command uses a reaction-based menu and requires the permission **{{this.PERMISSIONS.MANAGE_MESSAGES}}** to execute correctly.`
			],
			examples: ["", "@Pete"],
			multiline: true
		},

		/**
		 * #############################
		 * MODERATION/UTILITIES COMMANDS
		 */

		commandSlowmodeDescription: "Set the channel's slowmode value in seconds.",
		commandSlowmodeExtended: {
			extendedHelp: "This command requires **{{this.PERMISSIONS.MANAGE_CHANNELS}}** and will modify the channel's ratelimit per user to any value between 0 and 120 seconds.",
			examples: ["0", "reset", "4"],
			reminder: "To reset a channel's ratelimit per user, you can use either 0 or 'reset'."
		},

		/**
		 * ###################
		 * MODERATION COMMANDS
		 */

		commandBanDescription: "Hit somebody with the ban hammer.",
		commandBanExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.BAN_MEMBERS}}**, and only members with lower role hierarchy position can be banned by me.",
				"No, the guild's owner cannot be banned.",
				'This action can be optionally timed to create a temporary ban.'
			],
			examples: ["@Pete", "@Pete Spamming all channels.", "@Pete 24h Spamming all channels"],
			multiline: true
		},
		commandDehoistDescription: "Shoot everyone with the Dehoistinator 3000",
		commandDehoistExtended: {
			extendedHelp: [
				'The act of hoisting involves adding special characters in front of your nickname in order to appear higher in the members list.",
				"This command replaces any member's nickname that includes those special characters with a special character that drags them to the bottom of the list."
			],
			reminder: "This command requires **{{this.PERMISSIONS.MANAGE_NICKNAMES}}**, and only members with lower role hierarchy position can be dehoisted.",
			multiline: true
		},
		commandKickDescription: "Hit somebody with the 👢.",
		commandKickExtended: {
			extendedHelp: "This command requires **{{this.PERMISSIONS.KICK_MEMBERS}}**, and only members with lower role hierarchy position can be kicked by me. No, the guild's owner cannot be kicked.",
			examples: ["@Sarah", "@Sarah Spamming general chat."]
		},
		commandLockdownDescription: "Close the gates for this channel!",
		commandLockdownExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MANAGE_CHANNELS}}** in order to be able to manage the permissions for a channel.",
				`This command removes the permission **{{this.PERMISSIONS.SEND_MESSAGES}}** to the `@everyone` role so nobody but the members with roles that have their own overrides (besides administrators, who bypass channel overrides) can send messages.",
				'Optionally, you can pass time as second argument.'
			],
			examples: ["", "#general", "#general 5m"],
			multiline: true
		},
		commandMuteDescription: "Mute a user in all text and voice channels.",
		commandMuteExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}**, and only members with lower role hierarchy position can be managed by me.",
				"No, the guild's owner cannot be muted.",
				"This action can be optionally timed to create a temporary mute. This action saves a member's roles temporarily and will be granted to the user after the unmute.",
				'The muted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ["@Alphonse", "@Alphonse Spamming all channels", "@Alphonse 24h Spamming all channels"],
			multiline: true
		},
		commandSetNicknameDescription: "Change the nickname of a user.",
		commandSetNicknameExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MANAGE_NICKNAMES}}**, and only members with lower role hierarchy position can be managed by me.",
				"No, the guild's owner nickname cannot be changed."
			],
			examples: ["@Pete peeehteeerrr", "@ꓑ𝗲੮ẻ Pete Unmentionable name"],
			multiline: true
		},
		commandAddRoleDescription: "Adds a role to a user.",
		commandAddRoleExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}**, and only members with lower role hierarchy position can be managed by me.",
				"No, the guild's owner roles cannot be changed."
			],
			examples: ["@John member", "@John member Make John a member"],
			multiline: true
		},
		commandRemoveroleDescription: "Removes a role from a user",
		commandRemoveroleExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}**, and only members with lower role hierarchy position can be managed by me.",
				"No, the guild's owner roles cannot be changed."
			],
			examples: ["@Paula member", "@Paula member Remove member permissions from Paula"],
			multiline: true
		},
		commandPruneDescription: "Prunes a certain amount of messages w/o filter.",
		commandPruneExtended: {
			extendedHelp: [
				'This command deletes the given amount of messages given a filter within the last 100 messages sent in the channel the command has been run.",
				'Optionally, you can add `--silent` to tell Skyra not to send a response message.'
			],
			explainedUsage: [
				["Messages", "The amount of messages to prune."],
				["Filter", "The filter to apply."],
				["(Filter) Link", "Filters messages that have links on the content."],
				["(Filter) Invite", "Filters messages that have invite links on the content."],
				["(Filter) Bots", "Filters messages sent by bots."],
				["(Filter) You", "Filters messages sent by Skyra."],
				["(Filter) Me", "Filters your messages."],
				["(Filter) Upload", "Filters messages that have attachments."],
				["(Filter) User", "Filters messages sent by the specified user."],
				["(Filter) Human", "Filters messages sent by humans."],
				["Position", "Lets you delete messages before or after a specific message."],
				["(Position) Before", "Deletes all messages before the given message."],
				["(Position) After", "Deletes all messages after the given message."]
			],
			examples: ["50 me", "75 @kyra", "20 bots", "60 humans before 629992398700675082"],
			reminder: "Due to a Discord limitation, bots cannot delete messages older than 14 days.",
			multiline: true
		},
		commandCaseDescription: "Get the information from a case by its index.",
		commandCaseExtended: {
			extendedHelp: "You can also get the latest moderation case by specifying the case ID as "latest"",
			explainedUsage: [["Case", "Number of the case ID to get or "latest""]],
			examples: ["5", "latest"]
		},
		commandPermissionsDescription: "Check the permission for a member, or yours.",
		commandPermissionsExtended: {
			extendedHelp: "Ideal if you want to know the what permissions are granted to a member when they have a certain set of roles.'
		},
		commandFlowDescription: "Shows the amount of messages per minute in a channel.",
		commandFlowExtended: {
			extendedHelp: "This helps you determine the overall activity of a channel",
			explainedUsage: [["channel", "(Optional): The channel to check, if omitted current channel is used"]]
		},
		commandReasonDescription: "Edit the reason field from a moderation log case.",
		commandReasonExtended: {
			extendedHelp: [
				'This command allows moderation log case management, it allows moderators to update the reason.",
				'If you want to modify multiple cases at once you provide a range.",
				'For example `1..3` for the `<range>` will edit cases 1, 2, and 3.",
				'Alternatively you can also give ranges with commas:",
				'`1,3..6` will result in cases 1, 3, 4, 5, and 6",
				'`1,2,3` will result in cases 1, 2, and 3'
			],
			examples: ["420 Spamming all channels", "419..421 Bad memes", "1..3,4,7..9 Posting NSFW", "latest Woops, I did a mistake!"],
			multiline: true
		},
		commandRestrictAttachmentDescription: "Restrict a user from sending attachments in all channels.",
		commandRestrictAttachmentExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}**, and only members with lower role hierarchy position can be managed by me.",
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.",
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ["@Pete", "@Pete Sending weird images", "@Pete 24h Sending NSFW images"],
			multiline: true
		},
		commandRestrictEmbedDescription: "Restrict a user from attaching embeds in all channels.",
		commandRestrictEmbedExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}**, and only members with lower role hierarchy position can be managed by me.",
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.",
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ["@Pete", "@Pete Sending weird links", "@Pete 24h Posted a spam link"],
			multiline: true
		},
		commandRestrictEmojiDescription: "Restrict a user from using external emojis in all channels.",
		commandRestrictEmojiExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}**, and only members with lower role hierarchy position can be managed by me.",
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.",
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ["@Pete", "@Pete Spamming external emojis", "@Pete 24h Posted cringe"],
			reminder: "This will only prevent the usage of external emojis and so will have no effect for non-nitro users, your own server's emojis and regular build in twemojis can still be used by members with this role.",
			multiline: true
		},
		commandRestrictReactionDescription: "Restrict a user from reacting to messages in all channels.",
		commandRestrictReactionExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}**, and only members with lower role hierarchy position can be managed by me.",
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.",
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ["@Pete", "@Pete Spamming reactions", "@Pete 24h Posting weird reactions"],
			multiline: true
		},
		commandRestrictVoiceDescription: "Restrict a user from joining any voice channel.",
		commandRestrictVoiceExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}**, and only members with lower role hierarchy position can be managed by me.",
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.",
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ["@Pete", "@Pete Earraping in general voice channels", "@Pete 24h Making weird noises"],
			multiline: true
		},
		commandSoftBanDescription: "Hit somebody with the ban hammer, destroying all their messages for some days, and unban it.",
		commandSoftBanExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.BAN_MEMBERS}}**, and only members with lower role hierarchy position can be banned by me.",
				"No, the guild's owner cannot be banned.",
				"The ban feature from Discord has a feature that allows the moderator to remove all messages from all channels that have been sent in the last 'x' days, being a number between 0 (no days) and 7.",
				'The user gets unbanned right after the ban, so it is like a kick, but that can prune many many messages.'
			],
			examples: ["@Pete", "@Pete Spamming all channels", "@Pete 7 All messages sent in 7 are gone now, YEE HAH!"],
			multiline: true
		},
		commandToggleModerationDmDescription: "Toggle moderation DMs.",
		commandToggleModerationDmExtended: {
			extendedHelp: "This command allows you to toggle moderation DMs. By default, they are on, meaning that any moderation action (automatic or manual) will DM you, but you can disable them with this command.`
		},
		commandUnbanDescription: "Unban somebody from this guild!.",
		commandUnbanExtended: {
			extendedHelp: "This command requires **{{this.PERMISSIONS.BAN_MEMBERS}}**. It literally gets somebody from the rubbish bin, cleans them up, and allows the pass to this guild's gates.",
			examples: ["@Pete", "@Pete Turns out he was not the one who spammed all channels ¯\\_(ツ)_/¯"]
		},
		commandUnmuteDescription: "Remove the scotch tape from a user.",
		commandUnmuteExtended: {
			extendedHelp: "This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}** and removes a user from the muted people's list, and gives the old roles back if the user had them.",
			examples: ["@Pete", "@Pete (Insert random joke here)."]
		},
		commandUnrestrictAttachmentDescription: "Remove the attachment restriction from one or more users.",
		commandUnrestrictAttachmentExtended: {
			extendedHelp: "This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}** and removes a user from the restricted people's list.",
			examples: ["@Pete"]
		},
		commandUnrestrictEmbedDescription: "Remove the embed restriction from one or more users.",
		commandUnrestrictEmbedExtended: {
			extendedHelp: "This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}** and removes a user from the restricted people's list.",
			examples: ["@Pete"]
		},
		commandUnrestrictEmojiDescription: "Remove the external emoji restriction from one or more users.",
		commandUnrestrictEmojiExtended: {
			extendedHelp: "This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}** and removes a user from the restricted people's list.",
			examples: ["@Pete"]
		},
		commandUnrestrictReactionDescription: "Remove the reaction restriction from one or more users.",
		commandUnrestrictReactionExtended: {
			extendedHelp: "This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}** and removes a user from the restricted people's list.",
			examples: ["@Pete"]
		},
		commandUnrestrictVoiceDescription: "Remove the voice restriction from one or more users.",
		commandUnrestrictVoiceExtended: {
			extendedHelp: "This command requires **{{this.PERMISSIONS.MANAGE_ROLES}}** and removes a user from the restricted people's list.",
			examples: ["@Pete"]
		},
		commandUnwarnDescription: "Appeal a warning moderation log case.",
		commandUnwarnExtended: {
			extendedHelp: "This command appeals a warning, it requires no permissions, you only give me the moderation log case to appeal and the reason.",
			examples: ["0 Whoops, wrong dude.", "42 Turns out this was the definition of life."]
		},
		commandVmuteDescription: "Throw somebody's microphone out the window.",
		commandVmuteExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MUTE_MEMBERS}}**, and only members with lower role hierarchy position can be silenced by me.",
				"No, the guild's owner cannot be silenced.",
				'This action can be optionally timed to create a temporary voice mute.'
			],
			examples: ["@Pete", "@Pete Singing too loud", "@Pete 24h Literally sang ear rape"],
			multiline: true
		},
		commandVoiceKickDescription: "Hit somebody with the 👢 for singing so bad and loud.",
		commandVoiceKickExtended: {
			extendedHelp: [
				`This command requires the permissions **{{this.PERMISSIONS.MANAGE_CHANNELS}}** to create a temporary (hidden) voice channel, and **{{this.PERMISSIONS.MOVE_MEMBERS}}** to move the user to the temporary channel.",
				'After this, the channel is quickly deleted, making the user leave the voice channel.",
				'For scared moderators, this command has almost no impact in the average user, as the channel is created in a way only me and the selected user can see and join, then quickly deleted.'
			],
			examples: ["@Pete", "@Pete Spamming all channels"],
			multiline: true
		},
		commandVunmuteDescription: "Get somebody's microphone back so they can talk.",
		commandVunmuteExtended: {
			extendedHelp: [
				`This command requires **{{this.PERMISSIONS.MUTE_MEMBERS}}**, and only members with lower role hierarchy position can be un-silenced by me.",
				"No, the guild's owner cannot be un-silenced."
			],
			examples: ["@Pete", "@Pete Appealed his times signing hear rape."],
			multiline: true
		},
		commandWarnDescription: "File a warning to somebody.",
		commandWarnExtended: {
			extendedHelp: [
				'This command files a warning to a user.",
				"This kind of warning is meant to be **formal warnings**, as they will be shown in the 'warnings' command.",
				'It is a good practise to do an informal warning before using this command.'
			],
			examples: ["@Pete Attempted to mention everyone."],
			multiline: true
		},

		/**
		 * ##################
		 * POKÉMON COMMANDS
		 */
		commandAbilityDescription: "Gets data for any given Pokémon ability using my Pokémon dataset.",
		commandAbilityExtended: {
			extendedHelp: "Uses a fuzzy search to also match against near-matches.",
			explainedUsage: [["ability", "The ability for which you want to find data"]],
			examples: ["multiscale", "pressure"]
		},
		commandAbilityEmbedTitles: {
			authorTitle: "Ability",
			fieldEffectTitle: "Effect outside of battle'
		},
		commandAbilityQueryFail: "I am sorry, but that query failed. Are you sure `{{ability}}` is actually an ability in Pokémon?",
		commandFlavorsDescription: "Gets the dex entries across various games for a Pokémon.",
		commandFlavorsExtended: {
			extendedHelp: ["Uses a fuzzy search to also match against near-matches.", "You can provide a flag of `--shiny` to get the shiny sprite."],
			explainedUsage: [["pokemon", "The Pokémon for which you want to get flavour texts"]],
			examples: ["dragonite", "pikachu", "pikachu --shiny"],
			multiline: true
		},
		commandFlavorsQueryFail: "I am sorry, but that query failed. Are you sure `{{pokemon}}` is actually a Pokémon?",
		commandItemDescription: "Gets data for any given Pokémon item using my Pokémon dataset.",
		commandItemExtended: {
			extendedHelp: "Uses a fuzzy search to also match against near-matches.",
			explainedUsage: [["item", "The item for which you want to find data"]],
			examples: ["life orb", "choice specs"]
		},
		commandItemEmbedData: ({
			ITEM: "Item",
			generationIntroduced: "Generation introduced",
			availableInGeneration8Title: "Available in generation 8",
			availableInGeneration8Data: availableInGen8
		}),
		commandItemQueryFail: "I am sorry, but that query failed. Are you sure `{{item}}` is actually a item in Pokémon?",
		commandLearnDescription: "Retrieves whether a given Pokémon can learn one or more given moves using my Pokémon dataset.",
		commandLearnExtended: {
			extendedHelp: [
				'Uses a fuzzy search to also match against near-matches.",
				'Moves split on every ", " (comma space) and you can provide as many moves as you wish.",
				'You can provide a flag of `--shiny` to get the shiny sprite.'
			],
			explainedUsage: [
				["generation", "(Optional), The generation for which to check the data"],
				["pokemon", "The Pokémon whose learnset you want to check"],
				["move", "The move(s) you want to check for"]
			],
			examples: ["7 dragonite dragon dance", "pikachu thunder bolt", "pikachu thunder bolt --shiny", "pikachu thunder bolt, thunder"],
			multiline: true
		},
		commandLearnMethodTypes: ({
			levelUpMoves: "by level up at level {{level}}",
			eventMoves: "through an event",
			tutorMoves: "from a move tutor",
			eggMoves: "as an eggmove",
			virtualTransferMoves: "by transfering from virtual console games",
			tmMoves: "by using a technical machine or technical record",
			dreamworldMoves: "through a Dream World capture'
		}),
		commandLearnInvalidGeneration: "I am sorry, but {{generation}} is not a supported Pokémon Generation",
		commandLearnMethod:
			`In generation {{generation}} {{pokemon}} __**can**__ learn **{{move}}** {{method}}",
		commandLearnQueryFailed:
			`I am sorry, but that query failed. Are you sure you `${toTitleCase(pokemon)}` is actually a Pokémon and {{moves}} are actually moves?",
		commandLearnCannotLearn: "Looks like ${toTitleCase(pokemon)} cannot learn {{moves}}",
		commandLearnTitle: "Learnset data for ${toTitleCase(pokemon)} in generation {{generation}}",
		commandMoveDescription: "Gets data for any given Pokémon move using my Pokémon dataset",
		commandMoveExtended: {
			extendedHelp: "Uses a fuzzy search to also match against near-matches.",
			explainedUsage: [["move", "The move for which you want to find data"]],
			examples: ["dragon dance", "GMax Wildfire", "Genesis Supernova"],
			reminder: [
				'Z-Move power may be shown for Generation 8 moves because it is calculated with a conversion table.",
				'If Pokémon ever returns Z-Moves to the game this would be their theoretical power, however as it stands",
				'Z-Moves are **NOT** in Generation 8.'
			],
			multiline: true
		},
		commandMoveEmbedData: ({
			move: "Move",
			types: "Type",
			basePower: "Base Power",
			pp: "PP",
			category: "Category",
			accuracy: "Accuracy",
			priority: "Priority",
			target: "Target",
			contestCondition: "Contest Condition",
			zCrystal: "Z-Crystal",
			gmaxPokemon: "G-MAX Pokémon",
			availableInGeneration8Title: "Available in Generation 8",
			availableInGeneration8Data: availableInGen8,
			none: "None",
			maxMovePower: "Base power as MAX move (Dynamax)",
			zMovePower: "Base power as Z-Move (Z-Crystal)",
			fieldMoveEffectTitle: "Effect outside of battle'
		}),
		commandMoveQueryFail: "I am sorry, but that query failed. Are you sure `{{move}}` is actually a move in Pokémon?",
		commandPokedexDescription: "Gets data for any given Pokémon using my Pokémon dataset.",
		commandPokedexExtended: {
			extendedHelp: ["Uses a fuzzy search to also match against near-matches.", "You can provide a flag of `--shiny` to get the shiny sprite."],
			explainedUsage: [["pokemon", "The Pokémon for which you want to find data"]],
			examples: ["dragonite", "pikachu", "pikachu --shiny"],
			reminder: [
				'If there are any "Other forme(s)" on the optional fourth page, those can be requested as well.",
				'Cosmetic Formes on that page list purely cosmetic changes and these do not have seperate entries in the Pokédex.'
			],
			multiline: true
		},
		commandPokedexEmbedData: ({
			types: "Type(s)",
			abilities: "Abilities",
			genderRatio: "Gender Ratio",
			smogonTier: "Smogon Tier",
			uknownSmogonTier: "Unknown / Alt form",
			height: "Height",
			weight: "Weight",
			eggGroups: "Egg group(s)",
			evolutionaryLine: "Evolutionary line",
			baseStats: "Base stats",
			baseStatsTotal: "BST",
			flavourText: "Pokdex entry",
			otherFormesTitle: "Other forme(s)",
			cosmeticFormesTitle: "Cosmetic Formes",
			otherFormesList: this.list(otherFormes, "and'),
			cosmeticFormesList: this.list(cosmeticFormes, "and')
		}),
		commandPokedexQueryFail: "I am sorry, but that query failed. Are you sure `{{pokemon}}` is actually a Pokémon?",
		commandTypeDescription: "Gives the type matchups for one or two Pokémon types",
		commandTypeExtended: {
			extendedHelp: "Types have to be exact matches to pokemon types (upper/lowercase can be ignored)",
			explainedUsage: [["type", "The type(s) to look up"]],
			examples: ["dragon", "fire flying"]
		},
		commandTypeEmbedData: ({
			offensive: "Offensive",
			defensive: "Defensive",
			superEffectiveAgainst: "Supereffective against",
			dealsNormalDamageTo: "Deals normal damage to",
			doesNotAffect: "Doesn't affect",
			notVeryEffectiveAgainst: "Not very effective against",
			vulnerableTo: "Vulnerable to",
			takesNormalDamageFrom: "Takes normal damage from",
			resists: "Resists",
			notAffectedBy: "Not affected by",
			typeEffectivenessFor: "Type effectiveness for ${this.list(types, "and')}`
		}),
		commandTypeTooManyTypes: "I am sorry, but you can get the matchup for at most 2 types",
		commandTypeNotAType: "{{type}} is not a valid Pokémon type",
		commandTypeQueryFail: "I am sorry, but that query failed. Are you sure {{types}} are actually types in Pokémon?",

		/**
		 * ##################
		 * STARBOARD COMMANDS
		 */

		commandStarDescription: "Get a random starred message from the database or the star leaderboard.",
		commandStarExtended: {
			extendedHelp: "This command shows a random starred message or the starboard usage and leaderboard for this server.'
		},

		/**
		 * ################
		 * GOOGLE COMMANDS
		 */

		commandCurrentTimeDescription: "Gets the current time in any location on the world",
		commandCurrentTimeExtended: {
			extendedHelp: [
				'This command uses Google Maps to get the coordinates of the place.",
				'Once this command has the coordinates, it queries TimezoneDB to get the time data.'
			],
			explainedUsage: [["location", "The locality, governing, country or continent to check the time for."]],
			examples: ["Antarctica", "Arizona"],
			multiline: true
		},
		commandCurrentTimeLocationNotFound: "I am sorry, but I could not find time data for that location.",
		commandCurrentTimeTitles: ({
			currentTime: "Current Time",
			currentDate: "Current Date",
			country: "Country",
			gmsOffset: "GMT Offset",
			dst: "**DST**: {{dst}}`
		}),
		commandCurrentTimeDst: "Does not observe DST right now",
		commandCurrentTimeNoDst: "Observes DST right now",
		commandGsearchDescription: "Find your favourite things on Google",
		commandGsearchExtended: {
			extendedHelp: "This command queries the powerful Google Search engine to find websites for your query. For images please use the `gimage` command.",
			explainedUsage: [["query", "The thing you want to find on Google"]],
			examples: ["Discord", "Skyra"]
		},
		commandGimageDescription: "Find your favourite images on Google",
		commandGimageExtended: {
			extendedHelp: "This command queries the powerful Google Search engine to find images for your query. For regular web results please use the `gsearch` command.",
			explainedUsage: [["query", "The image you want to find on Google"]],
			examples: ["Discord", "Skyra"],
			reminder:
				'This command has been marked as NSFW because it is unavoidable that when you query explicit content, you will get explicit results.'
		},
		commandLmgtfyDescription: "Annoy another user by sending them a LMGTFY (Let Me Google That For You) link.",
		commandLmgtfyExtended: {
			explainedUsage: [["query", "The query to google"]]
		},
		commandWeatherDescription: "Check the weather status in a location.",
		commandWeatherExtended: {
			extendedHelp: [
				'This command uses Google Maps to get the coordinates of the place.",
				'Once this command got the coordinates, it queries DarkSky to retrieve information about the weather.'
			],
			explainedUsage: [["city", "The locality, governing, country or continent to check the weather from."]],
			examples: ["Antarctica", "Arizona"],
			reminder: "Temperature is in **Celsius** by default. Use the --imperial or --fahrenheit flag to view it in **Fahrenheit**.",
			multiline: true
		},
		googleErrorZeroResults: "Your request returned no results.",
		googleErrorRequestDenied: "The GeoCode API Request was denied.",
		googleErrorInvalidRequest: "Invalid request.",
		googleErrorOverQueryLimit: "Query Limit exceeded. Try again tomorrow.",
		googleErrorUnknown: "I am sorry, but I failed to get a result from Google.",

		/**
		 * ################
		 * GENERAL COMMANDS
		 */

		commandInviteDescription: "Shows the invite link to add Skyra to your server.",
		commandInviteExtended: {
			extendedHelp:
				'If you would like to get a link where Skyra will not ask for any permissions add either `noperms", "--noperms` or `--nopermissions` to the command.",
			examples: ["", "noperms", "--noperms", "--nopermissions"]
		},
		commandInvitePermissionInviteText: "Invite Skyra to your server",
		commandInvitePermissionSupportServerText: "Join Support Server",
		commandInvitePermissionsDescription:
			"Don't be afraid to uncheck some permissions, I will let you know if you're trying to run a command without permissions.",
		commandInfoBody: [
			`Skyra {{VERSION}} is a multi-purpose Discord Bot designed to run the majority of tasks with a great performance and constant 24/7 uptime.",
			"She is built on top of Klasa, a 'plug-and-play' framework built on top of the Discord.js library.",
			'",
			'Skyra features:",
			'• Advanced Moderation with temporary actions included",
			'• Announcement management",
			'• Fully configurable",
			'• Message logs, member logs, and mod logs",
			'• Multilingual",
			'• Profiles and levels, with leaderboards and social management",
			'• Role management",
			'• Weeb commands (+10)!",
			'And more!'
		],
		commandHelpData: ({
			title: "{{titleDescription}}",
			usage: "📝 | ***Command Usage***\n`{{usage}}`\n",
			extended: "🔍 | ***Extended Help***\n{{extendedHelp}}",
			footer: "Command help for {{footerName}}`
		}),
		commandSupportEmbedTitle: "Looking for help, {{username}}?",
		commandSupportEmbedDescription: "Then you should probably join [Skyra's Lounge](https://join.skyra.pw)! There, you can receive support by the developers and other members of the community!",

		/**
		 * ##################
		 * STARBOARD COMMANDS
		 */

		commandStarNostars: "There is no starred message.",
		commandStarNoChannel: "I'm sorry, but a starboard channel hasn't been set up.",
		commandStarStats: "Starboard Stats",
		commandStarMessages: "{{count}} message",
		commandStarMessages_plural: "{{count}} messages",
		commandStars: "{{count}} star",
		commandStars_plural: "{{count}} stars",
		commandStarStatsDescription: "{{messages}} starred with a total of {{stars}}",
		commandStarTopstarred: "Top Starred Posts",
		commandStarTopstarredDescription: "{{medal}}: {{id}} ({{count}} star)",
		commandStarTopstarredDescription_plural: "{{medal}}: {{id}} ({{count}} stars)",
		commandStarTopreceivers: "Top Star Receivers",
		commandStarTopreceiversDescription: "{{medal}}: <@{{id}}> ({{count}} star)",
		commandStarTopreceiversDescription_plural: "{{medal}}: <@{{id}}> ({{count}} stars)",

		/**
		 * ####################
		 * SUGGESTIONS COMMANDS
		 */
		commandSuggestDescription: "Posts a suggestion for the server.",
		commandSuggestExtended: {
			extendedHelp: "Posts a suggestion to the server's suggestion channel, if configured.",
			explainedUsage: [["suggestion", "Your suggestion"]],
			examples: ["Let's make a music channel!"],
			reminder:
				'You need to have a suggestions channel setup for this command to work. If you are an administrator, you will be given the chance to do so upon invoking the command.'
		},
		commandSuggestNoSetup: "I'm sorry {{username}}, but a suggestions channel hasn't been set up.",
		commandSuggestNoSetupAsk:
			`I'm sorry {{username}}, but a suggestions channel hasn't been set up. Would you like to set up a channel now?",
		commandSuggestNoSetupAbort: "Alright then. Aborted creating a new suggestion.",
		commandSuggestNopermissions:
			`I'm sorry {{username}}, but the administrators didn't give me permission to send messages in {{channel}}!",
		commandSuggestChannelPrompt: "Please mention the channel you want to set as the suggestions channel.",
		commandSuggestTitle: "Suggestion #{{id}}",
		commandSuggestSuccess: "Thank you for your suggestion! It has been successfully posted to {{channel}}!",
		commandResolveSuggestionDescription: "Set the suggestion's status.",
		commandResolveSuggestionExtended: {
			extendedHelp: "This command allows you to update a suggestion's status, marking it either as accepted, considered or denied.",
			examples: [
				'1 accept Thank you for your suggestion!",
				'1 a Thank you for your suggestion!",
				"1 consider Hmm... we may do this, but it's really low priority",
				"1 c Hmm... we may do this, but it's really low priority",
				'1 deny There is no way this is going to happen.",
				'1 d There is no way this is going to happen.'
			],
			reminder: [
				'Suggestions also can be configured to DM the author regarding the status of their suggestion, with the `suggestions.on-action.dm` setting.",
				'Furthermore, in case you wish to preserve anonymity, you can hide your name using the `suggestions.on-action` setting, which can be overridden with the `--hide-author` and `--show-author` flags.'
			],
			multiline: true
		},
		commandResolveSuggestionInvalidId: "{{REDCROSS}} That's not a valid suggestion ID!",
		commandResolveSuggestionMessageNotFound: "{{REDCROSS}} I was not able to retrieve the suggestion as its message has been deleted.",
		commandResolveSuggestionIdNotFound: "{{REDCROSS}} Couldn't find a suggestion with that ID",
		commandResolveSuggestionDefaultComment: "No comment was provided.",
		commandResolveSuggestionAuthorAdmin: "An administrator",
		commandResolveSuggestionAuthorModerator: "A moderator",
		commandResolveSuggestionActions: ({
			accept: "{{author}} accepted this suggestion:",
			consider: "{{author}} considered this suggestion:",
			deny: "{{author}} denied this suggestion:`
		}),
		commandResolveSuggestionActionsDms: ({
			accept: "{{author}} accepted this suggestion in {{guild}}:",
			consider: "{{author}} considered this suggestion in {{guild}}:",
			deny: "{{author}} denied this suggestion in {{guild}}:`
		}),
		commandResolveSuggestionDmFail: "{{REDCROSS}} I wasn't able to send the author a DM. Are their DMs closed?",
		commandResolveSuggestionSuccess: "{{GREENTICK}} Successfully {{actionText}} suggestion `{{id}}`!",
		commandResolveSuggestionSuccessAcceptedText: "accepted",
		commandResolveSuggestionSuccessDeniedText: "denied",
		commandResolveSuggestionSuccessConsideredText: "considered",

		/**
		 * ###############
		 * SYSTEM COMMANDS
		 */

		commandEvalTimeout: "TIMEOUT: Took longer than {{seconds}} seconds.",
		commandEvalError: "**Error**:{{output}}\n**Type**:{{type}}\n{{time}}",

		commandStatsTitles: {
			stats: "Statistics",
			uptime: "Uptime",
			serverUsage: "Server Usage'
		},
		commandStatsFields: ({
			stats: [
				`• **Users**: {{stats.users}}",
				`• **Guilds**: {{stats.guilds}}",
				`• **Channels**: {{stats.channels}}",
				`• **Discord.js**: {{stats.version}}",
				`• **Node.js**: {{stats.nodeJs}}`
			],
			uptime: [
				`• **Host**: ${this.duration(uptime.host, 2)}",
				`• **Total**: ${this.duration(uptime.total, 2)}",
				`• **Client**: ${this.duration(uptime.client, 2)}`
			],
			serverUsage: ["• **CPU Load**: ${usage.cpuLoad.join('% | ')}%", "• **Heap**: {{usage.ramUsed}} (Total: {{usage.ramTotal}})"]
		}),

		/**
		 * #############
		 * TAGS COMMANDS
		 */

		commandTagDescription: "Manage this guilds' tags.",
		commandTagExtended: {
			extendedHelp: [
				'Tags, also known as custom commands, can give you a chunk of text stored under a specific name.",
				'For example after adding a tag with `Skyra, tag add rule1 <your first rule>` you can use it with `Skyra, rule1` or `Skyra, tag rule1`",
				"When adding tags you can customize the final look by adding flags to the tag content (these won't show up in the tag itself!):",
				'❯ Add `--embed` to have Skyra send the tag embedded.",
				'The content will be in the description, so you can use all the markdown you wish. for example, adding [masked links](https://skyra.pw).",
				'❯ Add `--color=<a color>` or `--colour=<a colour>` to have Skyra colourize the embed. Does nothing unless also specifying `--embed`.",
				'Colours can be RGB, HSL, HEX or Decimal.'
			],
			explainedUsage: [
				[
					'action",
					`The action to perform: ${this.list(
						[
							'`add` to add new tags",
							'`remove` to delete a tag",
							'`edit` to edit a tag",
							'`source` to get the source of a tag",
							'`list` to list all known tags",
							'`show` to show a tag'
						],
						'or'
					)}.`
				],
				["tag", "The tag's name."],
				["contents", "Required for the actions `add` and `edit", specifies the content for the tag."]
			],
			examples: [
				'add rule1 Respect other users. Harassment, hatespeech, etc... will not be tolerated.",
				'add rule1 --embed --color=#1E88E5 Respect other users. Harassment, hatespeech, etc... will not be tolerated.",
				'edit rule1 Just be respectful with the others.",
				'rule1",
				'source rule1",
				'remove rule1",
				'list'
			],
			multiline: true
		},
		commandTagPermissionlevel: "You must be a staff member, moderator, or admin, to be able to manage tags.",
		commandTagNameNotAllowed: "A tag name may not have a grave accent nor invisible characters.",
		commandTagNameTooLong: "A tag name must be 50 or less characters long.",
		commandTagExists: "The tag '{{tag}}' already exists.",
		commandTagContentRequired: "You must provide a content for this tag.",
		commandTagAdded: "Successfully added a new tag: **{{name}}** with a content of:\n{{content}}",
		commandTagRemoved: "Successfully removed the tag **{{name}}**.",
		commandTagNotexists: "The tag '{{tag}}' does not exist.",
		commandTagEdited: "Successfully edited the tag **{{name}}** with a content of:\n{{content}}",
		commandTagListEmpty: "The tag list for this server is empty.",
		commandTagReset: "All tags have been successfully removed from this server.",

		/**
		 * #################################
		 * #           INHIBITORS          #
		 * #################################
		 */

		inhibitorSpam:
			`Can we move to {{channel}} please? This command might be too spammy and can ruin other people's conversations.",

		/**
		 * #################################
		 * #        NOTIFICATIONS          #
		 * #################################
		 */
		notificationsTwitchNoGameName: "*Game name not set*",
		notificationsTwitchEmbedDescription: "{{userName}} is now live!",
		notificationsTwitchEmbedDescriptionWithGame: "{{userName}} is now live - Streaming {{gameName}}!",
		notificationTwitchEmbedFooter: "Skyra Twitch Notifications",

		/**
		 * #################################
		 * #             UTILS             #
		 * #################################
		 */

		selfModerationCommandInvalidMissingAction:
			`{{REDCROSS}} Action must be any of the following: `enable\", `disable\", `action\", `punish\", `punish-duration\", `threshold-maximum\", `threshold-duration\", or `show`. Check `Skyra, help {{name}}` for more information.",
		selfModerationCommandInvalidMissingArguments:
			`{{REDCROSS}} The specified action requires an extra argument to be passed. Check `Skyra, help {{name}}` for more information.",
		selfModerationCommandInvalidSoftaction:
			`{{REDCROSS}} Value must be any of the following: `alert\", `log\", or `delete`. Check `Skyra, help {{name}}` for more information.",
		selfModerationCommandInvalidHardaction:
			`{{REDCROSS}} Value must be any of the following: `none\", `warn\", `mute\", `kick\", `softban\", or `ban`. Check `Skyra, help {{name}}` for more information.",
		selfModerationCommandEnabled: "{{GREENTICK}} Successfully enabled sub-system.",
		selfModerationCommandDisabled: "{{GREENTICK}} Successfully disabled sub-system.",
		selfModerationCommandSoftAction: "{{GREENTICK}} Successfully disabled actions.",
		selfModerationCommandSoftActionWithValue: "{{GREENTICK}} Successfully set actions to: `{{value}}`",
		selfModerationCommandHardAction: "{{GREENTICK}} Successfully set punishment: {{value}}",
		selfModerationCommandHardActionDuration: "{{GREENTICK}} Successfully removed the punishment appeal timer.",
		selfModerationCommandHardActionDurationWithValue:
			`{{GREENTICK}} Successfully set the punishment appeal timer to: {{value | duration}}",
		selfModerationCommandThresholdMaximum: "{{GREENTICK}} Successfully removed the threshold maximum, punishment will take place instantly if set.",
		selfModerationCommandThresholdMaximumWithValue: "{{GREENTICK}} Successfully set the threshold maximum to: {{value}}",
		selfModerationCommandThresholdDuration: "{{GREENTICK}} Successfully removed the threshold duration, punishments will take place instantly if set.",
		selfModerationCommandThresholdDurationWithValue:
			`{{GREENTICK}} Successfully set the threshold duration to: {{value | duration}}",
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
			`Enabled      : {{kEnabled}}",
			'Action",
			` - Alert     : {{kAlert}}",
			` - Log       : {{kLog}}",
			` - Delete    : {{kDelete}}",
			'Punishment",
			` - Type      : {{kHardAction}}",
			` - Duration  : {{hardActionDurationText}}",
			'Threshold",
			` - Maximum   : {{thresholdMaximumText}}",
			` - Duration  : {{thresholdDurationText}}`
		],
		selfModerationCommandShowDurationPermanent: "Permanent",
		selfModerationCommandShowUnset: "Unset",
		selfModerationSoftActionAlert: "Alert",
		selfModerationSoftActionLog: "Log",
		selfModerationSoftActionDelete: "Delete",
		selfModerationHardActionBan: "Ban",
		selfModerationHardActionKick: "Kick",
		selfModerationHardActionMute: "Mute",
		selfModerationHardActionSoftban: "SoftBan",
		selfModerationHardActionWarning: "Warning",
		selfModerationHardActionNone: "None",
		selfModerationEnabled: "Yes",
		selfModerationDisabled: "No",
		selfModerationMaximumTooShort: "{{REDCROSS}} The value ({{value}}) was too short, expected at least {{minimum}}.",
		selfModerationMaximumTooLong: "{{REDCROSS}} The value ({{value}}) was too long, expected maximum {{maximum}}.",
		selfModerationDurationTooShort:
			`{{REDCROSS}} The value ({{value | duration}}) was too short, expected at least {{minimum | duration}}.",
		selfModerationDurationTooLong:
			`{{REDCROSS}} The value ({{value | duration}}) was too long, expected maximum {{maximum | duration}}.",
		moderationActions: {
			addRole: "Added Role",
			mute: "Mute",
			ban: "Ban",
			kick: "Kick",
			softban: "Softban",
			vkick: "Voice Kick",
			vmute: "Voice Mute",
			restrictedReact: "Reaction Restriction",
			restrictedEmbed: "Embed Restriction",
			restrictedAttachment: "Attachment Restriction",
			restrictedVoice: "Voice Restriction",
			setNickname: "Set Nickname",
			removeRole: "Remove Role'
		},
		actionApplyReason: "[Action] Applied {{action}} | Reason: {{reason}}",
		actionApplyNoReason: "[Action] Applied {{action}}",
		actionRevokeReason: "[Action] Revoked {{action}} | Reason: {{reason}}",
		actionRevokeNoReason: "[Action] Revoked {{action}}",
		actionSetNicknameSet: "[Action] Set Nickname | Reason: {{reason}}",
		actionSetNicknameRemoved: "[Action] Removed Nickname | Reason: {{reason}}",
		actionSetNicknameNoReasonSet: "[Action] Set Nickname.",
		actionSetNicknameNoReasonRemoved: "[Action] Removed Nickname.",
		actionSoftbanNoReason: "[Action] Applying Softban.",
		actionSoftbanReason: "[Action] Applying Softban | Reason: {{reason}}",
		actionUnSoftbanNoReason: "[Action] Applied Softban.",
		actionUnSoftbanReason: "[Action] Applied Softban | Reason: {{reason}}",
		actionRequiredMember: "The user does not exist or is not in this server.",
		actionSetupMuteExists: "**Aborting mute role creation**: There is already one that exists.",
		actionSetupRestrictionExists: "**Aborting restriction role creation**: There is already one that exists.",
		actionSetupTooManyRoles: "**Aborting role creation**: There are 250 roles in this guild, you need to delete one role.",
		actionSharedRoleSetupExisting: "I could not find a configured role. Do you want to configure an existing one?",
		actionSharedRoleSetupExistingName: "Please give me the name of the role you want to use for further actions of this type.",
		actionSharedRoleSetupNew: "Do you want me to create a new role and configure it automatically?",
		actionSharedRoleSetupAsk:
			`{{LOADING}} Can I modify {{channels}} channel to apply the role {{role}} the following permission: {{permissions}}?",
		actionSharedRoleSetupAskMultipleChannels:
			`{{LOADING}} Can I modify {{channels}} channels to apply the role {{role}} the following permission: {{permissions}}?",
		actionSharedRoleSetupAskMultiplePermissions:
			`{{LOADING}} Can I modify {{channels}} channel to apply the role {{role}} the following permissions: {{permissions}}?",
		actionSharedRoleSetupAskMultipleChannelsMultiplePermissions:
			`{{LOADING}} Can I modify {{channels}} channels to apply the role {{role}} the following permissions: {{permissions}}?",
		muteNotConfigured: "The muted role must be configured for this action to happen.",
		restrictionNotConfigured: "The restriction role must be configured for this action to happen",
		muteNotInMember: "The muted role is not set in the member.",
		muteLowHierarchy: "I cannot mute a user which higher role hierarchy than me.",
		muteCannotManageRoles: "I must have **{{this.PERMISSIONS.MANAGE_ROLES}}** permissions to be able to mute.",
		muteNotExists: "The specified user is not muted.",

		resolverDateSuffix: " seconds",
		resolverPositiveAmount: "You must give me a positive number.",
		systemPoweredByWeebsh: "Powered by weeb.sh",
		prefixReminder: "The prefix in this guild is set to: `{{prefix}}`",

		unexpectedIssue: "An unexpected error popped up! Safely aborting this command...",

		commandDmNotSent: "I cannot send you a message in DMs, did you block me?",
		commandDmSent: "I have sent you the message in DMs.",
		commandRoleHigherSkyra: "The selected member has a role position that is higher than or equal to mine.",
		commandRoleHigher: "The selected member has a role position that is higher than or equal to yours.",
		commandSuccess: "Successfully executed the command.",
		commandToskyra: "Why... I thought you loved me! 💔",
		commandUserself: "Why would you do that to yourself?",

		systemParseError: "{{REDCROSS}} I failed to process the data I was given, sorry~!",
		systemHighestRole: "This role's hierarchy position is higher or equal than me, I am not able to grant it to anyone.",
		systemChannelNotPostable: "I am not allowed to send messages to this channel.",
		systemFetchbansFail: "Failed to fetch bans. Do I have the **{{this.PERMISSIONS.BAN_MEMBERS}}** permission?",
		systemLoading: [
			`{{LOADING}} Watching hamsters run...",
			`{{LOADING}} Finding people at hide-and-seek...",
			`{{LOADING}} Trying to figure out this command...",
			`{{LOADING}} Fetching data from the cloud...",
			`{{LOADING}} Calibrating lenses...",
			`{{LOADING}} Playing rock, paper, scissors...",
			`{{LOADING}} Tuning in to the right frequencies...",
			`{{LOADING}} Reticulating splines...`
		],
		systemError: "Something bad happened! Please try again, or if the issue keeps happening join the support server (hint: use `Skyra, support`)",
		systemDatabaseError: "I wasn't able get that in my database! Please try again, or if the issue keeps happening join the support server (hint: use `Skyra, support`)",
		systemDiscordAborterror: "I had a small network error when messaging Discord, please run this command again!",
		systemMessageNotFound: "I am sorry, but either you wrote the message ID incorrectly, or it got deleted.",
		systemNotenoughParameters: "I am sorry, but you did not provide enough parameters...",
		systemQueryFail: "I am sorry, but the application could not resolve your request. Are you sure you wrote the name correctly?",
		systemNoResults: "I wasn't able to find any results for that query",
		systemCannotAccessChannel: "I am sorry, but you do not have permission to see that channel.",
		systemExceededLengthOutput: "**Output**:{{output}}",
		systemExceededLengthOutputWithTypeAndTime: "**Output**:{{output}}\n**Type**:{{type}}\n{{time}}",
		systemExceededLengthOutputConsole: "Sent the result to console.",
		systemExceededLengthOutputConsoleWithTypeAndTime: "Sent the result to console.\n**Type**:{{type}}\n{{time}}",
		systemExceededLengthOutputFile: "Sent the result as a file.",
		systemExceededLengthOutputFileWithTypeAndTime: "Sent the result as a file.\n**Type**:{{type}}\n{{time}}",
		systemExceededLengthOutputHastebin: "Sent the result to hastebin: {{url}}",
		systemExceededLengthOutputHastebinWithTypeAndTime: "Sent the result to hastebin: {{url}}\n**Type**:{{type}}\n{{time}}",
		systemExceededLengthChooseOutput: "Choose one of the following options: ${this.list(output, "or')}",
		systemExternalServerError: "The external service we use could not process our message. Please try again later.",
		systemPokedexExternalResource: "External Resources",
		jumpTo: "Jump to Message ►",

		resolverInvalidChannelName: "{{name}} must be a valid channel name, id, or tag.",
		resolverInvalidRoleName: "{{name}} must be a valid role name, id, or mention.",
		resolverInvalidUsername: "{{name}} must be a valid user name, id, or mention.",
		resolverChannelNotInGuild: "I am sorry, but that command can only be ran in a server.",
		resolverChannelNotInGuildSubcommand:
			`{{REDCROSS}} I am sorry, but the subcommand `{{subcommand}}` for the command `{{command}}` can only be used in a server.",
		resolverMembernameUserLeftDuringPrompt: "User left during prompt.",

		listifyPage: "Page {{page}} / {{pageCount}} | {{results}} Total",

		moderationLogAppealed: "{{REDCROSS}} I am sorry, but the selected moderation log has expired or cannot be cannot be made temporary.",
		moderationLogExpiresIn: "\n❯ **Expires In**: {{duration | duration}}",
		moderationLogDescription:
			[
				`❯ **Type**: {{type}}",
				`❯ **User:** {{userName}}#{{userDiscriminator}} ({{userID}})",
				`❯ **Reason:** ${reason || `Please use `{{prefix}}reason {{caseID}} <reason>` to set the reason.`}{{formattedDuration}}`
			].join('\n'),
		moderationLogFooter: "Case {{caseID}}",
		moderationCaseNotExists: "{{REDCROSS}} I am sorry, but the selected moderation log case does not exist.",
		ModerationCaseNotExists_plural: "{{REDCROSS}} I am sorry, but none of the selected moderation log cases exist.",

		guildSettingsChannelsMod: "You need to configure a modlog channel. Use `Skyra, conf set channels.moderation-logs #modlogs`.",
		guildSettingsRolesRestricted:
			`{{REDCROSS}} You need to configure a role for this action, use `{{prefix}}settings set {{path}} <rolename>` to set it up.",
		guildMuteNotFound:
			'I failed to fetch the modlog that sets this user as muted. Either you did not mute this user or all the mutes are appealed.",
		guildBansEmpty: "There are no bans registered in this server.",
		guildBansNotFound: "I tried and failed to find this user from the ban list. Are you certain this user is banned?",
		channelNotReadable: "I am sorry, but I need the permissions **{{this.PERMISSIONS.VIEW_CHANNEL}}** and **{{this.PERMISSIONS.READ_MESSAGE_HISTORY}}**",

		userNotInGuild: "This user is not in this server.",
		userNotExistent: "This user does not exist. Are you sure you used a valid user ID?",

		eventsGuildMemberAdd: "User Joined",
		eventsGuildMemberAddMute: "Muted User joined",
		eventsGuildMemberAddDescription: "{{mention}} | **Joined Discord**: ${this.duration(time, 2)} ago.",
		eventsGuildMemberRemove: "User Left",
		eventsGuildMemberKicked: "User Kicked",
		eventsGuildMemberBanned: "User Banned",
		eventsGuildMemberSoftBanned: "User Softbanned",
		eventsGuildMemberRemoveDescription: "{{mention}} | **Joined Server**: Unknown.",
		eventsGuildMemberRemoveDescriptionWithJoinedAt: "{{mention}} | **Joined Server**: ${this.duration(time, 2)} ago.",
		eventsGuildMemberUpdateNickname: "Updated the nickname from **{{previous}}** to **{{current}}**",
		eventsGuildMemberAddedNickname: "Added a new nickname **{{current}}**",
		eventsGuildMemberRemovedNickname: "Removed the nickname **{{previous}}**",
		eventsNicknameUpdate: "Nickname Edited",
		eventsUsernameUpdate: "Username Edited",
		eventsNameUpdatePreviousWasSet: "**Previous**: `{{previousName}}`",
		eventsNameUpdatePreviousWasNotSet: "**Previous**: Unset",
		eventsNameUpdateNextWasSet: "**Next**: `{{nextName}}`",
		eventsNameUpdateNextWasNotSet: "**Next**: Unset",
		eventsGuildMemberNoUpdate: "No update detected",
		eventsGuildMemberAddedRoles: "**Added role**: {{addedRoles}}",
		eventsGuildMemberAddedRoles_plural: "**Added roles**: {{addedRoles}}",
		eventsGuildMemberRemovedRoles: "**Removed role**: {{removedRoles}}",
		eventsGuildMemberRemovedRoles_plural: "**Removed roles**: {{removedRoles}}",
		eventsRoleUpdate: "Roles Edited",
		eventsMessageUpdate: "Message Edited",
		eventsMessageDelete: "Message Deleted",
		eventsReaction: "Reaction Added",
		eventsCommand: "Command Used: {{command}}",

		settingsDeleteChannelsDefault: "Reseated the value for `channels.default`",
		settingsDeleteRolesInitial: "Reseated the value for `roles.initial`",
		settingsDeleteRolesMute: "Reseated the value for `roles.muted`",

		modlogTimed: "This moderation log is already timed. Expires in {{remaining | duration}}",

		guildWarnNotFound: "I failed to fetch the modlog for appealing. Either it does not exist, is not type of warning, or it is appealed.",
		guildMemberNotVoicechannel: "I cannot execute this action in a member that is not connected to a voice channel.",

		promptlistMultipleChoice:
			`There are {{count}} result. Please choose a number between 1 and {{count}}, or write **"CANCEL"** to cancel the prompt.\n{{list}}",
		promptlistMultipleChoice_plural:
			`There are {{count}} results. Please choose a number between 1 and {{count}}, or write **"CANCEL"** to cancel the prompt.\n{{list}}",
		promptlistAttemptFailed: "Invalid input. Attempt **{{attempt}}** out of **{{maxAttempts}}**\n{{list}}",
		promptlistAborted: "Successfully aborted the prompt.",

		fuzzySearchMatches:
			`I found multiple matches! **Please select a number within 0 and {{matches}}**:\n{{codeblock}}\nWrite **ABORT** if you want to exit the prompt.",
		fuzzySearchAborted: "Successfully aborted the prompt.",
		fuzzySearchInvalidNumber: "I expected you to give me a (single digit) number, got a potato.",
		fuzzySearchInvalidIndex: "That number was out of range, aborting prompt.",

		eventsErrorWtf: "{{REDCROSS}} What a Terrible Failure! I am very sorry!",
		eventsErrorString: "{{REDCROSS}} Dear {{mention}}, {{message}}",

		constUsers: "Users",
		unknownChannel: "Unknown channel",
		unknownRole: "Unknown role",
		unknownUser: "Unknown user'
	};

	public async init() {
		// noop
	}
}
