/* eslint-disable no-underscore-dangle, complexity, no-throw-literal */
module.exports = class Moderation {
  constructor(guild) {
    Object.defineProperty(this, "client", { value: guild.client });
    Object.defineProperty(this, "guild", { value: guild });
    this.id = guild.id;
    this.cases = this.getCases();
    this.amountCases = this.getAmountCases();
    this.lastCase = this.getLastCase();
  }

  get exists() {
    return this.client.rethink.get("moderation", this.guild.id) || null;
  }

  async create() {
    await this.client.rethink.add("moderation", {
      id: this.guild.id,
      cases: [],
    });
  }

  async ensureModule() {
    if (!this.exists) await this.create();
  }

  async getCases() {
    const modCases = await this.client.rethink.get("moderation", this.guild.id);
    if (!modCases) return null;
    return modCases.cases;
  }

  async getAmountCases() {
    const data = await this.getCases();
    if (!data) return 0;
    return data.length;
  }

  async getLastCase() {
    const index = await this.getAmountCases();
    if (index === 0) return null;
    const data = await this.getCases();
    return data[index - 1] || null;
  }

  async pushCase(type, moderator = null, reason = null, user, message, extraData = null) {
    const thisCase = await this.getAmountCases();

    const object = {
      type,
      thisCase,
      moderator,
      reason,
      user,
      message,
      extraData,
    };

    await this.ensureModule();
    await this.client.rethink.append("moderation", this.id, "cases", object);
  }

  async updateCase(index, doc) {
    return this.client.rethink.updateArray("moderation", this.id, "cases", index, doc);
  }

  async destroy() {
    if (!this.exists) throw "This GuildConfig does not exist.";
    await this.client.rethink.delete("moderation", this.id);
  }
};
