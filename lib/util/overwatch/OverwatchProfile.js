const { get, parseBattleTag, fetchProfiles } = require('./util/OverwatchAPI.js');

class Profile {

	/**
	 * @typedef {Object} ProfileRAW
	 * @property {('pc'|'xbl'|'psn')} platform
	 * @property {string} careerLink
	 * @property {string} platformDisplayName
	 * @property {number} level
	 * @property {string} portrait
	 * @memberof Profile
	 */

	/**
	 * @version 1.0.0-alpha
	 * @param {SkyraClient} client The client that initialized this instance
	 * @param {string} name The battletag
	 * @since 3.0.0
	 */
	constructor(client, name) {
		/**
		 * @since 3.0.0
		 * @type {SkyraClient}
		 */
		this.client = client;

		/**
		 * @since 3.0.0
		 * @type {string}
		 */
		this.name = parseBattleTag(name);

		/**
		 * @since 3.0.0
		 * @type {Map<string, ProfileRAW>}
		 */
		this.profiles = new Map();

		/**
		 * @type {GameContent}
		 */
		this.profile = null;
	}

	/**
	 * The encoded name
	 * @since 3.0.0
	 */
	get encodedName() {
		return encodeURIComponent(this.name);
	}

	/**
	 * The best profile
	 * @since 3.0.0
	 * @returns {?ProfileRAW}
	 */
	get bestProfile() {
		let best = { level: -1 };
		for (const profile of this.profiles.values())
			if (profile.level > best.level)
				best = profile;

		return best.level === -1 ? null : best;
	}

	/**
	 * The career profile URL
	 * @since 3.0.0
	 * @param {('pc'|'xbl'|'psn')} platform The platform to get the career profile from
	 * @returns {string}
	 */
	profileURL(platform) {
		return `https://playoverwatch.com/en-us/career/${platform}/${this.encodedName}`;
	}

	/**
	 * Fetch all profiles
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 */
	async fetchProfiles() {
		const results = fetchProfiles(this.name);
		if (Array.isArray(results)) this.setProfiles(results);

		return this;
	}

	/**
	 * Fetch a profile
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 */
	async fetchProfile() {
		if (!this.profile) this.profile = await get(this.client, this.name);
		return this;
	}

	/**
	 * @since 3.0.0
	 * @param {ProfileRAW} profiles The received profiles
	 * @returns {this}
	 */
	setProfiles(profiles) {
		for (const profile of profiles)
			this.profiles.set(profile.platform, profile);

		return this;
	}

}

module.exports = Profile;
