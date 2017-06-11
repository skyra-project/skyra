const Moderation = require("../utils/moderation.js");

exports.conf = {
  type: "get",
  method: "moderation",
  appliesTo: ["Guild"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return new Moderation(this);
};
