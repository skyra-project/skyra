const provider = require('../../providers/rethink');

/**
 * Global Settings for Users.
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
     * @property {Number}   points     Amount of points the user has.
     * @property {string}   color      The HEX colour code.
     * @property {Number}   money      The amount of money the user has.
     * @property {Number}   reputation The amount of reputation points the user has.
     * @property {Banners}  banners    The banners that are shown publicly.
     * @property {string[]} bannerList All the banners the user has bought.
     * @property {Number}   timeDaily  The last time the user claimed dailies.
     * @property {Number}   timerep    The last time the user gave a reputation point.
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

        this.points = data.points || 0;
        this.color = data.color || 'ff239d';
        this.money = data.money || 0;
        this.reputation = data.reputation || 0;

        if (!data.banners) data.banners = {};
        this.banners = {
            theme: data.banners.theme || '0001',
            level: data.banners.level || '1001'
        };

        this.bannerList = data.bannerList || [];
        this.timeDaily = data.timeDaily || 0;
        this.timerep = data.timerep || 0;
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
