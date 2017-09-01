const { Command } = require('../../index');
const getRoles = require('../../utils/overwatch/roles');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['MANAGE_ROLES'],
            aliases: ['sr'],
            mode: 1,
            spam: true,
            cooldown: 30,

            usage: '<rank:integer{500,5000}>',
            description: 'Assigns SR based on the rank given.'
        });
    }

    async run(msg, [sr]) {
        const _roles = await getRoles(msg, 'sr');
        const rank = this.getRank(sr);
        const _role = _roles.get(rank);

        if (msg.member.roles.has(_role.id)) return msg.send(`Your rank has been updated to: **${rank}**`);

        const rmRoles = [];
        for (const rm of _roles.values()) if (rm.id !== _role.id) rmRoles.push(rm.id);

        const roles = [];
        roles.push(_role.id);
        for (const role of msg.member.roles.values()) {
            if (rmRoles.includes(role.id)) continue;
            roles.push(role.id);
        }

        await msg.member.edit({ roles }, '[OVERWATCH] GameSR Profile Management.');
        return msg.send(`Your rank has been updated to: **${rank}**`);
    }

    getRank(sr) {
        if (sr < 1500) return 'bronze';
        if (sr < 2000) return 'silver';
        if (sr < 2500) return 'gold';
        if (sr < 3000) return 'platinum';
        if (sr < 3500) return 'diamond';
        if (sr < 4000) return 'master';
        return 'grandmaster';
    }

};
