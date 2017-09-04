const { Command } = require('../../index');
const getRoles = require('../../utils/overwatch/roles');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['MANAGE_ROLES'],
            aliases: ['gr'],
            mode: 1,
            spam: true,
            cooldown: 30,

            usage: '<dps|flex|tank|support>',
            description: 'Sets your priority gamerole (DPS, Flex, Tank, Support).'
        });
    }

    async run(msg, [type], settings, i18n) {
        const _roles = await getRoles(msg, 'gameroles');
        const _role = _roles.get(type);

        if (msg.member.roles.has(_role.id)) throw i18n.get('HAS_ROLE');

        const rmRoles = [];
        for (const rm of _roles.values()) if (rm.id !== _role.id) rmRoles.push(rm.id);

        const roles = [];
        roles.push(_role.id);
        for (const role of msg.member.roles.values()) {
            if (rmRoles.includes(role.id)) continue;
            roles.push(role.id);
        }

        await msg.member.edit({ roles }, '[OVERWATCH] GameRole Profile Management.');
        return msg.send(i18n.get('COMMAND_GAMEROLE_UPDATE', _role.name));
    }

};
