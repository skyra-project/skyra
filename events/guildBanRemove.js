const MODERATION = require("../utils/managerModeration");

exports.run = (client, guild, user) => MODERATION.unknown(client, guild, user, "unban").catch(e => client.emit("log", e, "error"));
