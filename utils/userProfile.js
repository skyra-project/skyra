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
};

/* eslint-disable no-restricted-syntax */
const UserProfile = class UserProfile {
    constructor(user, data) {
        Object.defineProperty(this, "raw", { value: data });
        this.id = user;
        this.points = this.raw.points || defaults.points;
        this.color = this.raw.color || defaults.color;
        this.money = this.raw.money || defaults.money;
        this.reputation = this.raw.reputation || defaults.reputation;
        this.bannerList = this.raw.bannerList || defaults.bannerList;
        this.quote = this.raw.quote || defaults.quote;
        this.banners = {
            theme: this.raw.banners.theme || defaults.banners.theme,
            level: this.raw.banners.level || defaults.banners.level,
        };
        this.timeDaily = this.raw.timeDaily || defaults.timeDaily;
        this.timerep = this.raw.timerep || defaults.timerep;
        this.lastUpdate = this.raw.time || 0;
        this.exists = this.raw.exists || true;
    }

    async create() {
        if (this.exists) throw "This GuildSetting already exists.";
        this.raw = Object.assign(defaults, { id: this.id, exists: true });
        await Rethink.create("users", this.raw).catch((err) => { throw err; });
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
        console.log("users", this.id, doc);
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
