const MODERATION = require("../utils/managerModeration");

exports.run = (client, guild, user) => MODERATION.unknown(client, guild, user, "ban").catch(e => client.emit("log", e, "error"));
