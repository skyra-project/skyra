import { Client } from 'klasa';

export default Client.defaultClientSchema
	.add('commandUses', 'Integer', { 'default': 0, 'configurable': false })
	.add('boosts_guilds', 'String', { array: true, min: 17, max: 19 })
	.add('boosts_users', 'User', { array: true });
