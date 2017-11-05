const GuildSettings = require('./GuildSettings');
const RethinkDB = require('../../../providers/rethink');
const { Collection } = require('discord.js');

class GuildManager extends Collection {

	constructor(client) {
		super();
		Object.defineProperty(this, 'client', { value: client });
	}

	get(id) {
		return super.get(id) || this.create(id);
	}

	set(id, object) {
		const guildSettings = new GuildSettings(this.client, id, object);
		super.set(id, guildSettings);
		return guildSettings;
	}

	async create(id) {
		this.client.emit('log', `GUILDS       | Created ${id}`, 'verbose');
		const guildSettings = new GuildSettings(this.client, id, {});
		await RethinkDB.create('guilds', { id });
		await RethinkDB.create('moderation', { id, cases: [] });
		guildSettings.setModeration([]);
		super.set(id, guildSettings);
		return guildSettings;
	}

	async delete(id) {
		this.client.emit('log', `GUILDS       | Deleted ${id}`, 'warn');
		await RethinkDB.delete('guilds', id);
		return super.delete(id);
	}

	all() {
		return this;
	}

}

module.exports = GuildManager;
