const MANAGER_SOCIAL_GLOBAL = require("../utils/managerSocialGlobal");
const MANAGER_SOCIAL_LOCAL = require("../utils/managerSocialLocal");
const GuildManager = require("../utils/guildManager");
const Rethink = require("../providers/rethink");
const { Collection } = require("discord.js");

exports.init = async () => {
    const [guild, users, locals, moderation] = await Promise.all([
        Rethink.all("guilds"),
        Rethink.all("users"),
        Rethink.all("localScores"),
        Rethink.all("moderation"),
    ]);
    this.syncGuilds(guild, moderation);
    this.syncGlobal(users);
    this.syncLocals(locals);
};

exports.syncGuilds = (guild, moderation) => {
    for (let i = 0; i < guild.length; i++) {
        const mutes = this.handleMutes(guild[i].id, moderation);
        Object.assign(guild[i], { mutes });
        GuildManager.set(guild[i].id, guild[i]);
    }
};

exports.syncGlobal = (users) => {
    for (let i = 0; i < users.length; i++) {
        MANAGER_SOCIAL_GLOBAL.set(users[i].id, users[i]);
    }
};

exports.syncLocals = (locals) => {
    for (let i = 0; i < locals.length; i++) {
        MANAGER_SOCIAL_LOCAL.set(locals[i].id, new Collection());
        locals[i].scores.forEach(u => MANAGER_SOCIAL_LOCAL.get(locals[i].id).set(u.id, u));
    }
};

exports.handleMutes = (gID, moderation) => {
    const mod = moderation.find(guild => guild.id === gID);
    if (!mod || !mod.cases) return [];
    return mod.cases.filter(c => c.type === "mute" && c.appeal !== true) || [];
};
