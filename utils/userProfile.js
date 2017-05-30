const GlobalSocialManager = require("./globalSocialManager");

/* eslint-disable no-underscore-dangle, complexity, no-throw-literal, no-restricted-syntax, no-prototype-builtins */
module.exports = class UserProfile {
  constructor(user) {
    Object.defineProperty(this, "client", { value: user.client });
    Object.defineProperty(this, "_profile", { value: GlobalSocialManager.get(user) });
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
    GlobalSocialManager.create(this.user);
  }

  async ensureProfile() {
    if (!this.exists) GlobalSocialManager.create(this.user);
  }

  async add(money) {
    await this.update({ money: this.money + money });
    return money;
  }

  async use(money) {
    const thisMoney = this.money - money;
    if (thisMoney < 0) throw "[403::FAILSAFE] You can't get a debt.";
    await this.update({ money: thisMoney });
    return money;
  }

  async update(doc) {
    await this.ensureProfile();
    await this.client.rethink.update("users", this.id, doc);
    GlobalSocialManager.set(this.user, Object.assign(this._profile, doc));
  }

  async sync() {
    const data = await this.client.rethink.get("users", this.id);
    if (!data) throw "[404] Not found.";
    GlobalSocialManager.set(this.id, data);
  }

  async destroy() {
    if (!this.exists) throw "This UserProfile does not exist.";
    await this.client.rethink.delete("users", this.id);
    GlobalSocialManager.delete(this.id);
  }
};
