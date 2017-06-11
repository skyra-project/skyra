const UserProfile = require("../utils/userProfile.js");

exports.conf = {
  type: "get",
  method: "profile",
  appliesTo: ["User"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return new UserProfile(this);
};
