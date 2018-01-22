const { Collection } = require('discord.js');
const Profile = require('./OverwatchProfile.js');
let instance = null;

module.exports = class ProfileStore extends Collection {

	constructor(client) {
		super();
		this.client = client;
	}

	create(name) {
		const profile = new Profile(this.client, name);
		super.set(profile.name, profile);
		return profile;
	}

	static createInstance(client) {
		if (instance) return instance;
		instance = new ProfileStore(client);
		return instance;
	}

};
