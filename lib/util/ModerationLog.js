const { Timestamp, Duration } = require('klasa');
const { typeKeys, schemaKeys } = require('./Moderation');

const APPEAL_TYPES = new Set([
	typeKeys.UN_BAN,
	typeKeys.UN_MUTE,
	typeKeys.UN_VOICE_MUTE,
	typeKeys.UN_WARN
]);

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
	 * @typedef {Object} ModerationLogCacheEntry
	 * @property {ModerationTypesEnum} type
	 * @property {NodeJS.Timer} timeout
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
			.setColor(ModerationLog.TYPES[this.accurateType].color)
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
		return (this.duration ? [
			`❯ **Type**: ${ModerationLog.TYPES[this.accurateType].title}`,
			`❯ **User:** ${this.user.tag} (${this.user.id})`,
			`❯ **Reason:** ${this.reason || `Please use \`${this.guild.configs.prefix}reason ${this.caseNumber} to claim.\``}`,
			`❯ **Appeal In**: ${this.client.languages.default.duration(this.duration)}`
		] : [
			`❯ **Type**: ${ModerationLog.TYPES[this.accurateType].title}`,
			`❯ **User:** ${this.user.tag} (${this.user.id})`,
			`❯ **Reason:** ${this.reason || `Please use \`${this.guild.configs.prefix}reason ${this.caseNumber} to claim.\``}`
		]).join('\n');
	}

	get accurateType() {
		if (!this.duration) return this.type;
		switch (this.type) {
			case 'ban': return 'tban';
			case 'mute': return 'tmute';
			case 'vmute': return 'tvmute';
			default: return this.type;
		}
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
			case 'tban':
			case 'ban': return 'unban';
			case 'tmute':
			case 'mute': return 'unmute';
			case 'tvmute':
			case 'vmute': return 'vunmute';
			default: return null;
		}
	}

	get appeal() {
		return APPEAL_TYPES.has(this.type);
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
		if (typeof time === 'string') this.duration = new Duration(time.trim()).offset;
		if (!this.duration) this.duration = null;
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

	/**
	 * Set a ModerationLog as anonymous. Use this only for bans, unbans and softbans
	 * @since 3.0.0
	 * @returns {this}
	 */
	avoidAnonymous() {
		// Check events.
		// Ideally, only bans, unbans and softbans should avoid anonymous as the AutoModeration
		// system detects them.
		switch (this.type) {
			case typeKeys.BAN:
				// If this case is a ban but the automattic logger for bans is deactivated, no need to deactivate it.
				if (!this.guild.configs.events.banAdd) return this;
				break;
			case typeKeys.UN_BAN:
				// If this case is an unban but the automattic logger for unbans is deactivated, no need to deactivate it.
				if (!this.guild.configs.events.banRemove) return this;
				break;
			case typeKeys.SOFT_BAN:
				// If this case is a softban but the automattic logger for bans and unbans are deactivated, no need to deactivate it.
				if (!this.guild.configs.events.banAdd && !this.guild.configs.events.banRemove) return this;
				break;
			default:
				return this;
		}

		const { user } = this;
		ModerationLog.cache.set(user, {
			type: this.type,
			timeout: setTimeout(() => ModerationLog.cache.delete(user), 10000)
		});

		return this;
	}

	async send() {
		if (!this.moderator) {
			const cached = ModerationLog.cache.get(this.user);
			if (cached && !this._shouldSend(cached)) return null;
		}

		await this._fetchCaseNumber();
		await this.client.moderation.addCase(this.guild.id, this.toJSON());

		const channel = this.channel;
		if (channel) channel.send({ embed: this.embed }).catch(err => this.client.emit('error', err));

		if (this.duration && this.appealType) {
			await this.client.schedule.create(this.appealType, this.duration + Date.now(), {
				catchUp: true,
				data: {
					[schemaKeys.USER]: this.user.id,
					[schemaKeys.GUILD]: this.guild.id,
					[schemaKeys.DURATION]: this.duration,
					[schemaKeys.CASE]: this.caseNumber
				}
			});
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
			[schemaKeys.GUILD]: this.guild.id,
			[schemaKeys.MODERATOR]: this.moderator ? this.moderator.id : null,
			[schemaKeys.USER]: this.user ? this.user.id : null,
			[schemaKeys.TYPE]: this.type,
			[schemaKeys.REASON]: this.reason,
			[schemaKeys.CASE]: this.caseNumber,
			[schemaKeys.TIMED]: Boolean(this.duration),
			[schemaKeys.DURATION]: this.duration,
			[schemaKeys.EXTRA_DATA]: this.extraData,
			[schemaKeys.APPEAL]: this.appeal
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
	 * Check whether the ModerationLog must be sent
	 * @since 3.0.0
	 * @param {ModerationLogCacheEntry} data The entry
	 * @returns {boolean}
	 * @private
	 */
	_shouldSend(data) {
		if (data.type === 'softban') {
			if (this.type === 'unban') {
				ModerationLog.cache.delete(this.user);
				clearTimeout(data.timeout);
			}
			if (this.type !== 'softban') return false;
		} else if (data.type === this.type) {
			ModerationLog.cache.delete(this.user);
			clearTimeout(data.timeout);
			return false;
		}

		return true;
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
		this.reason = this.reason.slice(0, match.index).trim();

		return this;
	}

	static create(guild, log) {
		return new ModerationLog(guild)
			.setCaseNumber(log[schemaKeys.CASE])
			.setModerator(log[schemaKeys.MODERATOR])
			.setUser(log[schemaKeys.USER])
			.setReason(log[schemaKeys.REASON])
			.setDuration(log[schemaKeys.DURATION])
			.setExtraData(log[schemaKeys.EXTRA_DATA]);
	}

}

/**
 * @since 3.0.0
 * @type {Map<KlasaUser, ModerationLogCacheEntry>}
 * @static
 */
ModerationLog.cache = new Map();

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
	[typeKeys.BAN]: { color: 0xD50000, title: 'Ban' },
	[typeKeys.KICK]: { color: 0xF57F17, title: 'Kick' },
	[typeKeys.MUTE]: { color: 0xF9A825, title: 'Mute' },
	[typeKeys.PRUNE]: { color: 0xB2FF59, title: 'Message Prune' },
	[typeKeys.SOFT_BAN]: { color: 0xFF1744, title: 'Softban' },
	[typeKeys.TEMPORARY_BAN]: { color: 0xC51162, title: 'Temporary Ban' },
	[typeKeys.TEMPORARY_MUTE]: { color: 0xF50057, title: 'Temporary Mute' },
	[typeKeys.TEMPORARY_VOICE_MUTE]: { color: 0xFF4081, title: 'Temporary Voice Mute' },
	[typeKeys.UN_BAN]: { color: 0x304FFE, title: 'Unban' },
	[typeKeys.UN_MUTE]: { color: 0x448AFF, title: 'Unmute' },
	[typeKeys.UN_VOICE_MUTE]: { color: 0xBBDEFB, title: 'Voice Unmute' },
	[typeKeys.UN_WARN]: { color: 0xFFF494, title: 'Unwarn' },
	[typeKeys.VOICE_KICK]: { color: 0xFFBB2D, title: 'Voice Kick' },
	[typeKeys.VOICE_MUTE]: { color: 0xFBC02D, title: 'Voice Mute' },
	[typeKeys.WARN]: { color: 0xFFD600, title: 'Warn' }
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
