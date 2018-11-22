import { RawEvent } from '../index';

export default class extends RawEvent {

	// 	{ id: '80351110224678912',
	// 	  username: 'Nelly',
	// 	  discriminator: '1337',
	// 	  avatar: '8342729096ea3675442027381ff50dfe',
	// 	  verified: true,
	// 	  email: 'nelly@discordapp.com' }

	run(data) {
		const user = this.client.users.get(data.id);
		// @ts-ignore
		if (user) user._patch(data);
	}

};
