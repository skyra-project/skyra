const { Command, MessageEmbed, overwatch: { OverwatchProfileStore, OverwatchAPI }, klasaUtil: { toTitleCase } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: false,
			runIn: ['text', 'dm', 'group'],
			cooldown: 10,
			aliases: ['ow'],
			description: 'Check stats from somebody in Overwatch',
			usage: '<battletag:battletag> [qp|quickplay|comp|competitive] [achievements|heroes|stats] [filter:filter]',
			usageDelim: ' ',
			extendedHelp: 'No extended help available.'
		});

		this.createCustomResolver('battletag', async (arg, possible, msg) => {
			arg = OverwatchAPI.parseBattleTag(arg);
			if (this.cache.has(arg)) return this.cache.get(arg);
			const profiles = await OverwatchAPI.fetchProfiles(arg);
			if (profiles.length) {
				await msg.sendMessage('Fetching profile, please stand by...');
				return this.cache.create(arg).setProfiles(profiles).fetchProfile();
			}
			throw msg.language.get('COMMAND_OVERWATCH_PROFILE_NOTFOUND');
		}).createCustomResolver('filter', (arg, possible, msg, [owp, gamemode, type = 'achievements']) => {
			if (arg && type && owp.profile) {
				arg = arg.toLowerCase();
				switch (type) {
					case 'achievements':
						if (arg in owp.profile.achievements) return arg;
						break;
					case 'heroes':
						if (arg in owp.profile.heroes) return arg;
						break;
					case 'stats':
						gamemode = this._resolveGameMode(gamemode);
						if (arg in owp.profile.stats[gamemode]) return arg;
						break;
				}
			}
			return undefined;
		});

		this.cache = OverwatchProfileStore.createInstance(this.client);
	}

	async run(msg, [profile, gamemode = 'quickplay', type = 'achievements', gametype]) {
		gamemode = this._resolveGameMode(gamemode);
		switch (type) {
			case 'achievements': return this._getAchievements(msg, profile, gametype, gamemode);
			case 'heroes': return this._getHeroes(msg, profile, gametype, gamemode);
			case 'stats': return this._stats(msg, profile, gametype, gamemode);
			default: return msg.sendMessage('Unsupported action.');
		}
	}

	/**
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message that executed this command
	 * @param {OverwatchProfile} overwatchProfile The Overwatch profile
	 * @param {('general'|'offense'|'defense'|'tank'|'support'|'maps')} gametype The mode
	 * @returns {*}
	 */
	_getAchievements(msg, overwatchProfile, gametype = 'general') {
		const { achievements } = overwatchProfile.profile;
		const data = achievements[gametype];
		const embed = new MessageEmbed()
			.setTitle(overwatchProfile.name, overwatchProfile.profileURL(overwatchProfile.bestProfile.platform))
			.setDescription(Object.keys(data).map(key => this._resolveBoolean(data, key)));
		return msg.sendEmbed(embed);
	}

	/**
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message that executed this command
	 * @param {OverwatchProfile} overwatchProfile The Overwatch profile
	 * @param {('playtime'|'stats')} gametype The mode
	 * @param {('quickplay'|'competitive')} gamemode The gamemode
	 * @returns {*}
	 */
	_getHeroes(msg, overwatchProfile, gametype = 'playtime', gamemode) {
		const { heroes } = overwatchProfile.profile;
		return heroes[gametype][gamemode];
	}

	/**
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message that executed this command
	 * @param {OverwatchProfile} overwatchProfile The Overwatch profile
	 * @param {('playtime'|'stats')} gametype The mode
	 * @param {('quickplay'|'competitive')} gamemode The gamemode
	 * @returns {*}
	 */
	_stats(msg, overwatchProfile, gametype, gamemode) {
		const { stats } = overwatchProfile.profile;
		return stats[gamemode];
	}

	/**
	 * Resolve the mode
	 * @param {('comp'|'competitive'|'qp'|'quickplay')} mode The mode to resolve
	 * @returns {('quickplay'|'competitive')}
	 */
	_resolveGameMode(mode) {
		switch (mode) {
			case 'comp':
			case 'competitive': return 'competitive';
			case 'qp':
			case 'quickplay':
			default: return 'quickplay';
		}
	}

	_resolveBoolean(object, property) {
		return `${object[property] ? '<:greenTick:405073335907647489>' : '<:redCross:405073349664833537>'} ${
			toTitleCase(property.replace(/_/g, ' '))}`;
	}

};
