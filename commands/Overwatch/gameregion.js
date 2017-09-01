const { Command } = require('../../index');
const getRoles = require('../../utils/overwatch/roles');

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

    async run(msg, [remove = null, type]) {
        const _roles = await getRoles(msg, 'region');
        const _role = _roles.get(type);
        const hasRole = msg.member.roles.has(_role.id);

        if (remove !== null) {
            if (!hasRole) throw 'You do not have this role.';

            await msg.member.removeRole(_role.id, '[OVERWATCH] GameRegion Profile Management.');
            return msg.send(`Your game region (**${_role.name}**) has been removed.`);
        } else {
            if (hasRole) throw 'You already have this role.';

            await msg.member.addRole(_role.id, '[OVERWATCH] GameRegion Profile Management.');
            return msg.send(`Your game region has been updated to: **${_role.name}**`);
        }
    }

};
