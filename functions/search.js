/* eslint-disable no-throw-literal */
class Search {
  constructor() {
    Object.defineProperty(this, "User", { value: Search.User });
    Object.defineProperty(this, "Channel", { value: Search.Channel });
    Object.defineProperty(this, "Role", { value: Search.Role });
  }

  static async Role(query, guild) {
    switch (query.constructor.name) {
      case "Role": return query;
      case "String": {
        if (/[0-9]{17,18}/.test(query)) {
          const ID = /[0-9]{17,18}/.exec(query)[0];
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
  }

  static async Channel(query, guild) {
    switch (query.constructor.name) {
      case "TextChannel": return query;
      case "String": {
        if (/[0-9]{17,18}/.test(query)) {
          const ID = /[0-9]{17,18}/.exec(query)[0];
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
  }

  static async User(query, guild, strict = false) {
    switch (query.constructor.name) {
      case "User": return query;
      case "GuildMember": return query.user;
      case "String": {
        if (/[0-9]{17,18}/.test(query)) {
          const ID = /[0-9]{17,18}/.exec(query)[0];
          return guild.client.fetchUser(ID).then(u => u).catch(() => { throw `User not found: ${query}`; });
        } else if (strict) {
          const result = guild.members.find(m => m.user.tag === query);
          if (result) return result.user;
          throw "You must provide an mention, ID, or full Discord tag";
        } else {
          const result = guild.members.find(m => m.user.tag === query) ||
            await Search.AdvancedUserSearch(query.toLowerCase(), guild).catch(() => { throw `User not found: ${query}`; });
          if (result) return result.user;
          throw `User not found: ${query}`;
        }
      }
      default: throw "Invalid input.";
    }
  }

  static async AdvancedUserSearch(query, guild) {
    const result = guild.members.find(m => m.user.username.toLowerCase() === query) ||
      guild.members.find(m => m.displayName.toLowerCase() === query) ||
      guild.members.find(m => m.user.username.toLowerCase().startsWith(query)) ||
      guild.members.find(m => m.displayName.toLowerCase().startsWith(query)) ||
      guild.members.find(m => m.user.username.toLowerCase().includes(query)) ||
      guild.members.find(m => m.displayName.toLowerCase().includes(query));
    if (result) return result;
    throw `User not found: ${query}`;
  }
}

exports.init = (client) => { client.search = new Search(client); };
