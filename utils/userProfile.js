const MANAGER_SOCIAL_GLOBAL = require("./managerSocialGlobal");
const Rethink = require("../providers/rethink");

/* eslint-disable no-underscore-dangle, no-restricted-syntax, no-prototype-builtins */
module.exports = class UserProfile {
    constructor(user) {
        Object.defineProperty(this, "client", { value: user.client });
        Object.defineProperty(this, "_profile", { value: MANAGER_SOCIAL_GLOBAL.get(user) });
        Object.defineProperty(this, "user", { value: user });
        this.id = user.id;
        this.points = this._profile.points || 0;
        this.color = this._profile.color || "ff239d";
        this.money = this._profile.money || 0;
        this.reputation = this._profile.reputation || 0;
    }

    get exists() {
        return this._profile.exists !== false;
    }

    get quote() {
        return this._profile.quote || null;
    }

    get timeDaily() {
        return this._profile.timeDaily || 0;
    }

    get timerep() {
        return this._profile.timerep || 0;
    }

    get lastUpdate() {
        return this._profile.time || 0;
    }

    get banners() {
        const banners = this._profile.banners || {};
        return {
            theme: banners.theme || "0001",
            level: banners.level || "1001",
        };
    }

    get bannerList() {
        return this._profile.bannerList || [];
    }

    async create() {
        if (this.exists) throw "This UserProfile already exists.";
        return MANAGER_SOCIAL_GLOBAL.create(this.user);
    }

    async ensureProfile() {
        return !this.exists ? MANAGER_SOCIAL_GLOBAL.create(this.user) : false;
    }

    async win(money, guild) {
        if (guild) money *= guild.settings.boost;
        await this.add(money);
        return money;
    }

    async add(money) {
        await this.update({ money: this.money + money });
        return money;
    }

    async use(money) {
        const thisMoney = this.money - money;
        if (thisMoney < 0) throw "[403::FAILSAFE] You cannot get a debt.";
        await this.update({ money: thisMoney });
        return money;
    }

    async update(doc) {
        await this.ensureProfile();
        const output = await Rethink.update("users", this.id, doc);
        MANAGER_SOCIAL_GLOBAL.set(this.user, Object.assign(this._profile, doc));
        return output;
    }

    async sync() {
        const data = await Rethink.get("users", this.id);
        if (!data) throw "[404] Not found.";
        MANAGER_SOCIAL_GLOBAL.set(this.id, data);
        return data;
    }

    async destroy() {
        if (!this.exists) throw "This UserProfile does not exist.";
        const output = await Rethink.delete("users", this.id);
        MANAGER_SOCIAL_GLOBAL.delete(this.id);
        return output;
    }
};
