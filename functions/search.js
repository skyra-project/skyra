exports.Role = async (query, guild) => {
  switch (query.constructor.name) {
    case "Role": return query;
    case "String": {
      if (/[0-9]{17,21}/.test(query)) {
        const ID = /[0-9]{17,21}/.exec(query)[0];
        const channel = guild.channels.get(ID);
        if (channel) return channel;
        throw `Invalid ID: ${query}`;
      } else {
        query = query.toLowerCase();
        const result = guild.roles.find(m => m.name.toLowerCase() === query) ||
               guild.roles.find(m => m.name.toLowerCase().startsWith(query)) ||
               guild.roles.find(m => m.name.toLowerCase().includes(query));
        if (result) return result;
        throw `Role not found: ${query}`;
      }
    }
    default: throw "Invalid input.";
  }
};

exports.Channel = async (query, guild) => {
  switch (query.constructor.name) {
    case "TextChannel": return query;
    case "String": {
      if (/[0-9]{17,21}/.test(query)) {
        const ID = /[0-9]{17,21}/.exec(query)[0];
        const channel = guild.channels.get(ID);
        if (channel) return channel;
        throw `Invalid ID: ${query}`;
      } else {
        query = query.toLowerCase();
        const result = guild.channels.find(m => m.name.toLowerCase() === query) ||
               guild.channels.find(m => m.name.toLowerCase().startsWith(query)) ||
               guild.channels.find(m => m.name.toLowerCase().includes(query));
        if (result) return result;
        throw `Channel not found: ${query}`;
      }
    }
    default: throw "Invalid input.";
  }
};

exports.User = async (query, guild, strict = false) => {
  switch (query.constructor.name) {
    case "User": return query;
    case "GuildMember": return query.user;
    case "String": {
      let result;
      if (/[0-9]{17,21}/.test(query)) {
        const ID = /[0-9]{17,21}/.exec(query)[0];
        return guild.client.fetchUser(ID).catch(() => { throw `User not found: ${query}`; });
      } else if (strict) {
        if (/.{2,25}#[0-9]{4}/.test(query)) result = guild.members.find(m => m.user.tag === query);
        if (result) return result.user;
        throw "You must provide an mention, ID, or full Discord tag";
      } else {
        result = guild.members.find(m => m.user.tag === query) ||
            this.AdvancedUserSearch(query.toLowerCase(), guild);
        if (result) return result.user;
        throw `User not found: ${query}`;
      }
    }
    default: throw "Invalid input.";
  }
};

exports.AdvancedUserSearch = (query, guild) => {
  const result = guild.members.find(m => m.user.username.toLowerCase() === query) ||
      guild.members.find(m => m.displayName.toLowerCase() === query) ||
      guild.members.find(m => m.user.username.toLowerCase().startsWith(query)) ||
      guild.members.find(m => m.displayName.toLowerCase().startsWith(query)) ||
      guild.members.find(m => m.user.username.toLowerCase().includes(query)) ||
      guild.members.find(m => m.displayName.toLowerCase().includes(query));
  if (result) return result;
  throw `User not found: ${query}`;
};
