/* eslint-disable no-underscore-dangle, no-confusing-arrow, no-throw-literal */
class RoleList {
  constructor(msg) {
    Object.defineProperty(this, "_msg", { value: msg });
    Object.defineProperty(this, "_guild", { value: msg.guild });
    Object.defineProperty(this, "_client", { value: msg.client });
    Object.defineProperty(this, "_config", { value: msg.guild.configs });
  }

  get list() {
    if (!this._config.publicRoles[0]) throw "This server does not have a public role configured.";
    const theRoles = this._config.publicRoles.map(u => this._guild.roles.get(u) ? this._guild.roles.get(u).name : u);
    return new this._client.methods.Embed()
      .setColor(this._msg.color)
      .setTitle(`Public roles for ${this._guild}`)
      .setDescription(theRoles.join("\n"));
  }

  async roleCheck(roles) {
    const removeRoles = [];
    const nonexistentRoles = [];
    const unlistedRoles = [];
    const invalidRoles = [];
    await Promise.all(roles.map(r => new Promise(async (resolve) => {
      try {
        const checkRole = await this._client.funcs.search.Role(r, this._guild);
        if (!this._config.publicRoles.includes(checkRole.id)) unlistedRoles.push(checkRole.name);
        else if (!this._msg.member.roles.has(checkRole.id)) nonexistentRoles.push(checkRole.name);
        else removeRoles.push(checkRole.id);
      } catch (e) {
        invalidRoles.push(r);
      } finally {
        resolve();
      }
    })));
    return {
      removeRoles: removeRoles.length ? removeRoles : null,
      unlistedRoles: unlistedRoles.length ? unlistedRoles : null,
      nonexistentRoles: nonexistentRoles.length ? nonexistentRoles : null,
      invalidRoles: invalidRoles.length ? invalidRoles : null,
    };
  }
}

exports.run = async (client, msg, [list, ...roles]) => {
  const roleList = new RoleList(msg);
  const conf = msg.guild.configs;
  if (list) {
    return msg.send({ embed: roleList.list });
  }
  if (!roles[0]) throw `write ( ${conf.prefix}claim list ) to get a list of all roles, or do ( ${conf.prefix}claim <role1, role2, ...> ) to claim them.`;
  const { removeRoles, unlistedRoles, nonexistentRoles, invalidRoles } = await roleList.roleCheck(roles);

  const mess = [];
  if (nonexistentRoles) mess.push(`You already have the following roles: \`${nonexistentRoles.join("`, `")}\``);
  if (unlistedRoles) mess.push(`The following roles are not public: \`${unlistedRoles.join("`, `")}\``);
  if (invalidRoles) mess.push(`Roles not found: \`${invalidRoles.join("`, `")}\``);
  if (removeRoles) {
    if (removeRoles.length === 1) await msg.member.removeRole(removeRoles[0]);
    else await msg.member.removeRoles(removeRoles);
    mess.push(`The following roles have been added to your profile: \`${removeRoles.map(r => msg.guild.roles.get(r).name).join("`, `")}\``);
  }
  return msg.send(mess.length ? mess.join("\n") : "??");
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["leaverole"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 10,
};

exports.help = {
  name: "unclaim",
  description: "Remove a public role from your profile.",
  usage: "[--list] [roles:str] [...]",
  usageDelim: ", ",
  extendedHelp: "",
};
