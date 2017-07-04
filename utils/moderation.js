const Rethink = require("../providers/rethink");

/* eslint-disable no-underscore-dangle, complexity */
module.exports = class Moderation {
    constructor(guild, mutes) {
        this.id = guild;
        this.mutes = new Map();
        this.parseMutes(mutes);
    }

    parseMutes(mutes) {
        for (let i = 0; i < mutes.length; i++) this.mutes.set(mutes[i].user, mutes[i]);
    }

    exists() {
        return Rethink.has("moderation", this.id);
    }

    create() {
        return Rethink.create("moderation", {
            id: this.id,
            cases: [],
        });
    }

    async ensureModule() {
        return this.exists().then(bool => (bool ? false : this.create()));
    }

    async getCases(id = null) {
        if (id) {
            return Rethink.getFromArrayByIndex("moderation", this.id, "cases", id) || null;
        }
        return Rethink.get("moderation", this.id).then(doc => (doc ? doc.cases : []));
    }

    async getAmountCases() {
        return this.getCases().then(data => (data || []).length);
    }

    async getLastCase() {
        const data = await this.getCases();
        return data.length > 0 ? data[data.length - 1] || null : null;
    }

    async pushCase(data) {
        await this.ensureModule();
        await Rethink.append("moderation", this.id, "cases", data);
        if (data.type === "mute") await this.syncMutes();
        else if (data.type === "unmute") await this.appealMute(data.user.id);
    }

    async updateCase(index, doc) {
        return Rethink.updateArrayByIndex("moderation", this.id, "cases", index, doc);
    }

    async getMutes() {
        return this.getCases().then(cases => cases.filter(obj => obj.type === "mute" && obj.appeal !== true));
    }

    async getMute(user) {
        return this.getMutes().then(g => g.find(obj => obj.type === "mute" && obj.user === user && obj.appeal !== true) || null);
    }

    async syncMutes() {
        return this.getMutes().then((array) => {
            this.mutes = new Map();
            this.parseMutes(array);
        });
    }

    async appealMute(user) {
        return this.getMute(user).then((d) => {
            if (!d) throw "This mute doesn't seem to exist";
            return this.updateCase(d.thisCase, { appeal: true }).then(() => this.syncMutes().then(() => true));
        });
    }

    async destroy() {
        if (!(await this.exists())) throw "This GuildConfig does not exist.";
        return Rethink.delete("moderation", this.id);
    }
};
