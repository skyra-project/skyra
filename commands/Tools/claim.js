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
    const giveRoles = [];
    const existentRoles = [];
    const unlistedRoles = [];
    const invalidRoles = [];
    await Promise.all(roles.map(r => new Promise(async (resolve) => {
      try {
        const checkRole = await this._client.funcs.search.Role(r, this._guild);
        if (!this._config.publicRoles.includes(checkRole.id)) unlistedRoles.push(checkRole.name);
        else if (this._msg.member.roles.has(checkRole.id)) existentRoles.push(checkRole.name);
        else giveRoles.push(checkRole.id);
      } catch (e) {
        invalidRoles.push(r);
      } finally {
        resolve();
      }
    })));
    return {
      giveRoles: giveRoles.length ? giveRoles : null,
      unlistedRoles: unlistedRoles.length ? unlistedRoles : null,
      existentRoles: existentRoles.length ? existentRoles : null,
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
  const roleCheck = await roleList.roleCheck(roles);

  const mess = [];
  if (roleCheck.existentRoles) mess.push(`You already have the following roles: \`${roleCheck.existentRoles.join("`, `")}\``);
  if (roleCheck.unlistedRoles) mess.push(`The following roles are not public: \`${roleCheck.unlistedRoles.join("`, `")}\``);
  if (roleCheck.invalidRoles) mess.push(`Roles not found: \`${roleCheck.invalidRoles.join("`, `")}\``);
  if (roleCheck.giveRoles) {
    const giveRoles = roleCheck.giveRoles;
    if (giveRoles.length === 1) await msg.member.addRole(giveRoles[0]);
    else await msg.member.addRoles(giveRoles);
    mess.push(`The following roles have been added to your profile: \`${giveRoles.map(r => msg.guild.roles.get(r).name).join("`, `")}\``);
  }
  return msg.send(mess.length ? mess.join("\n") : "??");
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["getrole"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 10,
};

exports.help = {
  name: "claim",
  description: "Get a public role.",
  usage: "[--list] [roles:str] [...]",
  usageDelim: ", ",
  extendedHelp: "",
};
