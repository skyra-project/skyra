const { Command } = require('../../index');
const getRoles = require('../../utils/overwatch/roles');

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

    async run(msg, [remove = null, type]) {
        const _roles = await getRoles(msg, 'platform');
        const _role = _roles.get(type);
        const hasRole = msg.member.roles.has(_role.id);

        if (remove !== null) {
            if (!hasRole) throw 'You do not have this role.';

            await msg.member.removeRole(_role.id, '[OVERWATCH] GamePlatform Profile Management.');
            return msg.send(`Your game platform (**${_role.name}**) has been removed.`);
        } else {
            if (hasRole) throw 'You already have this role.';

            await msg.member.addRole(_role.id, '[OVERWATCH] GamePlatform Profile Management.');
            return msg.send(`Your game platform has been updated to: **${_role.name}**`);
        }
    }

};
