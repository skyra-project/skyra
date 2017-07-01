const GuildManager = require("../utils/guildManager");
const { GuildSetting, defaults } = require("../utils/guildSettings");

exports.conf = {
    type: "get",
    method: "settings",
    appliesTo: ["Guild"],
};

const init = (guild) => {
    const guildSetting = new GuildSetting(guild.id, Object.assign(defaults, { id: guild.id, exists: false }));
    GuildManager.set(guild.id, guildSetting);
    return guildSetting;
};

// eslint-disable-next-line func-names
exports.extend = function () {
    return GuildManager.get(this.id) || init(this);
};
