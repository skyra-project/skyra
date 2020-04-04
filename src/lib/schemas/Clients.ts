import { Client } from 'klasa';

export default Client.defaultClientSchema
	.add('commandUses', 'Integer', { 'default': 0, 'configurable': false })
	.add('boosts_guilds', 'Snowflake', { array: true })
	.add('boosts_users', 'User', { array: true });
