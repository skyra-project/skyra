const { RawEvent } = require('../index');

module.exports = class extends RawEvent {

	constructor(...args) {
		super(...args, { name: 'USER_UPDATE' });
	}

	async run(user) {
		this.client.dictionaryName.set(user.id, user.username);
	}

	// 	{ id: '80351110224678912',
	// 	  username: 'Nelly',
	// 	  discriminator: '1337',
	// 	  avatar: '8342729096ea3675442027381ff50dfe',
	// 	  verified: true,
	// 	  email: 'nelly@discordapp.com' }

	process(user) {
		return this.client.users.add(user);
	}

};
