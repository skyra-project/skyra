const ModLog = require("../utils/createModlog.js");

exports.conf = { enabled: true };

const cooldown = new Map();

class NMS {
    constructor() {
        this.cooldown = new Map();
    }

    get(user) {
        return this.cooldown.get(user)
            || (this.cooldown.set(user, { id: user, amount: 0, timeout: null }) && { id: user, amount: 0, timeout: null });
    }

    add(user, amount) {
        const entry = this.get(user);
        entry.amount += amount;
        this.timeout(entry);
        this.cooldown.set(user, entry);
        return entry.amount;
    }

    timeout(entry) {
        clearTimeout(entry.timeout);
        entry.timeout = setTimeout(() => this.delete(entry.id), (entry.amount + 4) * 1000);
    }

    delete(user) {
        clearTimeout(this.get(user).timeout);
        this.cooldown.delete(user);
    }
}

exports.run = async (client, msg) => {
    if (msg.author.bot
        || !msg.guild
        || !msg.member
        || !msg.member.bannable
        || (msg.mentions.users.size === 1 && msg.mentions.users.first().bot)) return null;

    const settings = msg.guild.settings;
    if (settings.selfmod.nomentionspam !== true) return null;

    const filteredCollection = msg.mentions.users.filter(entry => entry.id !== msg.author.id);
    if (msg.mentions.everyone === false
        && msg.mentions.roles.size === 0
        && (filteredCollection.size === 0 || filteredCollection.first().bot)) return null;

    if (!cooldown.has(msg.guild.id)) cooldown.set(msg.guild.id, new NMS());
    const amount = filteredCollection.size + (msg.mentions.roles.size * 2) + (msg.mentions.everyone * 5);
    const newAmount = cooldown.get(msg.guild.id).add(msg.author.id, amount);
    if (newAmount >= (settings.selfmod.nmsthreshold || 20)) {
        msg.author.action = "ban";
        await msg.guild.ban(msg.author.id, { days: 1, reason: "[NOMENTIONSPAM]" }).catch(err => client.emit("log", err, "error"));
        await msg.send([
            `The banhammer has landed and now the user ${msg.author.tag} with id ${msg.author.id} is banned for mention spam.`,
            "Do not worry! I'm here to help you! 😄",
        ].join("\n"));

        cooldown.get(msg.guild.id).delete(msg.author.id);

        const moderation = new ModLog(msg.guild)
            .setModerator(client.user)
            .setUser(msg.author)
            .setType("ban")
            .setReason(`[NOMENTIONSPAM] Threshold: ${settings.selfmod.nmsthreshold || 20}. Reached: ${newAmount}`);

        return moderation.send().catch(err => client.emit("log", err, "error"));
    }

    return null;
};
