exports.parse = (data) => {
  const args = data.split(" ");
  if (!["list", "add", "remove", "setting"].includes(args[0])) throw "Missing a required option: (list, add, remove, setting)";
  const action = args[0];
  args.shift();
  let amount;
  if (/\d{1,7}/.test(args[0])) {
    amount = parseInt(args[0]);
    args.shift();
  }
  const input = args;

  return [action, amount, input];
};

exports.run = async (client, msg, [data]) => {
  const [action, amount, input] = this.parse(data);
  switch (action) {
    case "list": {
      if (!msg.guild.configs.autoroles.length) throw "there are no autoroles configured for this guild.";
      return msg.send(msg.guild.configs.autoroles.map((obj) => {
        const role = msg.guild.roles.get(obj.id);
        return role ? `${role.name} (${role.id}):: ${obj.points}` : `Unknown role${obj.id}`;
      }).join("\n"), { code: "asciidoc" });
    }
    case "add": {
      if (!amount) throw "you must assign an amount of points for the new autorole.";
      if (!input[0]) throw "you must type a role.";
      const role = client.funcs.search.Role(input.join(" "), msg.guild);
      if (!role) throw "this role does not exist.";
      await client.rethink.append("guilds", msg.guild.id, "autoroles", { id: role.id, points: amount });
      await msg.guild.configs.sync();
      return msg.send(`Added new autorole: ${role.name} (${role.id}). Points required: ${amount}`); }
    case "remove": {
      if (!input[0]) throw "you must type a role.";
      const isSnowflake = /\d{17,21}/.test(input.join(" "));
      let role;
      try {
        role = client.funcs.search.Role(input.join(" "), msg.guild);
      } catch (e) {
        role = isSnowflake ? { name: "Unknown", id: input.join(" ") } : null;
      }
      if (!role) throw "this role does not exist.";
      const retrieved = msg.guild.configs.autoroles.find(ar => ar.id === role.id);
      if (!retrieved) throw "this role is not configured as an autorole.";
      else {
        await client.rethink.removeFromArray("guilds", msg.guild.id, "autoroles", role.id);
        await msg.guild.configs.sync();
        return msg.send(`Removed the autorole: ${role.name} (${role.id}), which required ${retrieved.points} points.`);
      }
    }
    case "setting": return this.settingHandler(client, msg, input);
    default: throw new Error(`unknown action: ${action}`);
  }
};

exports.settingHandler = async (client, msg, [type, action, ...value]) => {
  if (!type || !["initialrole", "ignorechannels"].includes(type.toLowerCase())) throw "you must select one of the following settings: `initialRole`|`ignoreChannels`";
  switch (type.toLowerCase()) {
    case "initialrole": {
      if (!action || !["get", "set", "remove"].includes(action.toLowerCase())) throw "you must select one of the following actions: `set`|`remove`";
      if (action.toLowerCase() === "get") {
        const initialRole = msg.guild.configs.initialRole;
        return msg.send(initialRole ? `Current initial role: ${msg.guild.roles.get(initialRole).name}` : "No initial role set.");
      } else if (action.toLowerCase() === "set") {
        if (!value[0]) throw "you must specify a Role.";
        const role = client.funcs.search.Role(value.join(" "), msg.guild);
        await msg.guild.configs.update({ initialRole: role.id });
        return msg.send(`✅ Success | New **initialRole** set to ${role.name}.`);
      }
      await msg.guild.configs.update({ initialRole: null });
      return msg.send("✅ Success | Removed the value for **initialRole**.");
    }
    case "ignorechannels": {
      if (!action || !["list", "add", "remove"].includes(action.toLowerCase())) throw "you must select one of the following actions: `add`|`remove`";
      if (action.toLowerCase() === "list") {
        if (!msg.guild.configs.ignoreChannels.length) throw "there are no autoroles configured for this guild.";
        return msg.send(msg.guild.configs.ignoreChannels.map((c) => {
          const channel = msg.guild.channels.get(c);
          return channel ? `${channel.name} (${channel.id})` : `Unknown channel: ${c}`;
        }).join("\n"), { code: true });
      }
      if (!value[0]) throw "you must specify a Channel.";
      const channel = client.funcs.search.Channel(value.join(" "), msg.guild);
      const ignoreChannels = msg.guild.configs.ignoreChannels;
      if (action.toLowerCase() === "add") {
        if (ignoreChannels.includes(channel.id)) throw "this channel is already ignored.";
        await client.rethink.append("guilds", msg.guild.id, "ignoreChannels", channel.id);
        await msg.guild.configs.sync();
        return msg.send(`✅ Success | Now I won't give points in the channel ${channel.name}.`);
      }
      if (!ignoreChannels.length) throw "this server does not have an ignored channel";
      if (!ignoreChannels.includes(channel.id)) throw "this channel is not ignored.";
      await msg.guild.configs.update({ ignoreChannels: ignoreChannels.filter(c => c !== channel.id) });
      return msg.send(`✅ Success | Now I'll listen the channel ${channel.name}.`);
    }
    default: throw new Error(`Unknown type: ${action}`);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["autoroles", "levelrole", "lvlrole"],
  permLevel: 3,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 5,
};

exports.help = {
  name: "autorole",
  description: "(ADM) List or configure the autoroles for a guild.",
  usage: "<input:string>",
  usageDelim: "",
  extendedHelp: [
    "Autoroles? They are roles that are available for everyone, and automatically given when they reach an amound of (local) points, an administrator must configure them throught a setting command.",
    "",
    "= Usage =",
    "Skyra, autorole list                :: I will show you all the autoroles.",
    "Skyra, autorole add <amount> <role> :: Add a new autorole.",
    "Skyra, autorole remove <role>       :: Remove an autorole from the list.",
    "",
    "= Reminder =",
    "The current system grants a random amount of points between 4 and 8 points, for each post with a 1 minute cooldown.",
    "",
    "= Setting|ignoreChannels Usage =",
    "The ignoreChannel list is a list of channels Skyra doesn't listen when giving points.",
    "Skyra, autorole setting ignorechannels list <channel>   :: Get a list of all channels from the ignoreChannels list.",
    "Skyra, autorole setting ignorechannels add <channel>    :: Add channels to the ignoreChannels list.",
    "Skyra, autorole setting ignorechannels remove <channel> :: Remove channels to the ignoreChannels list.",
    "",
    "= Setting|initialRole Usage =",
    "The initialRole role is a role that Skyra will assign automatically to all new members.",
    "Skyra, autorole setting initialrole get           :: Check what is the current initial role.",
    "Skyra, autorole setting initialrole set <role>    :: Set the initial role.",
    "Skyra, autorole setting initialrole remove <role> :: Remove the initial role.",
    "",
    "= Examples =",
    "Skyra, autorole add 20000 Trusted Member",
    "❯❯ I'll start auto-assigning the role 'Trusted Member' to anyone who has at least 20.000 points (based on local points).",
  ].join("\n"),
};
