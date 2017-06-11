const GuildConfigs = require("../utils/guildConfig.js");

exports.conf = {
  type: "get",
  method: "configs",
  appliesTo: ["Guild"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return new GuildConfigs(this);
};
