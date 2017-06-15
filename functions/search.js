/* SuperFast Search */
const startsWith = (prefix, str) => {
  for (let i = prefix.length - 1; i >= 0; i--) {
    if (str[i] === prefix[i]) continue;
    return false;
  }
  return true;
};
/* eslint-disable no-restricted-syntax */
const find = (map, prop, value) => {
  for (const iteration of map.values()) if (iteration[prop].toLowerCase() === value.toLowerCase()) return iteration;
  return null;
};
const findDepth = (map, prop, subprop, value) => {
  for (const iteration of map.values()) if (iteration[prop][subprop].toLowerCase() === value.toLowerCase()) return iteration;
  return null;
};
const includes = (property, chunk) => property.includes(chunk);

/* Methods */
exports.Role = (query, guild) => {
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
        const result = find(guild.roles, "name", query) ||
               find(guild.roles, "name", query) ||
               guild.roles.find(m => includes(m.name.toLowerCase(), query));
        if (result) return result;
        throw `Role not found: ${query}`;
      }
    }
    default: throw "Invalid input.";
  }
};

exports.Channel = (query, guild) => {
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
        const result = find(guild.channels, "name", query) ||
               guild.channels.find(m => startsWith(m.name.toLowerCase(), query)) ||
               guild.channels.find(m => includes(m.name.toLowerCase(), query));
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
        if (/.{2,25}#[0-9]{4}/.test(query)) result = findDepth(guild.members, "user", "tag", query);
        if (result) return result.user;
        throw "You must provide an mention, ID, or full Discord tag";
      } else {
        result = findDepth(guild.members, "user", "tag", query) ||
            this.AdvancedUserSearch(query, guild);
        if (result) return result.user;
        throw `User not found: ${query}`;
      }
    }
    default: throw "Invalid input.";
  }
};

exports.AdvancedUserSearch = (query, guild) => {
  const result = findDepth(guild.members, "user", "username", query) ||
      find(guild.members, "displayName", query) ||
      guild.members.find(m => startsWith(m.user.username, query.toLowerCase())) ||
      guild.members.find(m => startsWith(m.displayName, query.toLowerCase())) ||
      guild.members.find(m => includes(m.user.username, query.toLowerCase())) ||
      guild.members.find(m => includes(m.displayName, query.toLowerCase()));
  if (result) return result;
  throw `User not found: ${query}`;
};
