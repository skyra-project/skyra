const manager = require("./managerSocialGlobal");
const Rethink = require("../providers/rethink");

const defaults = {
    points: 0,
    color: "ff239d",
    money: 0,
    reputation: 0,
    banners: {
        theme: "0001",
        level: "1001",
    },
    bannerList: [],
    quote: null,
    timeDaily: 0,
    timerep: 0,

    playlist: [],
};

/* eslint-disable no-restricted-syntax */
const UserProfile = class UserProfile {

    constructor(user, data) {
        this.id = user;
        this.points = data.points || defaults.points;
        this.color = data.color || defaults.color;
        this.money = data.money || defaults.money;
        this.reputation = data.reputation || defaults.reputation;
        this.bannerList = data.bannerList || defaults.bannerList;
        this.quote = data.quote || defaults.quote;
        this.banners = {
            theme: data.banners.theme || defaults.banners.theme,
            level: data.banners.level || defaults.banners.level,
        };
        this.timeDaily = data.timeDaily || defaults.timeDaily;
        this.timerep = data.timerep || defaults.timerep;
        this.lastUpdate = data.time || 0;
        this.exists = data.exists !== false;

        this.playlist = data.playlist || defaults.playlist;
    }

    async create() {
        if (this.exists) throw "This GuildSetting already exists.";
        const object = Object.assign(defaults, { id: this.id, exists: true });
        await Rethink.create("users", object).catch((err) => { throw err; });
        return true;
    }

    ensureProfile() {
        return !this.exists ? this.create() : false;
    }

    async win(money, guild) {
        if (guild) money *= guild.settings.social.boost;
        return this.add(money);
    }

    async add(money) {
        await this.update({ money: this.money + money });
        return money;
    }

    async use(money) {
        if (this.money - money < 0) throw "[403::FAILSAFE] You cannot get a debt.";
        await this.update({ money: this.money - money });
        return money;
    }

    async update(doc) {
        await this.ensureProfile();
        await Rethink.update("users", this.id, doc);
        for (const key of Object.keys(doc)) {
            if (doc[key] instanceof Object) {
                for (const subkey of Object.keys(doc[key])) this[key][subkey] = doc[key][subkey];
            } else {
                this[key] = doc[key];
            }
        }
        return this;
    }

    async destroy() {
        if (!this.exists) throw "This UserProfile does not exist.";
        const output = await Rethink.delete("users", this.id);
        manager.delete(this.id);
        return output;
    }

};

module.exports = { UserProfile, defaults };
