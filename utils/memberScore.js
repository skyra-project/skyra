const manager = require("./managerSocialLocal");
const RethinkDB = require("../providers/rethink");

const defaults = {
    score: 0,
};


const MemberScore = class MemberScore {
    constructor(member, guild, data) {
        Object.defineProperty(this, "raw", { value: data });
        this.id = member;
        this.guild = guild;
        this.score = this.raw.score || 0;
    }

    async create() {
        if (this.exists) throw "This MemberScore already exists.";
        this.raw = Object.assign(defaults, { id: this.id, exists: true });
        await RethinkDB.append("localScores", this.guild, "scores", this.raw);
        return true;
    }

    async ensureProfile() {
        return !this.exists ? this.create() : false;
    }

    async update(score) {
        await this.ensureProfile();
        RethinkDB.updateArray("localScores", this.guild, "scores", this.member, { score });
        this.raw.score = score;
        return this.raw.score;
    }

    async destroy() {
        const output = await RethinkDB.removeFromArrayByID("localScores", this.guild, "scores", this.id);
        manager.get(this.guild).delete(this.id);
        return output;
    }
};

module.exports = { MemberScore, defaults };
