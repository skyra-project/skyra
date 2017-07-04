const ModLog = require("../utils/createModlog.js");

exports.run = (client, guild, user) => new ModLog(guild)
    .setUser(user)
    .setType("ban")
    .send()
    .catch(e => client.emit("log", e, "error"));
