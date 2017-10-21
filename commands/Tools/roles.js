const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            botPerms: ['MANAGE_ROLES'],
            mode: 2,
            cooldown: 5,

            usage: '<list|claim|unclaim> [roles:string] [...]',
            usageDelim: ' ',
            description: 'List all public roles from a guild, or claim/unclaim them.',
            extendedHelp: Command.strip`
                Public roles? They are roles that are available for everyone, an administrator must configure them throught a setting command.

                ⚙ | ***Explained usage***
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

    async run(msg, [action, ...input], settings, i18n) {
        if (action === 'list') return this.list(msg, settings, i18n);
        if (!input[0]) throw 'write `Skyra, roles list` to get a list of all roles, or `Skyra, roles claim <role1, role2, ...>` to claim them.';
        const roles = input.join(' ').split(/, */).map(entry => entry.trimRight());
        return this[action](msg, settings, roles, i18n);
    }

    async claim(msg, settings, roles, i18n) {
        const message = [];
        const { giveRoles, unlistedRoles, existentRoles, invalidRoles } = await this.roleAddCheck(msg, settings, roles);
        if (existentRoles) message.push(i18n.get('COMMAND_ROLES_CLAIM_EXISTENT', existentRoles.join('`, `')));
        if (unlistedRoles) message.push(i18n.get('COMMAND_ROLES_NOT_PUBLIC', unlistedRoles.join('`, `')));
        if (invalidRoles) message.push(i18n.get('COMMAND_ROLES_NOT_FOUND', invalidRoles.join('`, `')));
        if (giveRoles) {
            if (giveRoles.length === 1) await msg.member.addRole(giveRoles[0]).catch(Command.handleError);
            else await msg.member.addRoles(giveRoles).catch(Command.handleError);
            message.push(i18n.get('COMMAND_ROLES_CLAIM_GIVEN', giveRoles.map(role => role.name).join('`, `')));
        }

        return msg.send(message.join('\n'));
    }

    async unclaim(msg, settings, roles, i18n) {
        const message = [];
        const { removeRoles, unlistedRoles, nonexistentRoles, invalidRoles } = await this.roleRemoveCheck(msg, settings, roles);
        if (nonexistentRoles) message.push(i18n.get('COMMAND_ROLES_UNCLAIM_UNEXISTENT', nonexistentRoles.join('`, `')));
        if (unlistedRoles) message.push(i18n.get('COMMAND_ROLES_NOT_PUBLIC', unlistedRoles.join('`, `')));
        if (invalidRoles) message.push(i18n.get('COMMAND_ROLES_NOT_FOUND', invalidRoles.join('`, `')));
        if (removeRoles) {
            if (removeRoles.length === 1) await msg.member.removeRole(removeRoles[0]).catch(Command.handleError);
            else await msg.member.removeRoles(removeRoles).catch(Command.handleError);
            message.push(i18n.get('COMMAND_ROLES_UNCLAIM_REMOVED', removeRoles.map(role => role.name).join('`, `')));
        }

        return msg.send(message.join('\n'));
    }

    async roleAddCheck(msg, settings, roles) {
        const giveRoles = [];
        const existentRoles = [];
        const unlistedRoles = [];
        const invalidRoles = [];
        for (const role of roles) {
            const res = await this.client.handler.search.role(role, msg);

            if (res === null) invalidRoles.push(role);
            else if (!settings.roles.public.includes(res.id)) unlistedRoles.push(res.name);
            else if (msg.member.roles.has(res.id)) existentRoles.push(res.name);
            else giveRoles.push(res);
        }

        return {
            giveRoles: giveRoles.length ? giveRoles : null,
            unlistedRoles: unlistedRoles.length ? unlistedRoles : null,
            existentRoles: existentRoles.length ? existentRoles : null,
            invalidRoles: invalidRoles.length ? invalidRoles : null
        };
    }

    async roleRemoveCheck(msg, settings, roles) {
        const removeRoles = [];
        const nonexistentRoles = [];
        const unlistedRoles = [];
        const invalidRoles = [];
        for (const role of roles) {
            const res = await this.client.handler.search.role(role, msg);

            if (res === null) invalidRoles.push(role);
            else if (!settings.roles.public.includes(res.id)) unlistedRoles.push(res.name);
            else if (!msg.member.roles.has(res.id)) nonexistentRoles.push(res.name);
            else removeRoles.push(res);
        }

        return {
            removeRoles: removeRoles.length ? removeRoles : null,
            unlistedRoles: unlistedRoles.length ? unlistedRoles : null,
            nonexistentRoles: nonexistentRoles.length ? nonexistentRoles : null,
            invalidRoles: invalidRoles.length ? invalidRoles : null
        };
    }

    list(msg, settings, i18n) {
        if (settings.roles.public.length === 0)
            throw i18n.get('COMMAND_ROLES_LIST_EMPTY');

        const theRoles = settings.roles.public.map(entry => msg.guild.roles.has(entry) ? msg.guild.roles.get(entry).name : entry);

        const embed = new MessageEmbed()
            .setColor(msg.color)
            .setTitle(i18n.get('COMMAND_ROLES_LIST_TITLE', msg.guild))
            .setDescription(theRoles.join('\n'));
        return msg.send({ embed });
    }

};
