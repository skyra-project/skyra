const MANAGER_SOCIAL_GLOBAL = require("../utils/managerSocialGlobal");

exports.conf = {
  type: "get",
  method: "color",
  appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  let color;
  if (MANAGER_SOCIAL_GLOBAL.get(this.author.id)) {
    color = parseInt(`0x${MANAGER_SOCIAL_GLOBAL.get(this.author.id).color}`);
  } else if (this.guild) {
    if (!this.member) this.guild.fetchMember(this.author.id);
    else color = this.member.highestRole.color;
  }
  return color || 14671839;
};
