import { Client } from 'klasa';

export default Client.defaultClientSchema
	.add('commandUses', 'Integer', { 'default': 0, 'configurable': false })
	.add('boosts_guilds', 'String', { array: true, minimum: 17, maximum: 19 })
	.add('boosts_users', 'User', { array: true });
