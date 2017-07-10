const manager = require("./managerSocialLocal");
const RethinkDB = require("../providers/rethink");

const defaults = {
    score: 0,
};


const MemberScore = class MemberScore {
    constructor(member, guild, data) {
        this.id = member;
        this.guild = guild;
        this.score = data.score || 0;
        this.exists = data.exists !== false;
    }

    async create() {
        if (this.exists) throw "This MemberScore already exists.";
        await RethinkDB.append("localScores", this.guild, "scores", Object.assign(defaults, { id: this.id }));
        this.exists = true;
        return true;
    }

    async ensureProfile() {
        return !this.exists ? this.create() : false;
    }

    async update(score) {
        await this.ensureProfile();
        await RethinkDB.updateArrayByID("localScores", this.guild, "scores", this.id, { score });
        this.score = score;
        return this.score;
    }

    async destroy() {
        const output = await RethinkDB.removeFromArrayByID("localScores", this.guild, "scores", this.id);
        manager.get(this.guild).delete(this.id);
        return output;
    }
};

module.exports = { MemberScore, defaults };
