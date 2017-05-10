/* eslint-disable no-underscore-dangle */
class RoleList {
  constructor(client, msg, config) {
    Object.defineProperty(this, "_client", { value: client });
    Object.defineProperty(this, "_msg", { value: msg });
    Object.defineProperty(this, "_config", { value: config });
  }

  list() {
    if (!this._config.publicRoles[0]) throw new Error("This server does not have a public role configured.");
    const theRoles = this._config.publicRoles.map(u => this._msg.guild.roles.get(u));
    const embed = new this._client.methods.Embed()
      .setColor(this._msg.color)
      .setTitle(`Public roles for ${this._msg.guild}`)
      .setDescription(theRoles.join("\n"));
    return embed;
  }

  async roleCheck(roles) {
    const giveRoles = [];
    const removeRoles = [];
    const invalidRoles = [];
    for (let i = 0; i < roles.length; i++) {
      const r = roles[i];
      this._client.search.Role(r, this._msg.guild)
        .then((checkRole) => {
          if (!this._config.publicRoles.includes(checkRole.id)) invalidRoles.push(r);
          else if (this._msg.member.roles.has(checkRole.id)) giveRoles.push(checkRole);
          else removeRoles.push(checkRole.id);
        })
        .catch(() => invalidRoles.push(r));
    }

    return ({
      giveRoles: giveRoles.length ? giveRoles : null,
      removeRoles: removeRoles.length ? removeRoles : null,
      invalidRoles: invalidRoles.length ? invalidRoles : null,
    });
  }
}

exports.run = async (client, msg, [list, ...roles]) => {
  const roleList = new RoleList(client, msg);
  const conf = msg.guild.configs;
  if (list) {
    await msg.sendEmbed(roleList.list(conf));
  } else {
    if (!roles[0]) throw new Error(`Dear ${msg.author}, write \`${conf.prefix}claim list\` to get a list of all roles, or do \`${conf.prefix}claim <role1, role2, ...>\``);
    const roleCheck = await roleList.roleCheck(roles);

    const mess = [];
    if (roleCheck.invalidRoles) mess.push(`You can't have nonexistent roles: \`${roleCheck.invalidRoles.join("`, `")}\``);
    if (roleCheck.giveRoles) mess.push(`You don't have the following roles: \`${roleCheck.giveRoles.map(r => r.name).join("`, `")}\``);
    if (roleCheck.removeRoles) {
      const removeRoles = roleCheck.removeRoles;
      if (removeRoles.length === 1) await msg.member.removeRole(removeRoles[0]);
      else await msg.member.removeRoles(removeRoles);
      mess.push(`The following roles have been added to your profile: \`${removeRoles.map(r => msg.guild.roles.get(r).name).join("`, `")}\``);
    }
    await msg.send(mess || "??");
  }
};

exports.conf = {
  enabled: false,
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
  description: "Leave a public role.",
  usage: "[list] [roles:str] [...]",
  usageDelim: ", ",
  extendedHelp: "",
};
