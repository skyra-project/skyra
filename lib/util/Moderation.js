const { Guild } = require('discord.js');
const TABLENAME = 'moderation';

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

		/**
		 * The temporary cache
		 * @since 3.0.0
		 * @type {Map<string, string>}
		 */
		this._temp = new Map();
	}

	get r() {
		return this.client.providers.get('rethinkdb').db;
	}

	/**
	 * Add a new case to the list
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild that manages this instance
	 * @param {ModerationCaseData} data The case data to add
	 * @returns {Promise<boolean>}
	 */
	async addCase(guild, data) {
		await this.r.table(TABLENAME).insert({ [Moderation.schemaKeys.GUILD]: this._checkGuild(guild), ...data });
		return true;
	}

	/**
	 * Update a case
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild that manages this instance
	 * @param {ModerationCaseData} [data={}] The case data to update
	 * @returns {Promise<boolean>}
	 */
	async updateCase(guild, data) {
		await this.r.table(TABLENAME)
			.getAll([guild, data[Moderation.schemaKeys.CASE]], { index: 'guild_case' })
			.nth(0)
			.update(data);

		return true;
	}

	/**
	 * Appeal a case
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild that manages this instance
	 * @param {ModerationCaseData} [data={}] The case options
	 * @returns {Promise<Object>}
	 */
	async appealCase(guild, data = {}) {
		const moderationCase = await this.getLastCase(guild, data);
		if (!moderationCase) throw new Error(Moderation.errors.CASE_NOT_EXISTS);

		if (moderationCase.appeal) throw new Error(Moderation.errors.CASE_APPEALED);
		await this.r.table(TABLENAME).get(moderationCase.id).update({
			[Moderation.schemaKeys.APPEAL]: true,
			[Moderation.schemaKeys.TIMED]: null
		});

		return moderationCase;
	}

	/**
	 * Get the cases given a filter
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild that manages this instance
	 * @param {ModerationCaseData} data The data and parameters to filter
	 * @returns {Promise<Array<Object>>}
	 */
	async getCases(guild, data = {}) {
		const rows = await this.r.table(TABLENAME)
			.filter({ [Moderation.schemaKeys.GUILD]: this._checkGuild(guild), ...data });
		return Array.isArray(rows) ? rows : [];
	}

	/**
	 * Get the last case given a filter
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild that manages this instance
	 * @param {ModerationCaseData} [data={}] The case options
	 * @returns {Promise<Object>}
	 */
	async getLastCase(guild, data = {}) {
		const row = await this.r.table(TABLENAME)
			.filter({ [Moderation.schemaKeys.GUILD]: this._checkGuild(guild), ...data })
			.orderBy(this.r.desc(Moderation.schemaKeys.CASE))
			.nth(0)
			.default(null);

		return typeof row === 'object' ? row : null;
	}

	/**
	 * Get the amount of cases
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild that manages this instance
	 * @param {string} type The case options
	 * @returns {Promise<boolean>}
	 */
	async getAmountCases(guild, type) {
		if (guild && typeof guild !== 'string') guild = this._checkGuild(guild);

		const count = await this.r.table(TABLENAME).filter(type
			? { [Moderation.schemaKeys.GUILD]: guild, [Moderation.schemaKeys.TYPE]: type }
			: { [Moderation.schemaKeys.GUILD]: guild }).count();
		return typeof count === 'number' ? count : 0;
	}

	/**
	 * Check if the parameter guild passed is valid
	 * @param {(KlasaGuild|string)} guild The guild to validate
	 * @returns {string}
	 * @private
	 */
	_checkGuild(guild) {
		if (typeof guild === 'string') return guild;
		if (guild instanceof Guild) return guild.id;
		throw new TypeError(`Expected the parameter 'guild' to be an instance of Guild or a string. Got: ${typeof guild}`);
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
