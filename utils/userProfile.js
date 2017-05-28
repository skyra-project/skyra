/* eslint-disable no-underscore-dangle, complexity, no-throw-literal, no-restricted-syntax, no-prototype-builtins */
module.exports = class UserProfile {
  constructor(user) {
    Object.defineProperty(this, "client", { value: user.client });
    Object.defineProperty(this, "user", { value: user });
    Object.defineProperty(this, "_profile", { value: this.client.cacheProfiles.get(user.id) || { exists: false } });
    Object.defineProperty(this, "exists", { value: this._profile.exists !== false });
    this.id = user.id;
    this.points = this._profile.points || 0;
    this.color = this._profile.color || "ff239d";
    this.money = this._profile.money || 0;
    this.reputation = this._profile.reputation || 0;
    this.quote = this._profile.quote || null;
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
    new this.client.Create(this.client).CreateUser(this.id);
  }

  async ensureProfile() {
    if (!this.exists) new this.client.Create(this.client).CreateUser(this.id);
  }

  async add(money) {
    await this.update({ money: this.money + money });
    return money;
  }

  async use(money) {
    await this.update({ money: this.money - money });
    return money;
  }

  async update(doc) {
    await this.ensureProfile();
    await this.client.rethink.update("users", this.id, doc);
    const profile = this.client.cacheProfiles.get(this.id) || {};
    for (const key in doc) {
      if (doc.hasOwnProperty(key)) {
        profile[key] = doc[key];
      }
    }
  }

  async sync() {
    const data = await this.client.rethink.get("users", this.id);
    if (!data) throw "[404] Not found.";
    if (this.exists) this.client.cacheProfiles.delete(this.id);
    this.client.cacheProfiles.set(this.id, data);
  }

  async destroy() {
    if (!this.exists) throw "This UserProfile does not exist.";
    await this.client.rethink.delete("users", this.id);
    this.client.cacheProfiles.delete(this.id);
  }
};
