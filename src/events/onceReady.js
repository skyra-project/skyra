const { Event, util } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: true,
			event: 'ready'
		});
	}

	async run() {
		if (this.client.user.bot) await this.client.fetchApplication();
		if (!this.client.options.ownerID) this.client.options.ownerID = this.client.user.bot ? this.client.application.owner.id : this.client.user.id;

		this.client.configs = this.client.gateways.clientStorage.get(this.client.user.id, true);
		await Promise.all([
			this._prepareSkyra(),
			this.client.gateways.sync()
		]);

		// Automatic Prefix editing detection.
		const { prefix } = this.client.options;
		if (typeof prefix === 'string' && this.client.options.prefix !== this.client.gateways.guilds.schema.prefix.default)
			await this.client.gateways.guilds.schema.prefix.edit({ default: prefix });

		if (this.client.gateways.guilds.schema.has('disabledCommands')) {
			const languageStore = this.client.languages;
			const commandStore = this.client.commands;
			this.client.gateways.guilds.schema.disabledCommands.setValidator(function (command, guild) { // eslint-disable-line
				if ((cmd => cmd && cmd.guarded)(commandStore.get(command))) throw (guild ? guild.language : languageStore.default).get('COMMAND_CONF_GUARDED', command);
			});
		}

		// Init all the pieces
		await Promise.all(this.client.pieceStores.filter(store => !['providers', 'extendables'].includes(store.name)).map(store => store.init()));
		util.initClean(this.client);
		this.client.ready = true;

		// Init the schedule
		await this.client.schedule.init();

		if (this.client.options.readyMessage !== null)
			this.client.emit('log', util.isFunction(this.client.options.readyMessage) ? this.client.options.readyMessage(this.client) : this.client.options.readyMessage);

		this.client.emit('klasaReady');
	}

	async _prepareSkyra() {
		// Fill the dictionary name for faster user fetching
		for (const user of this.client.users.values()) this.client.dictionaryName.set(user.id, user.username);

		// Sweep
		this.client.tasks.get('cleanup').run();

		const promise = require('../lib/util/Games/Slotmachine').init();

		// Sync any configuration instance
		const table = this.client.providers.default.db.table('localScores');
		const queue = [];

		const { guilds, user: { id: clientID } } = this.client;
		for (const guild of guilds.values()) {
			for (const member of guild.members.values())
				if (member.id !== clientID) queue.push([guild.id, member.id]);
		}
		this.client._skyraReady = true;
		const entries = await table.getAll(...queue, { index: 'guild_user' }).run();
		for (const entry of entries) guilds.get(entry.guildID).members.get(entry.userID).configs._patch(entry);

		await promise;
	}

};
