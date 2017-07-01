const globalData = require("../utils/managerSocialGlobal");
const localData = require("../utils/managerSocialLocal");
const GuildManager = require("../utils/guildManager");
const Rethink = require("../providers/rethink");
const { Collection } = require("discord.js");

const { UserProfile } = require("../utils/userProfile");
const { MemberScore } = require("../utils/memberScore");
const { GuildSetting } = require("../utils/guildSettings");

exports.init = async () => {
    const [guild, users, locals, moderation] = await Promise.all([
        Rethink.getAll("guilds"),
        Rethink.getAll("users"),
        Rethink.getAll("localScores"),
        Rethink.getAll("moderation"),
    ]);
    this.syncGuilds(guild, moderation);
    this.syncGlobal(users);
    this.syncLocals(locals);
};

/* eslint-disable no-restricted-syntax */
exports.syncGuilds = (guilds, moderation) => {
    for (const guild of guilds) {
        const mutes = this.handleMutes(guild.id, moderation);
        guild.mutes = mutes;
        GuildManager.set(guild.id, new GuildSetting(guild.id, guild));
    }
};

exports.syncGlobal = (users) => {
    for (const user of users) {
        globalData.set(user.id, new UserProfile(user.id, user));
    }
};

exports.syncLocals = (locals) => {
    for (const guild of locals) {
        localData.set(guild.id, new Collection());
        const guildData = localData.get(guild.id);
        for (const user of guild.scores) {
            guildData.set(user.id, new MemberScore(user.id, guild.id, user));
        }
    }
};

exports.handleMutes = (gID, moderation) => {
    const mod = moderation.find(guild => guild.id === gID);
    if (!mod || !mod.cases) return [];
    return mod.cases.filter(c => c.type === "mute" && c.appeal !== true) || [];
};
