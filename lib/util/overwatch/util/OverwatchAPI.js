const { get } = require('snekfetch');

class OverwatchAPI {

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
	 * Fetches the profile from PlayOverwatch
	 * @param {SkyraClient} client The client that manages this util
	 * @param {string} battletag The battletag.
	 * @returns {Promise<*>}
	 */
	static async fetch(client, battletag) {
		battletag = OverwatchAPI.parseBattleTag(battletag);
		const profiles = await OverwatchAPI.fetchProfiles(battletag);
		if (!profiles.length) return null;

		return OverwatchAPI._fetch(client, battletag, profiles[0]);
	}

	/**
	 * Fetches the profile from PlayOverwatch
	 * @param {SkyraClient} client The client that manages this util
	 * @param {string} battletag The battletag.
	 * @param {ProfileRAW} profile The parsed profile
	 * @returns {Promise<*>}
	 */
	static async _fetch(client, battletag, profile) {
		const { body } = await get(`https://owapi.net/api/v3/u/${battletag.replace('#', '-')}/blob?platform=${profile.platform}`);
		const data = Object.assign(body.us || body.eu || body.kr || body.any || {}, {
			time: Date.now(),
			battletag,
			platform: profile.platform
		});

		await client.providers.get('json').create('overwatch', data.battletag, data);
		return data;
	}

	/**
	 * Fetch the profiles from OW's API.
	 * @param {string} name The name to get the profiles from
	 * @returns {ProfileRAW[]}
	 */
	static fetchProfiles(name) {
		return get(`https://playoverwatch.com/en-us/search/account-by-name/${encodeURIComponent(OverwatchAPI.parseBattleTag(name))}`)
			.then(result => result.body)
			.catch(() => []);
	}

	static async get(client, url) {
		const id = OverwatchAPI.parseBattleTag(url);
		const cache = await client.providers.get('json').get('overwatch', id).catch(() => null);
		if (!cache || cache.time + 86400000 < Date.now()) return OverwatchAPI.fetch(client, url);
		return cache;
	}

	static parseBattleTag(battletag) {
		return battletag.replace(/^(?:https?:\/\/playoverwatch.com\/\w+(?:-\w+)?)?\/career\/\w+\//, '');
	}

}

module.exports = OverwatchAPI;
