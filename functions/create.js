const RethinkDB = require("./rethinkDB.js");

/* eslint-disable no-use-before-define */
class Create {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
  }

  async CreateGuild(guild) {
    const data = guildData(guild);
    await RethinkDB.add("guilds", data);
    this.client.guildCache.set(guild, data);
  }

  async CreateUser(user) {
    const data = userProfileData(user);
    await RethinkDB.add("users", data);
    this.client.cacheProfiles.set(user, data);
  }
}

exports.init = async (client) => {
  client.Create = Create;
  client.guildCache = new Map();
  client.cacheProfiles = new client.methods.Collection();
  const [guild, users] = await Promise.all([
    RethinkDB.all("guilds"),
    RethinkDB.all("users"),
  ]);
  guild.forEach(guildData => client.guildCache.set(guildData.id, guildData));
  users.forEach(userData => client.cacheProfiles.set(userData.id, userData));
};

const userProfileData = user => ({
  id: user,
  points: 0,
  color: "ff239d",
  money: 0,
  timeDaily: null,
  reputation: 0,
  quote: null,
  banners: {
    theme: "0001",
    level: "1001",
  },
});

const guildData = guild => ({
  id: guild,
  createdAt: Date.now(),
  roles: {
    admin: null,
    moderator: null,
    staff: null,
    muted: null,
  },
  channels: {
    log: null,
    mod: null,
    default: null,
    announcement: null,
    spam: null,
  },
  events: {
    channelCreate: false,
    guildBanAdd: false,
    guildBanRemove: false,
    guildMemberAdd: false,
    guildMemberRemove: false,
    guildMemberUpdate: false,
    messageDelete: false,
    messageDeleteBulk: false,
    messageUpdate: false,
    roleUpdate: false,
    commands: false,
    sendMessage: {
      greeting: false,
      farewell: false,
    },
  },
  mode: 0,
  prefix: "&",
  wordFilter: 0,
  selfmod: {
    inviteLinks: false,
    ghostmention: false,
  },
  ignoreChannels: [],
  disabledCommands: [],
  publicRoles: [],
  autoroles: [],
});
