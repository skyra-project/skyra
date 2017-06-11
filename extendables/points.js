const MemberScore = require("../utils/memberScore.js");

exports.conf = {
  type: "get",
  method: "points",
  appliesTo: ["GuildMember"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return new MemberScore(this);
};
