const { Guild } = require('discord.js');

/**
 * The Moderation singleton class in charge of the interaction with
 * the database for modlog storage
 * @since 1.8.0
 * @version 4.0.0
 */
class Moderation {

	/**
	 * @typedef  {Object} ModerationCaseData
	 * @property {string} guildID
	 * @property {string} [moderatorID]
	 * @property {string} userID
	 * @property {string} type
	 * @property {string} [reason]
	 * @property {number} caseID
	 * @property {number} [duration]
	 * @property {boolean} [timed]
	 * @property {boolean} [appeal]
	 * @property {*} [extraData]
	 */

	/**
	 * @typedef  {Object} ModerationCaseOptions
	 * @property {string} [type]
	 * @property {number} [number]
	 */

	/**
	 * Create a new Moderation singleton instance
	 * @since 3.0.0
	 * @param {Skyra} client The Client that initialized this instance
	 */
	constructor(client) {
		/**
		 * The Client that initialized this instance
		 * @since 3.0.0
		 * @type {Skyra}
		 */
		this.client = client;
	}

	/**
	 * Get the PostgreSQL provider
	 * @since 3.0.0
	 * @readonly
	 */
	get provider() {
		return this.client.providers.get('postgresql');
	}

	/**
	 * Add a new case to the list
	 * @since 3.0.0
	 * @param {ModerationCaseData} data The case data to add
	 * @returns {Promise<boolean>}
	 */
	async addCase(data) {
		if (data.guild && typeof data.guild !== 'string') data.guild = this._checkGuild(data.guild);
		const keys = [];
		const values = [];
		const vars = [];

		for (const key of Moderation._caseKeys)
			this._pushParam(data, key, keys, values, vars);

		await this.provider.run(`INSERT INTO "moderation" (${keys.join(', ')}) VALUES (${vars.join(', ')});`, values);

		// Automatic appeal
		const appealType = this.getAppealType(data.type);
		if (appealType) await this.appealCase(data.guild, { type: appealType });

		return true;
	}

	/**
	 * Appeal a case
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild that manages this instance
	 * @param {ModerationCaseOptions} [caseOptions={}] The case options
	 * @returns {Promise<boolean>}
	 */
	async appealCase(guild, { type, number } = {}) {
		if (!Moderation.pardonTypes.includes(type)) throw new Error(Moderation.errors.CASE_TYPE_NOT_APPEAL);

		const moderationCase = await this.getLastCase(guild, { type, number });
		if (!moderationCase) throw new Error(Moderation.errors.CASE_NOT_EXISTS);

		if (moderationCase.appeal) throw new Error(Moderation.errors.CASE_APPEALED);
		await this.provider.run(`
			UPDATE "moderation"
			SET "${Moderation.schemaKeys.APPEAL}" = true
			WHERE ${Moderation.schemaKeys.GUILD} = "${guild}" AND "${Moderation.schemaKeys.CASE}" = ${number};`);

		return true;
	}

	/**
	 * Get the cases given a filter
	 * @since 3.0.0
	 * @param {ModerationCaseData} data The data and parameters to filter
	 * @returns {Promise<Array<Object>>}
	 */
	async getCases(data) {
		if (data.guild && typeof data.guild !== 'string') data.guild = this._checkGuild(data.guild);
		const keys = [];
		let i = 1;
		const values = [];

		for (const key of Moderation._caseKeys) {
			if (!(key in data)) continue;
			keys.push(`"${key}" = $${i++}`);
			values.push(data[key]);
		}

		const rows = await this.provider.runAll(`SELECT * FROM "moderation" WHERE ${keys};`, values);

		return Array.isArray(rows) ? rows : [];
	}

	/**
	 * Get the last case given a filter
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild that manages this instance
	 * @param {ModerationCaseOptions} [caseOptions={}] The case options
	 * @returns {Promise<Object>}
	 */
	async getLastCase(guild, { type, number } = {}) {
		const params = this._buildParams(this._checkGuild(guild), type, number);
		const row = await this.provider.runOne(`SELECT * FROM "moderation" WHERE ${params} ORDER BY "${Moderation.schemaKeys.CASE}" DESC LIMIT 1`);

		return typeof row === 'object' ? row : null;
	}

	/**
	 * Get the amount of cases
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild that manages this instance
	 * @param {ModerationCaseOptions} [caseOptions={}] The case options
	 * @returns {Promise<boolean>}
	 */
	async getAmountCases(guild, { type, number } = {}) {
		const params = this._buildParams(this._checkGuild(guild), type, number);
		const count = await this.provider.runOne(`SELECT COUNT(*) FROM "moderation" WHERE ${params};`)
			.then(result => parseInt(result.count));

		return typeof count === 'number' ? count : 0;
	}

	/**
	 * Get the appeal type
	 * @since 3.0.0
	 * @param {string} type The type to check
	 * @returns {string}
	 */
	getAppealType(type) {
		const index = Moderation.appealTypes.indexOf(type);
		if (index === -1) return null;
		return Moderation.pardonTypes[index];
	}

	/**
	 * Push the params to the SQL filter
	 * @since 3.0.0
	 * @param {ModerationCaseData} object The object to check the data from
	 * @param {string} key The key to check for
	 * @param {string[]} keys The keys to set
	 * @param {any[]} values The values to set
	 * @param {string[]} vars The variables for SQL sanitization
	 * @private
	 */
	_pushParam(object, key, keys, values, vars) {
		if (!(key in object)) return;
		keys.push(`"${key}"`);
		values.push(object[key]);
		vars.push(`$${vars.length + 1}`);
	}

	/**
	 * Build the parameters for the basic filter
	 * @since 3.0.0
	 * @param {string} guild The guild ID that manages the modlog
	 * @param {string} [type] The type to filter
	 * @param {number} [number] The number to filter
	 * @returns {string}
	 * @private
	 */
	_buildParams(guild, type, number) {
		const filter = [`"${Moderation.schemaKeys.GUILD}" = "${guild}"`];
		if (typeof type === 'string') filter.push(`"${Moderation.schemaKeys.TYPE}" = "${type}"`);
		if (typeof number === 'number') filter.push(`"${Moderation.schemaKeys.CASE}" = ${number}`);

		return filter.join(' AND ');
	}

	/**
	 * Check if the parameter guild passed is valid
	 * @param {(KlasaGuild|string)} guild The guild to validate
	 * @returns {string}
	 * @private
	 */
	_checkGuild(guild) {
		if (!guild)
			throw new TypeError('The parameter \'guild\' must be specified.');
		if (guild instanceof Guild)
			guild = guild.id;
		if (typeof guild !== 'string')
			throw new TypeError(`Expected the parameter 'guild' to be an instance of Guild or a string. Got: ${typeof guild}`);

		return guild;
	}

}

/**
 * @since 3.0.0
 * @enum {string}
 * @readonly
 * @static
 */
Moderation.typeKeys = Object.freeze({
	BAN: 'ban',
	SOFT_BAN: 'softban',
	KICK: 'kick',
	VOICE_KICK: 'vkick',
	MUTE: 'mute',
	VOICE_MUTE: 'vmute',
	WARN: 'warn',
	PRUNE: 'prune',
	TEMPORARY_BAN: 'tban',
	TEMPORARY_MUTE: 'tmute',
	TEMPORARY_VOICE_MUTE: 'tvmute',
	UN_BAN: 'unban',
	UN_MUTE: 'unmute',
	UN_VOICE_MUTE: 'unvmute',
	UN_WARN: 'unwarn'
});

/**
 * @since 3.0.0
 * @type {ReadonlyArray<string>}
 * @readonly
 * @static
 * @memberof ModerationLog
 */
Moderation.appealTypes = Object.freeze([
	Moderation.typeKeys.UN_BAN,
	Moderation.typeKeys.UN_MUTE,
	Moderation.typeKeys.UN_VOICE_MUTE,
	Moderation.typeKeys.UN_WARN
]);

/**
 * @since 3.0.0
 * @type {ReadonlyArray<string>}
 * @readonly
 * @static
 * @memberof ModerationLog
 */
Moderation.pardonTypes = Object.freeze([
	Moderation.typeKeys.BAN,
	Moderation.typeKeys.MUTE,
	Moderation.typeKeys.VOICE_MUTE,
	Moderation.typeKeys.WARN
]);

/**
 * @since 3.0.0
 * @enum {string}
 * @readonly
 * @static
 * @memberof ModerationLog
 */
Moderation.schemaKeys = Object.freeze({
	GUILD: 'guildID',
	MODERATOR: 'moderatorID',
	USER: 'userID',
	TYPE: 'type',
	REASON: 'reason',
	CASE: 'caseID',
	DURATION: 'duration',
	TIMED: 'timed',
	APPEAL: 'appeal',
	EXTRA_DATA: 'extraData'
});

/**
 * @since 3.0.0
 * @type {ReadonlyArray<string>}
 * @readonly
 * @static
 * @memberof ModerationLog
 */
Moderation._caseKeys = Object.freeze(
	Object.values(Moderation.schemaKeys)
);

/**
 * @since 3.0.0
 * @enum {string}
 * @readonly
 * @static
 * @memberof ModerationLog
 */
Moderation.errors = Object.freeze({
	CASE_NOT_EXISTS: 'CASE_NOT_EXISTS',
	CASE_APPEALED: 'CASE_APPEALED',
	CASE_TYPE_NOT_APPEAL: 'CASE_TYPE_NOT_APPEAL'
});

module.exports = Moderation;
