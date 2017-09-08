const SocialGlobal = require('./managers/socialGlobal');
const SocialLocal = require('./managers/socialLocal');
const Guilds = require('./managers/guilds');
const Clock = require('./managers/clock');

const AdvancedSearch = require('./interfaces/AdvancedSearch');
const Dashboard = require('../functions/dashboard');

const provider = require('../providers/rethink');

class Handler {

    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });

        this.guilds = new Guilds(client);
        this.clock = new Clock(client);

        this.search = new AdvancedSearch(client);

        this.dashboard = null;

        this.social = {
            global: new SocialGlobal(client),
            local: new SocialLocal(client)
        };

        this.inited = false;
    }

    async init() {
        if (this.inited) return;

        this.dashboard = new Dashboard(this.client);

        await Promise.all([
            this.syncGuilds(),
            this.syncLocals(),
            this.syncGlobal(),
            this.clock.init(),
            this.dashboard.init()
        ]);

        this.inited = true;
    }

    async syncGuilds() {
        const [guilds, modlogs] = await Promise.all([
            provider.getAll('guilds'),
            provider.getAll('moderation')
        ]);

        const ModCache = new Map();
        for (let i = 0; i < modlogs.length; i++) {
            ModCache.set(modlogs[i].id, modlogs[i].cases.filter(cs => cs.type === 'mute' && cs.appeal !== true) || []);
        }
        for (let i = 0; i < guilds.length; i++) {
            if (this.client.guilds.has(guilds[i].id) === false) this.client.emit('log', `LOADER | GUILDSETTINGS | ${guilds[i].id} `, 'warn');
            this.guilds.set(guilds[i].id, guilds[i]).setModeration(ModCache.get(guilds[i].id) || []);
        }
        for (const guild of this.client.guilds.values()) {
            if (this.guilds.has(guild.id) === false) await this.guilds.create(guild.id);
        }

        return true;
    }

    async syncLocals() {
        const locals = await provider.getAll('localScores');

        for (let i = 0; i < locals.length; i++) {
            const guild = locals[i];
            const localManager = this.social.local.set(guild.id);

            for (let j = 0; j < guild.scores.length; j++) localManager.addMember(guild.scores[j].id, guild.scores[j]);
        }

        return true;
    }

    async syncGlobal() {
        const users = await provider.getAll('users');
        for (let i = 0; i < users.length; i++) this.social.global.set(users[i].id, users[i]);

        return true;
    }

}

module.exports = Handler;
