const { Role: fetchRole } = require("../../functions/search");

class RoleList {
    constructor(msg) {
        Object.defineProperty(this, "msg", { value: msg });
        Object.defineProperty(this, "guild", { value: msg.guild });
        Object.defineProperty(this, "client", { value: msg.client });
        Object.defineProperty(this, "config", { value: msg.guild.settings });
    }

    get list() {
        if (!this.config.publicRoles[0]) throw "This server does not have a public role configured.";
        const theRoles = this.config.publicRoles.map(u => (this.guild.roles.has(u) ? this.guild.roles.get(u).name : u));
        return new this.client.methods.Embed()
      .setColor(this.msg.color)
      .setTitle(`Public roles for ${this.guild}`)
      .setDescription(theRoles.join("\n"));
    }

    roleAddCheck(roles) {
        const giveRoles = [];
        const existentRoles = [];
        const unlistedRoles = [];
        const invalidRoles = [];
        for (let index = 0; index < roles.length; index++) {
            try {
                const checkRole = fetchRole(roles[index], this.guild);
                if (!this.config.publicRoles.includes(checkRole.id)) unlistedRoles.push(checkRole.name);
                else if (this.msg.member.roles.has(checkRole.id)) existentRoles.push(checkRole.name);
                else giveRoles.push(checkRole);
            } catch (e) {
                invalidRoles.push(roles[index]);
            }
        }

        return {
            giveRoles: giveRoles.length ? giveRoles : null,
            unlistedRoles: unlistedRoles.length ? unlistedRoles : null,
            existentRoles: existentRoles.length ? existentRoles : null,
            invalidRoles: invalidRoles.length ? invalidRoles : null,
        };
    }

    roleRemoveCheck(roles) {
        const removeRoles = [];
        const nonexistentRoles = [];
        const unlistedRoles = [];
        const invalidRoles = [];
        for (let index = 0; index < roles.length; index++) {
            try {
                const checkRole = fetchRole(roles[index], this.guild);
                if (!this.config.publicRoles.includes(checkRole.id)) unlistedRoles.push(checkRole.name);
                else if (!this.msg.member.roles.has(checkRole.id)) nonexistentRoles.push(checkRole.name);
                else removeRoles.push(checkRole);
            } catch (e) {
                invalidRoles.push(roles[index]);
            }
        }

        return {
            removeRoles: removeRoles.length ? removeRoles : null,
            unlistedRoles: unlistedRoles.length ? unlistedRoles : null,
            nonexistentRoles: nonexistentRoles.length ? nonexistentRoles : null,
            invalidRoles: invalidRoles.length ? invalidRoles : null,
        };
    }
}

exports.run = async (client, msg, [action, ...input]) => {
    const roleList = new RoleList(msg);
    const conf = msg.guild.settings;
    if (action === "list") return msg.send({ embed: roleList.list });
    if (!input[0]) throw `write ( ${conf.prefix}roles list ) to get a list of all roles, or do ( ${conf.prefix}claim <role1, role2, ...> ) to claim them.`;
    const roles = input.join(" ").split(", ");

    const mess = [];
    if (action === "claim") {
        const { giveRoles, unlistedRoles, existentRoles, invalidRoles } = roleList.roleAddCheck(roles);
        if (existentRoles) mess.push(`You already have the following roles: \`${existentRoles.join("`, `")}\``);
        if (unlistedRoles) mess.push(`The following roles are not public: \`${unlistedRoles.join("`, `")}\``);
        if (invalidRoles) mess.push(`Roles not found: \`${invalidRoles.join("`, `")}\``);
        if (giveRoles) {
            if (giveRoles.length === 1) await msg.member.addRole(giveRoles[0]);
            else await msg.member.addRoles(giveRoles);
            mess.push(`The following roles have been added to your profile: \`${giveRoles.map(r => r.name).join("`, `")}\``);
        }
    } else if (action === "unclaim") {
        const { removeRoles, unlistedRoles, nonexistentRoles, invalidRoles } = roleList.roleRemoveCheck(roles);
        if (nonexistentRoles) mess.push(`You do not have the following roles: \`${nonexistentRoles.join("`, `")}\``);
        if (unlistedRoles) mess.push(`The following roles are not public: \`${unlistedRoles.join("`, `")}\``);
        if (invalidRoles) mess.push(`Roles not found: \`${invalidRoles.join("`, `")}\``);
        if (removeRoles) {
            if (removeRoles.length === 1) await msg.member.removeRole(removeRoles[0]);
            else await msg.member.removeRoles(removeRoles);
            mess.push(`The following roles have been removed from your profile: \`${removeRoles.map(r => r.name).join("`, `")}\``);
        }
    }

    return msg.send(mess.length ? mess.join("\n") : "??");
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 10,
};

exports.help = {
    name: "roles",
    description: "List all public roles from a guild, or claim/unclaim them.",
    usage: "<list|claim|unclaim> [roles:string] [...]",
    usageDelim: " ",
    extendedHelp: [
        "Public roles? They are roles that are available for everyone, an administrator must configure them throught a setting command.",
        "",
        "= Usage =",
        "Skyra, roles list                   :: I will show you all available public roles.",
        "Skyra, roles claim <role1, role2>   :: Claim one of more public roles.",
        "Skyra, roles unclaim <role1, role2> :: Unclaim one of more public roles.",
        "",
        "= Format =",
        "When using claim/unclaim, the roles can be individual, or multiple.",
        "To claim multiple roles, you must separate them by a comma.",
        "You can specify which roles by writting their ID, name, or a section of the name.",
        "",
        "= Examples =",
        "Skyra, roles claim Designer, Programmer",
        "❯❯ I'll give you both roles, 'Designer' and 'Programmer' (implying they exist and they are available as public roles).",
    ].join("\n"),
};
