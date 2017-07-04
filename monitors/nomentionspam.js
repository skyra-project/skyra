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
        entry.timeout = setTimeout(() => this.delete(entry.id), (entry.amount + 3) * 1000);
    }

    delete(user) {
        this.cooldown.delete(user);
    }
}

exports.run = async (client, msg) => {
    if (msg.author.bot
        || !msg.guild
        || !msg.member
        || !msg.member.bannable
        || (msg.mentions.users.size === 1 && msg.mentions.users.first().bot)) return;

    const settings = msg.guild.settings;
    if (settings.selfmod.nomentionspam !== true) return;

    const filteredCollection = msg.mentions.users.filter(entry => entry.id !== msg.author.id);
    if (filteredCollection.size === 0 || filteredCollection.first().bot) return;

    if (!cooldown.has(msg.guild.id)) cooldown.set(msg.guild.id, new NMS());
    const amount = msg.mentions.users.size + (msg.mentions.roles.size * 2) + (msg.mentions.everyone * 5);
    const newAmount = cooldown.get(msg.guild.id).add(msg.author.id, amount);
    client.emit("log", `${msg.author.id} got ${amount} points, increasing the amount to ${newAmount}`, "debug");
    if (newAmount >= (settings.selfmod.nmsthreshold || 20)) {
        client.emit("log", `${msg.author.id} is now bannable.`, "debug");
        // await msg.guild.ban(msg.author.id, { days: 1, reason: "[NOMENTIONSPAM]" });
    }
};
