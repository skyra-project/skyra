const { Message, Role } = require('discord.js'); // eslint-disable-line no-unused-vars

const required = {
	gameroles: [
		'DPS',
		'Flex',
		'Tank',
		'Support'
	],
	sr: [
		'Bronze',
		'Silver',
		'Gold',
		'Platinum',
		'Diamond',
		'Master',
		'GrandMaster'
	],
	platform: [
		'PC',
		'XBOX',
		'PS4'
	],
	region: [
		'Americas',
		'Europe',
		'Asia'
	]
};

const createRoles = async (guild, roles, map) => {
	for (const name of roles) {
		await guild.createRole({
			data: { name },
			reason: 'Created role for Overwatch Module usage.'
		}).then(role => map.set(name.toLowerCase(), role));
	}
};

/**
 * @param {Message} msg A message instance.
 * @param {('gameroles'|'sr'|'platform'|'region')} type The type.
 * @return {Map<string, Role>}
 */
module.exports = async (msg, type) => {
	if (msg instanceof Message === false) throw 'The argument \'msg\' must be a Message instance.';
	const roles = msg.guild.roles;
	const check = required[type];

	const missing = [];
	const output = new Map();

	for (let i = 0; i < check.length; i++) {
		const role = roles.find('name', check[i]);
		if (!role) missing.push(check[i]);
		else output.set(check[i].toLowerCase(), role);
	}

	if (missing.length > 0) {
		const permission = await msg.hasLevel(3);
		if (permission !== true) throw `I have found several missing role${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}. Ask an administrator to set them up.`;
		await msg.prompt(`I found several missing role${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}. Do you want me to create them?`)
			.then(
				() => createRoles(msg.guild, missing, output),
				() => { throw 'Alright, but keep in mind this is needed for this command to run.'; }
			);
	}

	return output;
};
