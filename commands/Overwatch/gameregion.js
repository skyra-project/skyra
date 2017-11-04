const { Command, overwatch: { roles: getRoles } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['MANAGE_ROLES'],
			aliases: ['region'],
			mode: 1,
			spam: true,
			cooldown: 30,

			usage: '[remove] <americas|europe|asia>',
			usageDelim: ' ',
			description: 'Sets your region (Americas, Europe, Asia).'
		});
	}

	async run(msg, [remove, type], settings, i18n) {
		const _roles = await getRoles(msg, 'region');
		const _role = _roles.get(type);
		const hasRole = msg.member.roles.has(_role.id);

		if (typeof remove !== 'undefined') {
			if (!hasRole) throw i18n.get('MISSING_ROLE');

			await msg.member.removeRole(_role.id, '[OVERWATCH] GameRegion Profile Management.');
			return msg.send(i18n.get('COMMAND_REGION_REMOVED', _role.name));
		} else {
			if (hasRole) throw i18n.get('HAS_ROLE');

			await msg.member.addRole(_role.id, '[OVERWATCH] GameRegion Profile Management.');
			return msg.send(i18n.get('COMMAND_REGION_UPDATED', _role.name));
		}
	}

};
