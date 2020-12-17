/* eslint-disable @typescript-eslint/no-invalid-this, @typescript-eslint/member-ordering, prettier/prettier */
export default class extends Language {
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

		default: '{{key}} has not been localized for en-US yet.',
		defaultLanguage: 'Default Language',
		settingGatewayChooseKey: 'You cannot edit a settings group, pick any of the following: {{keys}}',
		settingGatewayMissingValue: 'The value {{value}} cannot be removed from the key {{path}} because it does not exist.',
		settingGatewayDuplicateValue: 'The value {{value}} cannot be added to the key {{path}} because it was already set.',
		reactionhandlerPrompt: 'Which page would you like to jump to?',
		commandmessageMissing: 'Missing one or more required arguments after end of input.',
		commandmessageMissingRequired: '{{name}} is a required argument.',
		commandmessageMissingOptionals: 'Missing a required option: ({{possibles}})',
		commandmessageNomatch: "Your option didn't match any of the possibilities: ({{possibles}})",
		monitorCommandHandlerReprompt: `{{tag}} | **{{name}}** | You have **{{time}}** seconds to respond to this prompt with a valid argument. Type **{{cancelOptions}}** to abort this prompt.`,
		monitorCommandHandlerRepeatingReprompt: `{{tag}} | **{{name}}** is a repeating argument | You have **{{time}}** seconds to respond to this prompt with additional valid arguments. Type **{{cancelOptions}}** to cancel this prompt.`,
		monitorCommandHandlerAborted: 'Aborted',
		messagePromptTimeout: 'The prompt has timed out.',
		textPromptAbortOptions: ['abort', 'stop', 'cancel'],

		/**
		 * ################################
		 * #     COMMAND DESCRIPTIONS     #
		 * ################################
		 */

		argumentRangeInvalid: '{{name}} must be a number or a range of numbers.',
		argumentRangeMax: "{{name}} accepts a range of maximum {{maximum}} 'number'",
		argumentRangeMax_plural: "{{name}} accepts a range of maximum {{maximum}} 'numbers'",

		musicManagerFetchNoArguments: 'I need you to give me the name of a song!',
		musicManagerFetchNoMatches: "I'm sorry but I wasn't able to find the track!",
		musicManagerFetchLoadFailed: "I'm sorry but I couldn't load this song! Maybe try other song!",
		musicManagerImportQueueError:
			"{{REDCROSS}} Sorry, but I'm having issues trying to import that playlist. Are you sure it's from my own DJ deck?",
		musicManagerImportQueueNotFound: '{{REDCROSS}} I need a queue to import!',
		musicManagerTooManySongs: '{{REDCROSS}} Woah there, you are adding more songs than allowed!',
		musicManagerSetvolumeSilent: 'Woah, you can just leave the voice channel if you want silence!',
		musicManagerSetvolumeLoud: "I'll be honest, an airplane's nacelle would be less noisy than this!",
		musicManagerPlayNoSongs: 'There are no songs left in the queue!',
		musicManagerPlayPlaying: "The deck's spinning, can't you hear it?",
		musicManagerStuck: "{{LOADING}} Hold on, I got a little problem, I'll be back in: {{milliseconds, duration}}!",

		/**
		 * #################################
		 * #        NOTIFICATIONS          #
		 * #################################
		 */
		notificationsTwitchNoGameName: '*Game name not set*',
		notificationsTwitchEmbedDescription: '{{userName}} is now live!',
		notificationsTwitchEmbedDescriptionWithGame: '{{userName}} is now live - Streaming {{gameName}}!',
		notificationTwitchEmbedFooter: 'Skyra Twitch Notifications',

		/**
		 * #################################
		 * #             UTILS             #
		 * #################################
		 */

		resolverDateSuffix: ' seconds',
		resolverPositiveAmount: 'You must give me a positive number.',
		prefixReminder: 'The prefix in this guild is set to: `{{prefix}}`',

		unexpectedIssue: 'An unexpected error popped up! Safely aborting this command...',

		commandDmNotSent: 'I cannot send you a message in DMs, did you block me?',
		commandDmSent: 'I have sent you the message in DMs.',
		commandRoleHigherSkyra: 'The selected member has a role position that is higher than or equal to mine.',
		commandRoleHigher: 'The selected member has a role position that is higher than or equal to yours.',
		commandSuccess: 'Successfully executed the command.',
		commandToskyra: 'Why... I thought you loved me! 💔',
		commandUserself: 'Why would you do that to yourself?',
		jumpTo: 'Jump to Message ►',

		listifyPage: 'Page {{page}} / {{pageCount}} | {{results}} Total',

		guildSettingsChannelsMod: 'You need to configure a modlog channel. Use `Skyra, conf set channels.moderation-logs #modlogs`.',
		guildSettingsRolesRestricted:
			'{{REDCROSS}} You need to configure a role for this action, use `{{prefix}}settings set {{path}} <rolename>` to set it up.',
		guildMuteNotFound:
			'I failed to fetch the modlog that sets this user as muted. Either you did not mute this user or all the mutes are appealed.',
		guildBansEmpty: 'There are no bans registered in this server.',
		guildBansNotFound: 'I tried and failed to find this user from the ban list. Are you certain this user is banned?',
		channelNotReadable: 'I am sorry, but I need the permissions **{{VIEW_CHANNEL, permissions}}** and **{{READ_MESSAGE_HISTORY, permissions}}**',

		userNotInGuild: 'This user is not in this server.',
		userNotExistent: 'This user does not exist. Are you sure you used a valid user ID?',

		modlogTimed: 'This moderation log is already timed. Expires in {{remaining, duration}}',

		guildWarnNotFound: 'I failed to fetch the modlog for appealing. Either it does not exist, is not type of warning, or it is appealed.',
		guildMemberNotVoicechannel: 'I cannot execute this action in a member that is not connected to a voice channel.',

		promptlistMultipleChoice:
			'There are {{count}} result. Please choose a number between 1 and {{count}}, or write **`CANCEL`** to cancel the prompt.\n{{list}}',
		promptlistMultipleChoice_plural:
			'There are {{count}} results. Please choose a number between 1 and {{count}}, or write **`CANCEL`** to cancel the prompt.\n{{list}}',
		promptlistAttemptFailed: 'Invalid input. Attempt **{{attempt}}** out of **{{maxAttempts}}**\n{{list}}',
		promptlistAborted: 'Successfully aborted the prompt.',

		fuzzySearchMatches:
			'I found multiple matches! **Please select a number within 0 and {{matches}}**:\n{{codeblock}}\nWrite **ABORT** if you want to exit the prompt.',
		fuzzySearchAborted: 'Successfully aborted the prompt.',
		fuzzySearchInvalidNumber: 'I expected you to give me a (single digit) number, got a potato.',
		fuzzySearchInvalidIndex: 'That number was out of range, aborting prompt.',

		eventsErrorWtf: '{{REDCROSS}} What a Terrible Failure! I am very sorry!',
		eventsErrorString: '{{REDCROSS}} Dear {{mention}}, {{message}}',

		constUsers: 'Users',
		unknownChannel: 'Unknown channel',
		unknownRole: 'Unknown role',
		unknownUser: 'Unknown user'
	};

	public async init() {
		// noop
	}
}
