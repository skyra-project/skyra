const RethinkDB = require("./rethinkDB");
const GuildManager = require("../utils/guildManager");
const MANAGER_SOCIAL_GLOBAL = require("../utils/managerSocialGlobal");
const MANAGER_SOCIAL_LOCAL = require("../utils/managerSocialLocal");

exports.init = async (client) => {
    const [guild, users, locals, moderation] = await Promise.all([
        RethinkDB.all("guilds"),
        RethinkDB.all("users"),
        RethinkDB.all("localScores"),
        RethinkDB.all("moderation"),
    ]);
    guild.forEach((guildData) => {
        const mutes = this.handleMutes(guildData.id, moderation);
        Object.assign(guildData, { mutes });
        GuildManager.set(guildData.id, guildData);
    });
    users.forEach(userData => MANAGER_SOCIAL_GLOBAL.set(userData.id, userData));
    locals.forEach((g) => {
        MANAGER_SOCIAL_LOCAL.set(g.id, new client.methods.Collection());
        g.scores.forEach(u => MANAGER_SOCIAL_LOCAL.get(g.id).set(u.id, u));
    });
};

exports.handleMutes = (gID, moderation) => {
    const mod = moderation.find(guild => guild.id === gID);
    if (!mod || !mod.cases) return [];
    return mod.cases.filter(c => c.type === "mute" && c.appeal !== true) || [];
};
