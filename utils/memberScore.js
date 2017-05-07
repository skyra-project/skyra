/* eslint-disable no-underscore-dangle, complexity, no-throw-literal */
module.exports = class MemberScore {
  constructor(member) {
    Object.defineProperty(this, "client", { value: member.client });
    Object.defineProperty(this, "guild", { value: member.guild });
    Object.defineProperty(this, "user", { value: member });
    Object.defineProperty(this, "localsGuild", { value: this.client.locals.get(this.guild.id) || this.client.locals.set(this.guild.id, new this.client.methods.Collection()) });
    Object.defineProperty(this, "localsMember", { value: this.localsGuild.get(member.id) || { id: this.id, score: 0, exists: false } });
    this.id = member.id;
    this.points = this.localsMember.score || 0;
    this.exists = this.localsMember.exists !== false;
  }

  async create() {
    if (this.exists) throw "This MemberScore already exists.";
    new this.client.Create(this.client).CreateMemberScore(this);
  }

  async ensureProfile() {
    if (!this.exists) new this.client.Create(this.client).CreateMemberScore(this);
  }

  async update(score) {
    await this.ensureProfile();
    await this.client.rethink.updateArray("localScores", this.guild.id, "scores", this.id, { score });
    this.client.locals.get(this.guild.id).get(this.id).score = score;
  }
};
