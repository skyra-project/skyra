const { Command, overwatch: { roles: getRoles } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['MANAGE_ROLES'],
			aliases: ['platform'],
			mode: 1,
			spam: true,
			cooldown: 30,

			usage: '[remove] <pc|xbox|ps4>',
			usageDelim: ' ',
			description: 'Sets your platform (PC, XBOX, PS4).'
		});
	}

	async run(msg, [remove, type], settings, i18n) {
		const _roles = await getRoles(msg, 'platform');
		const _role = _roles.get(type);
		const hasRole = msg.member.roles.has(_role.id);

		if (typeof remove !== 'undefined') {
			if (!hasRole) throw i18n.get('MISSING_ROLE');

			await msg.member.removeRole(_role.id, '[OVERWATCH] GamePlatform Profile Management.');
			return msg.send(i18n.get('COMMAND_PLATFORM_REMOVED', _role.name));
		} else {
			if (hasRole) throw i18n.get('HAS_ROLE');
			await msg.member.addRole(_role.id, '[OVERWATCH] GamePlatform Profile Management.');
			return msg.send(i18n.get('COMMAND_PLATFORM_UPDATED', _role.name));
		}
	}

};
