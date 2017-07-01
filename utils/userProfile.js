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
};

const UserProfile = class UserProfile {
    constructor(user, data) {
        Object.defineProperty(this, "raw", { value: data });
        this.id = user;
        this.points = this.raw.points || defaults.points;
        this.color = this.raw.color || defaults.color;
        this.money = this.raw.money || defaults.money;
        this.reputation = this.raw.reputation || defaults.reputation;
    }

    get exists() {
        return this.raw.exists !== false;
    }

    get quote() {
        return this.raw.quote || null;
    }

    get timeDaily() {
        return this.raw.timeDaily || 0;
    }

    get timerep() {
        return this.raw.timerep || 0;
    }

    get lastUpdate() {
        return this.raw.time || 0;
    }

    get banners() {
        const banners = this.raw.banners || {};
        return {
            theme: banners.theme || "0001",
            level: banners.level || "1001",
        };
    }

    get bannerList() {
        return this.raw.bannerList || [];
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
        if (guild) money *= guild.settings.boost;
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
        return this.sync();
    }

    async sync() {
        const data = await Rethink.get("users", this.id);
        if (!data) throw "[404] Not found.";
        this.raw = data;
        return data;
    }

    async destroy() {
        if (!this.exists) throw "This UserProfile does not exist.";
        const output = await Rethink.delete("users", this.id);
        manager.delete(this.id);
        return output;
    }
};

module.exports = { UserProfile, defaults };
