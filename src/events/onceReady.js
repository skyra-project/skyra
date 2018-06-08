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

		this._prepareSkyra();
		this.client.configs = this.client.gateways.clientStorage.get(this.client.user.id, true);
		await this.client.gateways.sync(true);

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

	_prepareSkyra() {
		// Fill the dictionary name for faster user fetching
		for (const user of this.users.values()) this.dictionaryName.set(user.id, user.username);

		// Sweep
		this.tasks.get('cleanup').run();
		this.client._skyraReady = true;

		// Sync any configuration instance
		for (const guild of this.guilds.values()) {
			for (const member of guild.members.values())
				member.configs.sync();
		}
	}

};
