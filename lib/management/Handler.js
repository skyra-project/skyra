const { UserProfileStore, GuildMemberProfileStore, GuildSettingsStore, Clock } = require('../structures/managers');
const { AdvancedSearch, PromptSystem } = require('../util');
const RethinkDB = require('../../providers/rethink');
const Dashboard = require('../../functions/dashboard');

class Handler {

	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });

		this.guilds = new GuildSettingsStore(client);
		this.clock = new Clock(client);

		this.search = new AdvancedSearch(client);
		this.prompt = new PromptSystem(client);

		this.dashboard = null;

		// [IG] Integrated Gateway (v3.1.0)
		this.social = {
			global: new UserProfileStore(client),
			local: new GuildMemberProfileStore(client)
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
			RethinkDB.getAll('guilds'),
			RethinkDB.getAll('moderation')
		]);

		const ModCache = new Map();
		for (let i = 0; i < modlogs.length; i++)
			ModCache.set(modlogs[i].id, modlogs[i].cases.filter(cs => cs.type === 'mute' && cs.appeal !== true) || []);

		for (let i = 0; i < guilds.length; i++) {
			if (this.client.config.dev === false && this.client.guilds.has(guilds[i].id) === false) this.client.emit('log', `LOADER | GUILDSETTINGS | ${guilds[i].id} `, 'info');
			this.guilds.set(guilds[i].id, guilds[i]).setModeration(ModCache.get(guilds[i].id) || []);
		}
		for (const guild of this.client.guilds.values())
			if (this.guilds.has(guild.id) === false) await this.guilds.create(guild.id);

		return true;
	}

	async syncLocals() {
		const locals = await RethinkDB.getAll('localScores');

		for (let i = 0; i < locals.length; i++) {
			const guild = locals[i];
			const localManager = this.social.local.set(guild.id);

			for (let j = 0; j < guild.scores.length; j++) localManager.addMember(guild.scores[j].id, guild.scores[j]);
		}

		return true;
	}

	async syncGlobal() {
		const users = await RethinkDB.getAll('users');
		for (let i = 0; i < users.length; i++) this.social.global.set(users[i].id, users[i]);

		return true;
	}

}

module.exports = Handler;
