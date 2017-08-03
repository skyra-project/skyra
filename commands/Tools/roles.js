const { Command, Discord: { Embed } } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class Roles extends Command {

    constructor(...args) {
        super(...args, 'roles', {
            guildOnly: true,
            mode: 2,

            usage: '<list|claim|unclaim> [roles:advrole] [...]',
            usageDelim: ' ',
            description: 'List all public roles from a guild, or claim/unclaim them.',
            extendedHelp: Command.strip`
                Public roles? They are roles that are available for everyone, an administrator must configure them throught a setting command.
                
                = Usage =
                Skyra, roles list                   :: I will show you all available public roles.
                Skyra, roles claim <role1, role2>   :: Claim one of more public roles.
                Skyra, roles unclaim <role1, role2> :: Unclaim one of more public roles.
                
                = Format =
                When using claim/unclaim, the roles can be individual, or multiple.
                To claim multiple roles, you must separate them by a comma.
                You can specify which roles by writting their ID, name, or a section of the name.
                
                = Examples =
                Skyra, roles claim Designer, Programmer
                    I will give you both roles, 'Designer' and 'Programmer' (implying they exist and they are available as public roles).
            `
        });
    }

    async run(msg, [action, ...input]) {
        const settings = msg.guild.settings;
        if (action === 'list') return this.list(msg, settings);
        if (!input[0]) throw 'write `Skyra, roles list` to get a list of all roles, or `Skyra, roles claim <role1, role2, ...>` to claim them.';
        const roles = input.join(' ').split(', ');
        return this[action](msg, settings, roles);
    }

    async claim(msg, settings, roles) {
        const message = [];
        const { giveRoles, unlistedRoles, existentRoles, invalidRoles } = this.roleAddCheck(msg, settings, roles);
        if (existentRoles) message.push(`You already have the following roles: \`${existentRoles.join('`, `')}\``);
        if (unlistedRoles) message.push(`The following roles are not public: \`${unlistedRoles.join('`, `')}\``);
        if (invalidRoles) message.push(`Roles not found: \`${invalidRoles.join('`, `')}\``);
        if (giveRoles) {
            if (giveRoles.length === 1) await msg.member.addRole(giveRoles[0]).catch(Command.handleError);
            else await msg.member.addRoles(giveRoles).catch(Command.handleError);
            message.push(`The following roles have been added to your profile: \`${giveRoles.map(role => role.name).join('`, `')}\``);
        }

        return msg.send(message.join('\n'));
    }

    async unclaim(msg, settings, roles) {
        const message = [];
        const { removeRoles, unlistedRoles, nonexistentRoles, invalidRoles } = this.roleRemoveCheck(msg, settings, roles);
        if (nonexistentRoles) message.push(`You do not have the following roles: \`${nonexistentRoles.join('`, `')}\``);
        if (unlistedRoles) message.push(`The following roles are not public: \`${unlistedRoles.join('`, `')}\``);
        if (invalidRoles) message.push(`Roles not found: \`${invalidRoles.join('`, `')}\``);
        if (removeRoles) {
            if (removeRoles.length === 1) await msg.member.removeRole(removeRoles[0]).catch(Command.handleError);
            else await msg.member.removeRoles(removeRoles).catch(Command.handleError);
            message.push(`The following roles have been removed from your profile: \`${removeRoles.map(role => role.name).join('`, `')}\``);
        }

        return msg.send(message.join('\n'));
    }

    roleAddCheck(msg, settings, roles) {
        const giveRoles = [];
        const existentRoles = [];
        const unlistedRoles = [];
        const invalidRoles = [];
        for (let index = 0; index < roles.length; index++) {
            try {
                const checkRole = roles[index];
                if (!settings.publicRoles.includes(checkRole.id)) unlistedRoles.push(checkRole.name);
                else if (msg.member.roles.has(checkRole.id)) existentRoles.push(checkRole.name);
                else giveRoles.push(checkRole);
            } catch (err) {
                invalidRoles.push(roles[index]);
            }
        }

        return {
            giveRoles: giveRoles.length ? giveRoles : null,
            unlistedRoles: unlistedRoles.length ? unlistedRoles : null,
            existentRoles: existentRoles.length ? existentRoles : null,
            invalidRoles: invalidRoles.length ? invalidRoles : null
        };
    }

    roleRemoveCheck(msg, settings, roles) {
        const removeRoles = [];
        const nonexistentRoles = [];
        const unlistedRoles = [];
        const invalidRoles = [];
        for (let index = 0; index < roles.length; index++) {
            try {
                const checkRole = roles[index];
                if (!settings.publicRoles.includes(checkRole.id)) unlistedRoles.push(checkRole.name);
                else if (!msg.member.roles.has(checkRole.id)) nonexistentRoles.push(checkRole.name);
                else removeRoles.push(checkRole);
            } catch (err) {
                invalidRoles.push(roles[index]);
            }
        }

        return {
            removeRoles: removeRoles.length ? removeRoles : null,
            unlistedRoles: unlistedRoles.length ? unlistedRoles : null,
            nonexistentRoles: nonexistentRoles.length ? nonexistentRoles : null,
            invalidRoles: invalidRoles.length ? invalidRoles : null
        };
    }

    list(msg, settings) {
        if (settings.publicRoles.length === 0) throw 'this server does not have a public role configured.';
        const theRoles = settings.publicRoles.map(entry => msg.guild.roles.has(entry) ? msg.guild.roles.get(entry).name : entry);
        const embed = new Embed()
            .setColor(this.msg.color)
            .setTitle(`Public roles for ${this.guild}`)
            .setDescription(theRoles.join('\n'));
        return msg.send({ embed });
    }

};
