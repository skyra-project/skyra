const MANAGER_SOCIAL_LOCAL = require("./managerSocialLocal");

/* eslint-disable no-throw-literal */
module.exports = class MemberScore {
    constructor(member) {
        Object.defineProperty(this, "client", { value: member.client });
        Object.defineProperty(this, "guild", { value: member.guild });
        Object.defineProperty(this, "member", { value: member });
        this.id = member.id;
    }

    get fetch() {
        return MANAGER_SOCIAL_LOCAL.fetch(this.member);
    }

    get score() {
        return this.fetch.score || 0;
    }

    get exists() {
        return this.fetch.exists !== false;
    }

    async create() {
        if (this.exists) throw "This MemberScore already exists.";
        return MANAGER_SOCIAL_LOCAL.create(this.member);
    }

    async ensureProfile() {
        return !this.exists ? MANAGER_SOCIAL_LOCAL.create(this.member) : false;
    }

    async update(score) {
        await this.ensureProfile();
        return MANAGER_SOCIAL_LOCAL.update(this.member, score);
    }
};
