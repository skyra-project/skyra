const GuildManager = require("../utils/guildManager");
const { GuildSetting } = require("../utils/guildSettings");

exports.conf = {
    type: "get",
    method: "settings",
    appliesTo: ["Guild"],
};

const init = (guild) => {
    const guildSetting = new GuildConfig(guild);
    GuildManager.set(guild, guildSetting);
    return guildSetting;
};

// eslint-disable-next-line func-names
exports.extend = function () {
    return GuildManager.get(this.id) || init(this);
};
