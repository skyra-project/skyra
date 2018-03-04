const { Timestamp } = require('klasa');
const Moderation = require('./Moderation');
const TimeParser = require('./TimeParser');

/**
 * The ModerationLog class that manages the modlogs
 * @since 2.0.0
 * @version 2.0.0
 */
class ModerationLog {

	/**
	 * @typedef  {Object} ModerationJSON
	 * @property {KlasaUser} [moderator]
	 * @property {KlasaUser} [user]
	 * @property {ModerationTypesEnum} [type]
	 * @property {string} [reason]
	 * @property {number} [case]
	 * @property {number} [duration]
	 * @property {boolean} timed
	 * @property {*} [extraData]
	 * @memberof ModerationLog
	 */

	/**
	 * @typedef {('ban'|'kick'|'mute'|'prune'|'softban'|'tban'|'tmute'|'tvmute'|'unban'|'unmute'|'unwarn'|'unvmute'|'vkick'|'vmute'|'warn')} ModerationTypesEnum
	 * @memberof ModerationLog
	 */

	/**
	 * Create a new ModerationLog instance
	 * @since 2.0.0
	 * @param {KlasaGuild} guild The guild that manages this
	 */
	constructor(guild) {
		/**
		 * The Client that initialized this instance
		 * @since 2.0.0
		 * @type {Skyra}
		 */
		this.client = guild.client;

		/**
		 * The Guild where this ModerationLog is managed at
		 * @since 2.0.0
		 * @type {KlasaGuild}
		 */
		this.guild = guild;

		/**
		 * The Moderator of the ModLog, if set
		 * @since 2.0.0
		 * @type {?KlasaUser}
		 */
		this.moderator = null;

		/**
		 * The User of the ModLog, if set
		 * @since 2.0.0
		 * @type {?KlasaUser}
		 */
		this.user = null;

		/**
		 * The type of this moderation log
		 * @since 2.0.0
		 * @type {?ModerationTypesEnum}
		 */
		this.type = null;

		/**
		 * The reason for this moderation log
		 * @since 2.0.0
		 * @type {?string}
		 */
		this.reason = null;

		/**
		 * The duration of this moderation log, only applicable for bans, mutes and voicemutes
		 * @since 3.0.0
		 * @type {?number}
		 */
		this.duration = null;

		/**
		 * The case number of this moderation log
		 * @since 3.0.0
		 * @type {?number}
		 */
		this.caseNumber = null;

		/**
		 * The extra metadata
		 * @since 2.0.0
		 * @type {?any}
		 */
		this.extraData = null;
	}

	/**
	 * Gets the embed for this ModerationLog instance
	 * @since 3.0.0
	 * @readonly
	 * @returns {MessageEmbed}
	 */
	get embed() {
		const moderator = this.moderator || this.client.user;
		return new this.client.methods.Embed()
			.setColor(ModerationLog.TYPES[this.type].color)
			.setAuthor(moderator.tag, moderator.displayAvatarURL({ size: 128 }))
			.setDescription(this.description)
			.setFooter(`Case ${this.caseNumber}`, this.client.user.displayAvatarURL({ size: 128 }))
			.setTimestamp();
	}

	/**
	 * Gets the description for this ModerationLog instance
	 * @since 3.0.0
	 * @readonly
	 * @returns {string}
	 */
	get description() {
		return [
			`❯ **Action:** ${ModerationLog.TYPES[this.type].title}`,
			`❯ **User:** ${this.user.tag} (${this.user.id})`,
			`❯ **Reason:** ${this.reason || `Please use \`${this.guild.configs.master.prefix}reason ${this.caseNumber} to claim.\``}`
		].join('\n');
	}

	/**
	 * Gets the modlog channel for this guild
	 * @since 3.0.0
	 * @readonly
	 * @returns {?TextChannel}
	 */
	get channel() {
		return this.guild.configs.channels.modlog ? this.guild.channels.get(this.guild.configs.channels.modlog) : null;
	}

	/**
	 * Get the opposite/appeal type
	 * @param {ModerationTypesEnum} type The type to evaluate
	 * @returns {('unban'|'unmute'|'vunmute')}
	 */
	get appealType() {
		switch (this.type) {
			case 'tban': return 'unban';
			case 'tmute': return 'unmute';
			case 'tvmute': return 'vunmute';
			default: return null;
		}
	}

	/**
	 * Sets the case number for this instance
	 * @since 3.0.0
	 * @param {number} value The case number to set
	 * @returns {this}
	 */
	setCaseNumber(value) {
		this.caseNumber = value;
		return this;
	}

	/**
	 * Sets the moderator for this instance
	 * @since 2.0.0
	 * @param {KlasaUser} value The moderator to set
	 * @returns {this}
	 */
	setModerator(value) {
		this.moderator = value;
		return this;
	}

	/**
	 * Sets the user for this instance
	 * @since 2.0.0
	 * @param {KlasaUser} value The user to set
	 * @returns {this}
	 */
	setUser(value) {
		this.user = value;
		return this;
	}

	/**
	 * Sets the moderation type for this instance
	 * @since 2.0.0
	 * @param {ModerationTypesEnum} value The moderation type to set
	 * @returns {this}
	 */
	setType(value) {
		if (!(value in ModerationLog.TYPES))
			throw new TypeError(`${this} | The type ${value} is not valid.`);

		this.type = value;
		return this;
	}

	/**
	 * Sets the reason for this instance
	 * @since 2.0.0
	 * @param {(string|string[])} reason The reason to set
	 * @returns {this}
	 */
	setReason(reason) {
		if (!reason) return this;
		if (Array.isArray(reason)) reason = reason.join(' ');
		this.reason = reason.length > 0 ? reason : null;

		if (['ban', 'mute', 'vmute'].includes(this.type)) return this._parseReason();
		return this;
	}

	/**
	 * Set the duration value for this instance
	 * @since 2.0.0
	 * @param {(string|number)} time The time to set or parse
	 * @returns {this}
	 */
	setDuration(time) {
		if (typeof time === 'number') this.duration = time;
		if (typeof time === 'string') this.duration = new TimeParser(time.trim()).duration;
		return this;
	}

	/**
	 * Set the extra metadata for this instance
	 * @since 2.0.0
	 * @param {*} data The extra metadata to add
	 * @returns {this}
	 */
	setExtraData(data) {
		this.extraData = data;
		return this;
	}

	async send() {
		if (!this.moderator) {
			if (this.user.action === 'softban') {
				if (this.type === 'unban') delete this.user.action;
				if (this.type !== 'softban') return null;
			} else if (this.user.action === this.type) {
				delete this.user.action;
				return null;
			}
		}

		await this._fetchCaseNumber();
		await this.client.moderation.addCase(this.guild.id, this.toJSON());

		const channel = this.channel;
		if (channel) channel.send({ embed: this.embed }).catch(err => this.client.emit('error', err));


		if (this.duration !== null && this.appealType) {
			await this.client.schedule.create(this.appealType, this.duration + Date.now(), {
				catchUp: true,
				data: {
					[Moderation.schemaKeys.USER]: this.user.id,
					[Moderation.schemaKeys.GUILD]: this.guild.id,
					[Moderation.schemaKeys.DURATION]: this.duration,
					[Moderation.schemaKeys.CASE]: this.caseNumber
				} });
		}

		return this;
	}

	/**
	 * Get the JSON-storable object for this instance
	 * @since 3.0.0
	 * @returns {ModerationJSON}
	 */
	toJSON() {
		return {
			[Moderation.schemaKeys.GUILD]: this.guild.id,
			[Moderation.schemaKeys.MODERATOR]: this.moderator ? this.moderator.id : null,
			[Moderation.schemaKeys.USER]: this.user ? this.user.id : null,
			[Moderation.schemaKeys.TYPE]: this.type,
			[Moderation.schemaKeys.REASON]: this.reason,
			[Moderation.schemaKeys.CASE]: this.caseNumber,
			[Moderation.schemaKeys.TIMED]: Boolean(this.duration),
			[Moderation.schemaKeys.DURATION]: this.duration,
			[Moderation.schemaKeys.EXTRA_DATA]: this.extraData
		};
	}

	/**
	 * Get a friendlier string for this.toString()
	 * @since 3.0.0
	 * @returns {string}
	 */
	toString() {
		return `ModerationLog(${this.guild.name}::${this.caseNumber})`;
	}

	/**
	 * Fetches the case number
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 * @private
	 */
	async _fetchCaseNumber() {
		return this.client.moderation.getAmountCases(this.guild)
			.then(number => this.setCaseNumber(number));
	}

	/**
	 * Parses the reason to extract the time
	 * @since 3.0.0
	 * @returns {this}
	 * @private
	 */
	_parseReason() {
		if (this.reason === null
			|| !ModerationLog.regexParse.test(this.reason)) return this;

		const match = ModerationLog.regexParse.exec(this.reason);
		this.setDuration(match[1]);
		this.reason = `${this.reason.slice(0, match.index).trim()}\n**AUTO**: This action will get reversed in: ${this.client.languages.default.duration(this.duration)}`;

		switch (this.type) {
			case Moderation.typeKeys.BAN: return this.setType(Moderation.typeKeys.TEMPORARY_BAN);
			case Moderation.typeKeys.MUTE: return this.setType(Moderation.typeKeys.TEMPORARY_MUTE);
			case Moderation.typeKeys.VOICE_MUTE: return this.setType(Moderation.typeKeys.TEMPORARY_VOICE_MUTE);
			default: return this;
		}
	}

}

/**
 * @typedef  {Object} ModerationTypes
 * @property {ModerationTypesValue} ban
 * @property {ModerationTypesValue} kick
 * @property {ModerationTypesValue} mute
 * @property {ModerationTypesValue} prune
 * @property {ModerationTypesValue} softban
 * @property {ModerationTypesValue} tban
 * @property {ModerationTypesValue} tmute
 * @property {ModerationTypesValue} tvmute
 * @property {ModerationTypesValue} unban
 * @property {ModerationTypesValue} unmute
 * @property {ModerationTypesValue} unvmute
 * @property {ModerationTypesValue} unwarn
 * @property {ModerationTypesValue} vkick
 * @property {ModerationTypesValue} vmute
 * @property {ModerationTypesValue} warn
 * @memberof ModerationLog
 */

/**
 * @typedef  {Object} ModerationTypesValue
 * @property {number} color
 * @property {string} title
 * @memberof ModerationLog
 */

/**
 * The available types for this ModerationLog
 * @type {ModerationTypes}
 * @readonly
 * @static
 * @memberof ModerationLog
 */
ModerationLog.TYPES = Object.freeze({
	[Moderation.typeKeys.BAN]: { color: 0xD50000, title: 'Ban' },
	[Moderation.typeKeys.KICK]: { color: 0xF57F17, title: 'Kick' },
	[Moderation.typeKeys.MUTE]: { color: 0xF9A825, title: 'Mute' },
	[Moderation.typeKeys.PRUNE]: { color: 0xB2FF59, title: 'Message Prune' },
	[Moderation.typeKeys.SOFT_BAN]: { color: 0xFF1744, title: 'Softban' },
	[Moderation.typeKeys.TEMPORARY_BAN]: { color: 0xC51162, title: 'Temporary Ban' },
	[Moderation.typeKeys.TEMPORARY_MUTE]: { color: 0xF50057, title: 'Temporary Mute' },
	[Moderation.typeKeys.TEMPORARY_VOICE_MUTE]: { color: 0xFF4081, title: 'Temporary Voice Mute' },
	[Moderation.typeKeys.UN_BAN]: { color: 0x304FFE, title: 'Unban' },
	[Moderation.typeKeys.UN_MUTE]: { color: 0x448AFF, title: 'Unmute' },
	[Moderation.typeKeys.UN_VOICE_MUTE]: { color: 0xBBDEFB, title: 'Voice Unmute' },
	[Moderation.typeKeys.UN_WARN]: { color: 0xFFF494, title: 'Unwarn' },
	[Moderation.typeKeys.VOICE_KICK]: { color: 0xFFBB2D, title: 'Voice Kick' },
	[Moderation.typeKeys.VOICE_MUTE]: { color: 0xFBC02D, title: 'Voice Mute' },
	[Moderation.typeKeys.WARN]: { color: 0xFFD600, title: 'Warn' }
});

/**
 * The Timestamp parser that beautifies the time
 * @type {Timestamp}
 * @static
 * @memberof ModerationLog
 */
ModerationLog.timestamp = new Timestamp('hh:mm:ss');

/**
 * The RegExp in charge to beautify the input for timed moderation logs
 * @type {RegExp}
 * @static
 * @memberof ModerationLog
 */
ModerationLog.regexParse = /,? *(?:for|time:?) ((?: ?(?:and|,)? ?\d{1,4} ?\w+)+)\.?$/i;

module.exports = ModerationLog;
