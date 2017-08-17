const cache = new Map();

class AntiRaid {

    constructor(guild, settings) {
        this.guild = guild;
        this.settings = settings;

        this.users = new Map();
    }

    add(member) {
        const timer = this.clear(member);
        this.users.set(member.id, timer);
        if (this.settings.selfmod.raidthreshold >= this.users.size) return this.execute();
        return false;
    }

    remove(member) {
        clearInterval(this.users.get(member.id));
        this.users.delete(member.id);
        return this;
    }

    async execute() {
        if (this.guild.me.permissions.has('KICK_MEMBERS') === false) return false;
        const kicked = [];

        const min = !!this.defaultRole + 1;

        for (const id of this.users.keys()) {
            const member = await this.check(id, min);
            if (member === null) continue;
            await member.kick(`[ANTI-RAID] Threshold: ${this.settings.selfmod.raidthreshold}`)
                .then(() => {
                    kicked.push(`${member.user.tag} (${member.id})`);
                    this.remove(member);
                })
                .catch(() => null);
        }

        return kicked;
    }

    check(id, min) {
        return this.guild.fetchMember(id)
            .then((member) => {
                if (member.roles.size >= min) return null;
                if (min === 2 && member.roles.has(this.defaultRole) === false) return null;
                return member;
            })
            .catch(() => null);
    }

    clear(member) {
        return setTimeout(() => this.remove(member), 20000);
    }

    get defaultRole() {
        return this.settings.roles.initial;
    }

}

class Manager {

    static get(guild, settings) {
        return cache.get(guild.id) || this.set(guild, settings);
    }

    static set(guild, settings) {
        return cache.set(guild.id, new AntiRaid(guild, settings));
    }

    static add(guild, settings, member) {
        return this.get(guild.id).add(member);
    }

    static remove(guild, settings, member) {
        return this.get(guild.id).remove(member);
    }

}

module.exports = Manager;
