const SocialGlobal = require('./managers/socialGlobal');
const SocialLocal = require('./managers/socialLocal');
const Guilds = require('./managers/guilds');
const Clock = require('./managers/clock');

const AdvancedSearch = require('./interfaces/AdvancedSearch');
// const Dashboard = require('../functions/dashboard');

const provider = require('../providers/rethink');
const { log } = require('./debugLog');

class Handler {

    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });

        this.guilds = new Guilds();
        this.clock = new Clock(client);

        this.search = new AdvancedSearch(client);

        this.dashboard = null;

        this.social = {
            global: new SocialGlobal(),
            local: new SocialLocal()
        };

        this.inited = false;
    }

    async init() {
        if (this.inited) return;

        await this.clock.init();
        // this.dashboard = new Dashboard(this.client);

        const [guild, users, locals, modlogs] = await Promise.all([
            provider.getAll('guilds'),
            provider.getAll('users'),
            provider.getAll('localScores'),
            provider.getAll('moderation')
        ]);
        await this.syncGuilds(guild, modlogs);
        await this.syncLocals(locals);
        this.syncGlobal(users);

        this.inited = true;
    }

    async syncGuilds(guilds, modlogs) {
        const ModCache = new Map();
        for (const modlog of modlogs) {
            ModCache.set(modlog.id, modlog.cases.filter(cs => cs.type === 'mute' && cs.appeal !== true) || []);
        }
        for (const guild of guilds) {
            if (this.client.guilds.has(guild.id) === false) {
                log(`LOADER | GUILDSETTINGS | Received data from ${guild.id}, which guild I am not in.`);
                // await provider.delete('guilds', guild.id)
                //     .then(() => this.emitError(`Deleted '${guild.id}' from 'guilds'`))
                //     .catch(err => this.emitError(err));
                // await provider.delete('moderation', guild.id)
                //     .then(() => this.emitError(`Deleted '${guild.id}' from 'moderation'`))
                //     .catch(err => this.emitError(err));
                continue;
            }
            this.guilds.set(guild.id, guild).setModeration(ModCache.get(guild.id) || []);
        }
        for (const guild of this.client.guilds.values()) {
            if (this.guilds.has(guild.id) === false) await this.guilds.create(guild.id);
        }
    }

    async syncLocals(locals) {
        for (const guild of locals) {
            if (this.client.guilds.has(guild.id) === false) {
                log(`LOADER | LOCALSCORES | Received data from ${guild.id}, which guild I am not in.`);
                // await provider.delete('localScores', guild.id)
                //     .then(() => this.emitError(`Deleted '${guild.id}' from 'localScores'`))
                //     .catch(err => this.emitError(err));
                continue;
            }
            const localManager = this.social.local.set(guild.id);
            for (const member of guild.scores) {
                localManager.addMember(member.id, member);
            }
        }
    }

    syncGlobal(users) {
        for (const user of users) this.social.global.set(user.id, user);
    }

    emitError(err, type = 'error') {
        return this.client.emit('log', err, type);
    }

}

module.exports = Handler;
