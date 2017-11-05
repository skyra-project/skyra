const provider = require('../../providers/rethink');

/**
 * @interface GlobalUser Settings.
 * @class GlobalUser
 */
class GlobalUser {

	/**
     * @typedef  {Object} Banners
     * @property {string} theme The banner that is shown in the profile command.
     * @property {string} level The banner that is shown in the level command.
     *
     * @memberof GlobalUserSettings
     */

	/**
     * @typedef  {Object} GlobalUserSettings
     * @property {number}   points     Amount of points the user has.
     * @property {string}   color      The HEX colour code.
     * @property {number}   money      The amount of money the user has.
     * @property {number}   reputation The amount of reputation points the user has.
     * @property {Banners}  banners    The banners that are shown publicly.
	 * @property {string[]} badgeSet   All the badges the user displays in the profile.
	 * @property {string[]} badgeList  All the badges the user has got or bought.
     * @property {string[]} bannerList All the banners the user has bought.
     * @property {number}   timeDaily  The last time the user claimed dailies.
     * @property {number}   timerep    The last time the user gave a reputation point.
     *
     * @memberof GlobalUser
     */

	/**
     * Creates an instance of GlobalUser.
     * @param {string} id The ID of the User.
     * @param {GlobalUserSettings} [data={}] The data from the user.
     */
	constructor(id, data = {}) {
		Object.defineProperty(this, 'id', { value: id });

		this.points = typeof data.points !== 'number' ? 0 : data.points;
		this.color = typeof data.color !== 'string' ? 'ff239d' : data.color;
		this.money = typeof data.money !== 'number' ? 0 : data.money;
		this.reputation = typeof data.reputation !== 'number' ? 0 : data.reputation;

		if (typeof data.banners === 'undefined') data.banners = {};
		this.banners = {
			theme: typeof data.banners.theme !== 'string' ? '0001' : data.banners.theme,
			level: typeof data.banners.level !== 'string' ? '1001' : data.banners.level
		};

		this.badgeSet = typeof data.badgeSet === 'undefined' ? [] : data.badgeSet;
		this.badgeList = typeof data.badgeList === 'undefined' ? [] : data.badgeList;

		this.bannerList = typeof data.bannerList === 'undefined' ? [] : data.bannerList;
		this.timeDaily = typeof data.timeDaily !== 'number' ? 0 : data.timeDaily;
		this.timerep = typeof data.timerep !== 'number' ? 0 : data.timerep;
	}

	/**
     * Get the parsed data in JSON.
     * @returns {GlobalUserSettings}
     */
	toJSON() {
		return {
			id: this.id,
			points: this.points,
			color: this.color,
			money: this.money,
			reputation: this.reputation,
			banners: this.banners,
			badgeSet: this.badgeSet,
			badgeList: this.badgeList,
			bannerList: this.bannerList,
			timeDaily: this.timeDaily,
			timerep: this.timerep
		};
	}

	win(money, guild) {
		if (guild) money *= guild.settings.social.boost;
		return this.add(money);
	}

	add(money) {
		return this.update({ money: this.money + money }).then(() => money);
	}

	use(money) {
		if (this.money - money < 0) throw '[403::FAILSAFE] You cannot get a debt.';
		return this.update({ money: this.money - money }).then(() => money);
	}

	async update(doc) {
		await provider.update('users', this.id, doc);
		for (const [key, value] of Object.entries(doc)) {
			if (value instanceof Object) {
				for (const [subkey, subvalue] of Object.entries(value)) this[key][subkey] = subvalue;
			} else {
				this[key] = value;
			}
		}
		return this;
	}

}

module.exports = GlobalUser;
