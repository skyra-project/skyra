import { Event, klasaUtil } from '../index';

export default class extends Event {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			once: true,
			event: 'ready'
		});
	}

	async run() {
		await this.client.fetchApplication();
		if (!this.client.options.ownerID) this.client.options.ownerID = this.client.application.owner.id;

		this.client.settings = this.client.gateways.clientStorage.get(this.client.user.id, true);
		// Added for consistency with other datastores, Client#clients does not exist
		// @ts-ignore
		this.client.gateways.clientStorage.cache.set(this.client.user.id, this.client);
		this._preload();
		await Promise.all([
			this._prepareSkyra(),
			this.client.gateways.sync()
		]);

		// Init all the pieces
		await Promise.all(this.client.pieceStores.filter(store => !['providers', 'extendables'].includes(store.name)).map(store => store.init()));
		// @ts-ignore
		klasaUtil.initClean(this.client);
		this.client.ready = true;

		// Init the schedule
		await this.client.schedule.init();

		if (this.client.options.readyMessage !== null)
			// @ts-ignore
			this.client.emit('log', klasaUtil.isFunction(this.client.options.readyMessage) ? this.client.options.readyMessage(this.client) : this.client.options.readyMessage);

		this.client.emit('klasaReady');
	}

	_preload() {
		// Populate the usernames
		for (const user of this.client.users.values())
			this.client.usernames.set(user.id, user.tag);

		// Clear all users
		this.client.users.clear();

		// Fill the dictionary name for faster user fetching
		for (const guild of this.client.guilds.values()) {
			const { me } = guild;

			// Populate the snowflakes
			for (const member of guild.members.values())
				guild.memberSnowflakes.add(member.id);

			// Clear all members
			guild.members.clear();
			guild.members.set(me.id, me);
			guild.presences.clear();
			guild.emojis.clear();
			// @ts-ignore
			guild.voiceStates.clear();
		}
	}

	async _prepareSkyra() {
		import promise from '../lib/util/Games/Slotmachine').init(;

		// Sync any settings instance
		const table = this.client.providers.default.db.table('localScores');
		const queue = [];

		const { guilds, user: { id: clientID } } = this.client;
		for (const guild of guilds.values()) {
			for (const member of guild.members.values())
				if (member.id !== clientID) queue.push([guild.id, member.id]);
		}
		this.client._skyraReady = true;
		// @ts-ignore
		const entries = await table.getAll(...queue, { index: 'guild_user' }).run();
		// @ts-ignore
		for (const entry of entries) guilds.get(entry.guildID).members.get(entry.userID).settings._patch(entry);

		await promise;
	}

};
